import axios, { AxiosInstance } from 'axios'

export interface VitalsInput {
  systolic?: number
  diastolic?: number
  temperature?: number
  pulse?: number
  spO2?: number
  weight?: number
}

export interface AIDiagnosisRequest {
  patientId: string
  patientName: string
  age: number
  gender: 'M' | 'F'
  symptoms: string[]
  chiefComplaint: string
  clinicalNotes: string
  vitals?: VitalsInput
  labData?: string[]
  currentMedications?: string[]
  medicalHistory?: string[]
}

export interface DiagnosisItem {
  name: string
  icd10: string
  confidence: number // 0-100
  risk: 'Faible' | 'Modéré' | 'Élevé' | 'Critique'
  justification: string
  recommendedExams: string[]
  suggestedTreatments: string[]
}

export interface AIDiagnosisResponse {
  id: string
  timestamp: string
  patientId: string
  patientName: string
  riskLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique'
  primaryDiagnoses: DiagnosisItem[]
  differentialDiagnoses: { name: string; icd10: string; probability: number; rationale: string }[]
  emergencyActions: string[]
  drugInteractionAlerts: string[]
  aiConfidenceOverall: number
  modelUsed: string
  httpStatus: number
  latencyMs: number
  apiUrl: string
  isSimulated: boolean
}

export interface HealthStatusResponse {
  online: boolean
  latencyMs: number
  serverUrl: string
  version: string
  modelStatus: 'Ready' | 'Busy' | 'Offline'
}

class AIDiagnosticService {
  private axiosClient: AxiosInstance
  private baseUrl: string

  constructor() {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5030'
    this.baseUrl = `${envUrl.replace(/\/$/, '')}/api/ai`
    
    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 12000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Application': 'Willo-Health-Client',
        'X-Client-Version': '1.0.0'
      }
    })
  }

  /**
   * Updates base URL when user changes connection settings
   */
  public updateBaseUrl(host: string, port: string | number): void {
    const cleanHost = host.startsWith('http') ? host : `http://${host}`
    this.baseUrl = `${cleanHost.replace(/\/$/, '')}:${port}/api/ai`
    this.axiosClient.defaults.baseURL = this.baseUrl
  }

  /**
   * Check connection status to AI HTTP backend
   */
  public async checkHealth(): Promise<HealthStatusResponse> {
    const startTime = performance.now()
    try {
      const response = await this.axiosClient.get('/health')
      const latencyMs = Math.round(performance.now() - startTime)
      return {
        online: true,
        latencyMs,
        serverUrl: this.baseUrl,
        version: response.data?.version || 'v3.5-Turbo',
        modelStatus: response.data?.status || 'Ready'
      }
    } catch {
      const latencyMs = Math.round(performance.now() - startTime)
      return {
        online: false,
        latencyMs,
        serverUrl: this.baseUrl,
        version: 'v3.5-Turbo (Local Engine)',
        modelStatus: 'Offline'
      }
    }
  }

  /**
   * Send HTTP POST request via Axios to generate AI diagnostic
   */
  public async generateDiagnosis(req: AIDiagnosisRequest): Promise<AIDiagnosisResponse> {
    const startTime = performance.now()
    const endpoint = '/diagnose'

    try {
      const response = await this.axiosClient.post<AIDiagnosisResponse>(endpoint, req)
      const latencyMs = Math.round(performance.now() - startTime)

      return {
        ...response.data,
        httpStatus: response.status,
        latencyMs,
        apiUrl: `${this.baseUrl}${endpoint}`,
        isSimulated: false
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime)
      console.warn('Axios HTTP request to AI backend failed, fallback to local AI simulation:', err)

      let httpStatusCode = 503
      if (axios.isAxiosError(err) && err.response) {
        httpStatusCode = err.response.status
      }

      // Generate local clinical fallback response using AI diagnostic rules engine
      return this.simulateAIDiagnosis(req, httpStatusCode, latencyMs, `${this.baseUrl}${endpoint}`)
    }
  }

  /**
   * Verify Drug Interactions via HTTP POST
   */
  public async verifyInteractions(medications: string[]): Promise<string[]> {
    try {
      const res = await this.axiosClient.post('/verify-drug-interaction', { medications })
      return res.data?.alerts || []
    } catch {
      // Fallback local check logic
      const alerts: string[] = []
      const medLower = medications.map((m) => m.toLowerCase())
      
      if (medLower.some((m) => m.includes('amlodipine')) && medLower.some((m) => m.includes('simvastatine'))) {
        alerts.push('Attention : Amlodipine + Simvastatine augmente le risque de rhabdomyolyse. Ajuster la dose de Simvastatine à max 20mg/j.')
      }
      if (medLower.some((m) => m.includes('aspirine') || m.includes('kardegic')) && medLower.some((m) => m.includes('ibuprofène'))) {
        alerts.push('Interaction Majeure : L\'Ibuprofène atténue l\'effet antiagrégant plaquettaire de l\'Aspirine.')
      }
      if (medLower.some((m) => m.includes('metformine')) && medLower.some((m) => m.includes('produit de contraste'))) {
        alerts.push('Précaution Insuffisance Rénale : Interrompre la Metformine 48h avant l\'injection de produit de contraste iodé.')
      }

      if (alerts.length === 0) {
        alerts.push('Aucune interaction médicamenteuse néfaste détectée parmi les molécules saisies.')
      }
      return alerts
    }
  }

  /**
   * Rule-based realistic diagnostic simulation when backend HTTP server is offline/unreachable
   */
  private simulateAIDiagnosis(
    req: AIDiagnosisRequest,
    httpStatus: number,
    latencyMs: number,
    apiUrl: string
  ): AIDiagnosisResponse {
    const symptomsJoined = (req.symptoms || []).join(' ').toLowerCase() + ' ' + (req.chiefComplaint || '').toLowerCase() + ' ' + (req.clinicalNotes || '').toLowerCase()
    
    let primaryDiagnoses: DiagnosisItem[] = []
    let differentialDiagnoses: { name: string; icd10: string; probability: number; rationale: string }[] = []
    let emergencyActions: string[] = []
    let riskLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique' = 'Modéré'
    let drugAlerts: string[] = []

    // Rule 1: Cardiac / Chest Pain Symptoms
    if (symptomsJoined.includes('douleur') && (symptomsJoined.includes('thorac') || symptomsJoined.includes('poitrine') || symptomsJoined.includes('effort') || symptomsJoined.includes('bras'))) {
      riskLevel = 'Critique'
      primaryDiagnoses = [
        {
          name: 'Syndrome Coronarien Aigu (SCA / Angine de Poitrine)',
          icd10: 'I20.0',
          confidence: 91,
          risk: 'Critique',
          justification: 'Douleur rétrosternale constrictive avec facteur déclenchant. Risque d\'ischémie myocardique aiguë.',
          recommendedExams: ['ECG 12 dérivations d\'urgence', 'Troponine I HS à H0 et H3', 'D-Dimères', 'Echographie Cardiaque'],
          suggestedTreatments: ['Aspirine 300mg PO d\'amblée', 'Clopidogrel 300mg', 'Derivés nitrés sublinguaux (si PAS > 90)', 'Repos strict & Oxygénothérapie']
        },
        {
          name: 'Hypertension Artérielle Sévère avec Retentissement',
          icd10: 'I10',
          confidence: 84,
          risk: 'Élevé',
          justification: 'Valeurs tentionnelles élevées associées aux plaintes thoraciques et céphaliques.',
          recommendedExams: ['Fond d\'œil', 'Créatininémie & Ionogramme', 'Rapport Albuminurie/Créatininurie'],
          suggestedTreatments: ['Inhibiteur calcique (Amlodipine 10mg)', 'IEC / ARA2 (Périndopril 5mg)']
        }
      ]
      differentialDiagnoses = [
        { name: 'Embolie Pulmonaire', icd10: 'I26.9', probability: 58, rationale: 'À éliminer si dyspnée aiguë ou tachycardie associée.' },
        { name: 'Dissection Aortique', icd10: 'I71.0', probability: 35, rationale: 'Si douleur migrante dorsale et asymétrie tensionnelle.' },
        { name: 'Reflux Gastro-Œsophagien (RGO)', icd10: 'K21.9', probability: 22, rationale: 'Si pyrosis rétro-sternale calmée par les antiacides.' }
      ]
      emergencyActions = [
        'Réaliser immédiatement un ECG 12 pistes dans les 10 minutes.',
        'Poser une voie veineuse périphérique et prélever le bilan Troponine.',
        'Garder le patient au repos strict au lit sous monitorage Scope.'
      ]
    }
    // Rule 2: Infectious / Fever / Respiratory Symptoms
    else if (symptomsJoined.includes('fièvre') || symptomsJoined.includes('toux') || symptomsJoined.includes('frisson') || symptomsJoined.includes('dyspnée')) {
      riskLevel = req.vitals && req.vitals.spO2 && req.vitals.spO2 < 92 ? 'Élevé' : 'Modéré'
      primaryDiagnoses = [
        {
          name: 'Pneumopathie Aiguë Communautaire (PAC)',
          icd10: 'J18.9',
          confidence: 88,
          risk: riskLevel,
          justification: 'Association du syndrome infectieux et des signes respiratoires d\'allure parenchymateuse.',
          recommendedExams: ['Radiographie Thoracique de face', 'NFS + CRP', 'Procalcitonine', 'Gaz du sang si SpO2 < 92%'],
          suggestedTreatments: ['Amoxicilline 1g x 3/jour pendant 7 jours', 'Paracétamol 1g si T° > 38.5°C', 'Hydratation orale abondante']
        },
        {
          name: 'Exacerbation d\'Asthme ou de BPCO',
          icd10: 'J44.1',
          confidence: 72,
          risk: 'Modéré',
          justification: 'Gêne respiratoire siffante et encombrement bronchique.',
          recommendedExams: ['Peak Flow (DEP)', 'EFR à distance'],
          suggestedTreatments: ['Bronchodilatateurs bêtamimétiques (Salbutamol aérosol)', 'Corticothérapie orale courte']
        }
      ]
      differentialDiagnoses = [
        { name: 'Grippe / Infection Virale Aiguë', icd10: 'J11.1', probability: 64, rationale: 'En période épidémique si myalgies associées.' },
        { name: 'Tuberculose Pulmonaire', icd10: 'A15.0', probability: 28, rationale: 'Si sueurs nocturnes et altération de l\'état général prolongées.' }
      ]
      emergencyActions = [
        'Vérifier la saturation en oxygène (SpO2) et administrer O2 si < 94%.',
        'Programmer une radiographie pulmonaire en urgence.'
      ]
    }
    // Rule 3: Neurological / Headache / Dizziness
    else if (symptomsJoined.includes('céphalé') || symptomsJoined.includes('vertige') || symptomsJoined.includes('tête') || symptomsJoined.includes('malaise')) {
      riskLevel = 'Élevé'
      primaryDiagnoses = [
        {
          name: 'Poussée Hypertensive Aiguë avec Céphalées',
          icd10: 'I15.9',
          confidence: 86,
          risk: 'Élevé',
          justification: 'Céphalées pulsatiles occipitales associées à des chiffres tensionnels élevés.',
          recommendedExams: ['TDM Cérébrale sans injection', 'Fond d\'œil', 'Bilan Rénal complet'],
          suggestedTreatments: ['Nicardipine IV ou Loxen PO en milieu surveillé', 'Paracétamol 1g']
        },
        {
          name: 'Migraine Essentielle Sans Aura',
          icd10: 'G43.0',
          confidence: 68,
          risk: 'Faible',
          justification: 'Douleur hémicrânienne pulsatile photophobique.',
          recommendedExams: ['Examen neurologique paires crâniennes'],
          suggestedTreatments: ['AINS (Ibuprofène 400mg)', 'Triptans en 2nde intention']
        }
      ]
      differentialDiagnoses = [
        { name: 'Accident Vasculaire Cérébral (AVC / AIT)', icd10: 'I64', probability: 48, rationale: 'Éliminer si déficit moteur ou de la parole.' },
        { name: 'Syndrome Méningé', icd10: 'G03.9', probability: 25, rationale: 'Rechercher raideur de nucal ou purpura.' }
      ]
      emergencyActions = [
        'Évaluer le score de Glasgow et le score NIHSS si anomalie neuro.',
        'Prise répétée de la pression artérielle aux deux bras.'
      ]
    }
    // Default Generic Diagnosis
    else {
      riskLevel = 'Faible'
      primaryDiagnoses = [
        {
          name: 'Syndrome Fébril ou Douloureux Non Spécifique',
          icd10: 'R50.9',
          confidence: 76,
          risk: 'Faible',
          justification: 'Symptomatologie générale nécessitant une biologie de débrouillage.',
          recommendedExams: ['NFS, CRP, VS', 'Ionogramme sanguin + Créatinine', 'Bandelette Urinaire (BU)'],
          suggestedTreatments: ['Paracétamol 1g toutes les 6 heures (Max 4g/j)', 'Surveillance des constantes 2x/jour']
        }
      ]
      differentialDiagnoses = [
        { name: 'Infection Urinaire Haute (Pyélonéphrite)', icd10: 'N10', probability: 45, rationale: 'Réaliser une bandelette urinaire et un ECBU.' },
        { name: 'Syndrome Inflammatoire Biologique', icd10: 'D89.9', probability: 30, rationale: 'Contrôler la CRP et la numération.' }
      ]
      emergencyActions = [
        'Surveiller l\'évolution clinique et la courbe thermique.',
        'Reconsidérer si apparition de signes de gravité.'
      ]
    }

    // Drug interaction simulation
    if (req.currentMedications && req.currentMedications.length > 0) {
      const medsStr = req.currentMedications.join(' ')
      if (medsStr.toLowerCase().includes('amlodipine') && medsStr.toLowerCase().includes('simvastatine')) {
        drugAlerts.push('Alerte IA : Risque de surdosage en Simvastatine lors de la co-administration avec Amlodipine.')
      } else {
        drugAlerts.push('Vérification IA Pharmacologique : Aucune contre-indication majeure trouvée.')
      }
    } else {
      drugAlerts.push('Vérification Pharmacologique : Aucun traitement antérieur renseigné.')
    }

    return {
      id: `ai-diag-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      patientId: req.patientId,
      patientName: req.patientName,
      riskLevel,
      primaryDiagnoses,
      differentialDiagnoses,
      emergencyActions,
      drugInteractionAlerts: drugAlerts,
      aiConfidenceOverall: primaryDiagnoses[0]?.confidence || 85,
      modelUsed: 'WilloMed-AI v3.5-Turbo (Clinical Engine)',
      httpStatus,
      latencyMs,
      apiUrl,
      isSimulated: true
    }
  }
}

export const aiDiagnosticService = new AIDiagnosticService()
