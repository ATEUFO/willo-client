import axios, { AxiosInstance } from 'axios'

export type AIModelId =
  | 'sepsis-risk-v1'
  | 'malaria-risk-v1'
  | 'readmission-risk-v1'
  | 'cardiovascular-risk-v1'
  | 'lab-anomaly-detection-v1'

export interface AIModelMeta {
  nomModele: AIModelId
  version: string
  description: string
  snomedCode: string
  features: string[]
}

export interface FacteurContributif {
  feature: string
  valeur: number
  impact: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  explication: string
}

export interface ConditionRiskAssessment {
  id: 'paludisme' | 'avc' | 'crise_cardiaque' | 'sepsis' | 'rehospitalisation' | 'anomalies_bio' | string
  title: string
  subtitle: string
  snomedCode: string
  scoreProbabilite: number // 0.0 - 1.0
  niveauRisque: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  intituleDiagnostic: string
  facteursContributifs: FacteurContributif[]
  recommandations: string[]
}

export interface PredictionDetails {
  scoreProbabilite: number // 0.0 - 1.0
  niveauRisque: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  intituleDiagnostic: string
  facteursContributifs: FacteurContributif[]
  recommandations: string[]
  conditions?: ConditionRiskAssessment[]
}

export interface AIPredictionRequest {
  nomModele?: string
  patientId: string
  encounterId?: string
  features: Record<string, number>
  observationIds?: string[]
}

export interface AIPredictionResponse {
  success: boolean
  inferenceId: string
  timestamp: string
  nomModele: string
  modelVersion: string
  patientId: string
  prediction: PredictionDetails
  fhirResource?: any
  httpStatus?: number
  latencyMs?: number
  apiUrl?: string
}

export interface HealthStatusResponse {
  online: boolean
  latencyMs: number
  serverUrl: string
  version: string
  modelsLoaded: number
  modelStatus: 'Ready' | 'Busy' | 'Offline'
}

export const AI_MODELS_CATALOG: { id: AIModelId; title: string; subtitle: string; icon: string; snomed: string }[] = [
  {
    id: 'sepsis-risk-v1',
    title: 'Risque Sepsis / Choc Septique',
    subtitle: 'Évaluation SIRS / qSOFA, risque défaillance d\'organes',
    icon: 'Activity',
    snomed: '91302008'
  },
  {
    id: 'malaria-risk-v1',
    title: 'Dépistage, Probabilité Paludisme',
    subtitle: 'Analyse TDR Paludisme, hématologie, syndrome fébril',
    icon: 'Bug',
    snomed: '61462000'
  },
  {
    id: 'readmission-risk-v1',
    title: 'Risque Réhospitalisation (30 Jours)',
    subtitle: 'Évaluation fragilité clinique, réhospitalisation post-sortie',
    icon: 'History',
    snomed: '410605003'
  },
  {
    id: 'cardiovascular-risk-v1',
    title: 'Risque Cardiovasculaire, Hypertension',
    subtitle: 'Décompensation tentionnelle, BMI, métabolisme lipidique',
    icon: 'HeartPulse',
    snomed: '49436004'
  },
  {
    id: 'lab-anomaly-detection-v1',
    title: 'Anomalies Biologiques Multi-organes',
    subtitle: 'Dysfonction rénale, hépatique, ionique, hématologique',
    icon: 'FlaskConical',
    snomed: '166312007'
  }
]

function formatErrorForLog(err: any): string {
  if (!err) return 'Erreur inconnue'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  if (err.response?.data?.detail) return String(err.response.data.detail)
  if (err.code) return `Code d'erreur: ${err.code}`
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

function logAI(msg: string, data?: any) {
  const formattedData = data instanceof Error || (data && typeof data === 'object' && ('message' in data || 'code' in data))
    ? formatErrorForLog(data)
    : data

  console.log(msg, formattedData !== undefined ? formattedData : '')
  try {
    if (typeof window !== 'undefined' && (window as any).api?.terminalLog) {
      ;(window as any).api.terminalLog(msg, formattedData)
    }
  } catch {
    // Ignore non-electron fallback
  }
}

class AIDiagnosticService {
  private targetHost: string = ''
  private gatewayUrl: string = ''
  private directUrl: string = ''
  private axiosGatewayClient: AxiosInstance

  constructor() {
    this.axiosGatewayClient = axios.create({
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Log all AI Gateway HTTP requests and responses for debugging
    this.axiosGatewayClient.interceptors.request.use((config) => {
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`
      logAI(`📡 [AI HTTP REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`, config.data ? { payload: config.data } : '')
      ;(config as any).meta = { startTime: performance.now() }
      return config
    })

    this.axiosGatewayClient.interceptors.response.use((response) => {
      const startTime = (response.config as any).meta?.startTime || performance.now()
      const latency = Math.round(performance.now() - startTime)
      const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`
      logAI(`✅ [AI HTTP RESPONSE ${response.status}] ${response.config.method?.toUpperCase()} ${fullUrl} (${latency}ms)`, response.data)
      return response
    }, (error) => {
      const config = error.config || {}
      const startTime = (config as any).meta?.startTime || performance.now()
      const latency = Math.round(performance.now() - startTime)
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`
      const status = error.response?.status ? `HTTP ${error.response.status}` : 'NETWORK_ERROR'
      logAI(`❌ [AI HTTP ERROR - ${status}] ${config.method?.toUpperCase()} ${fullUrl} (${latency}ms):`, error.response?.data || error.message)
      return Promise.reject(error)
    })

    this.resolveServerConfig()
  }

  /**
   * Dynamically fetch and resolve the active server host and port from Electron Store sync config
   */
  public async resolveServerConfig(): Promise<{ host: string; port: string }> {
    let host = ''
    let port = '5030'

    try {
      if (typeof window !== 'undefined' && (window as any).api?.sync?.getServerConfig) {
        const config = await (window as any).api.sync.getServerConfig()
        if (config?.host) {
          host = config.host
          port = config.port || '5030'
        }
      }
    } catch {
      // Fallback
    }

    if (!host) {
      if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost') {
        host = window.location.hostname
      } else {
        host = '127.0.0.1'
      }
    }

    this.updateBaseUrl(host, port)
    return { host: this.targetHost, port }
  }

  public updateBaseUrl(host: string, port: string | number): void {
    let cleanHost = host.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
    if (!cleanHost) cleanHost = '127.0.0.1'
    const cleanPort = String(port).trim() || '5030'

    this.targetHost = cleanHost
    this.gatewayUrl = `http://${cleanHost}:${cleanPort}/api/diagnosis`
    this.directUrl = `http://${cleanHost}:3007`
    this.axiosGatewayClient.defaults.baseURL = this.gatewayUrl
  }

  /**
   * Health check attempting Gateway proxy first, then Direct microservice on the same target host
   */
  public async checkHealth(): Promise<HealthStatusResponse> {
    await this.resolveServerConfig()

    // 1. Primary Attempt: Electron Main process IPC (Node.js network socket, bypasses CORS completely)
    if (typeof window !== 'undefined' && (window as any).api?.ai?.checkHealth) {
      try {
        logAI('📡 [AI HEALTH REQUEST (IPC)] Checking AI service via Node.js Main Process...')
        const res = await (window as any).api.ai.checkHealth()
        logAI('✅ [AI HEALTH RESPONSE (IPC)]', res)
        return res
      } catch (errIpc) {
        logAI('⚠️ Main process IPC health check failed, trying renderer HTTP fallback...', formatErrorForLog(errIpc))
      }
    }

    const startTime = performance.now()
    // 2. Secondary Attempt: API Gateway Proxy via Renderer HTTP
    try {
      logAI(`📡 [AI HEALTH REQUEST] Checking Gateway Proxy: ${this.gatewayUrl}/health`)
      const respProxy = await this.axiosGatewayClient.get('/health')
      const latencyMs = Math.round(performance.now() - startTime)
      logAI('✅ [AI HEALTH RESPONSE (GATEWAY)]', respProxy.data)

      return {
        online: true,
        latencyMs,
        serverUrl: this.gatewayUrl,
        version: respProxy.data?.service || 'ai-diagnosis-service',
        modelsLoaded: respProxy.data?.models_loaded || 5,
        modelStatus: 'Ready'
      }
    } catch (errProxy) {
      logAI('⚠️ Gateway proxy health check failed, checking direct AI service on target host...', formatErrorForLog(errProxy))

      try {
        logAI(`📡 [AI HEALTH REQUEST] Checking Direct AI Service: ${this.directUrl}/health`)
        const resp = await axios.get(`${this.directUrl}/health`, { timeout: 3000 })
        const latencyMs = Math.round(performance.now() - startTime)
        logAI('✅ [AI HEALTH RESPONSE (DIRECT)]', resp.data)

        return {
          online: true,
          latencyMs,
          serverUrl: this.directUrl,
          version: resp.data?.service || 'ai-diagnosis-service',
          modelsLoaded: resp.data?.models_loaded || 5,
          modelStatus: 'Ready'
        }
      } catch (errDirect) {
        logAI('❌ [AI HEALTH ERROR] Both Gateway proxy and direct AI service offline', formatErrorForLog(errDirect))
        const latencyMs = Math.round(performance.now() - startTime)

        return {
          online: false,
          latencyMs,
          serverUrl: this.gatewayUrl,
          version: 'Offline',
          modelsLoaded: 0,
          modelStatus: 'Offline'
        }
      }
    }
  }

  /**
   * Fetch available models list from API Gateway or Direct service on active server
   */
  public async getModels(): Promise<AIModelMeta[]> {
    await this.resolveServerConfig()
    
    if (typeof window !== 'undefined' && (window as any).api?.ai?.getModels) {
      try {
        logAI('📡 [AI MODELS REQUEST (IPC)] Fetching available models via Main Process IPC...')
        const models = await (window as any).api.ai.getModels()
        logAI('✅ [AI MODELS RESPONSE (IPC)]', models)
        return models || []
      } catch (errIpc) {
        logAI('⚠️ IPC models fetch failed, using HTTP fallback...', formatErrorForLog(errIpc))
      }
    }

    logAI('📡 [AI MODELS REQUEST] Fetching available models list from active server:', this.gatewayUrl)

    try {
      const resProxy = await this.axiosGatewayClient.get('/models')
      logAI('✅ [AI MODELS RESPONSE (GATEWAY)]', resProxy.data)
      return resProxy.data?.models || []
    } catch (errProxy) {
      logAI('⚠️ Gateway models fetch failed, trying direct AI service...', formatErrorForLog(errProxy))

      try {
        const res = await axios.get(`${this.directUrl}/models`, { timeout: 3000 })
        logAI('✅ [AI MODELS RESPONSE (DIRECT)]', res.data)
        return res.data?.models || []
      } catch (err) {
        logAI('❌ [AI MODELS ERROR] Failed to load models list:', formatErrorForLog(err))
        throw err
      }
    }
  }

  /**
   * Send prediction request: API Gateway FIRST, then Direct AI Service fallback on target host
   */
  public async predict(req: AIPredictionRequest): Promise<AIPredictionResponse> {
    await this.resolveServerConfig()

    // Primary: IPC Main process (Node.js network socket)
    if (typeof window !== 'undefined' && (window as any).api?.ai?.predict) {
      try {
        logAI('📡 [AI API REQUEST (IPC)] Sending inference request via Node.js Main Process:', req)
        const response = await (window as any).api.ai.predict(req)
        logAI('✅ [AI API RESPONSE (IPC)]', response)
        // Ensure conditions field is populated for multi-risk evaluation UI
        if (response && response.prediction && !response.prediction.conditions) {
          const multi = computeMultiConditionPrediction(req.features, req.patientId)
          response.prediction.conditions = multi.prediction.conditions
        }
        return response
      } catch (errIpc) {
        logAI('⚠️ Main process IPC predict failed, trying renderer HTTP fallback...', formatErrorForLog(errIpc))
      }
    }

    const startTime = performance.now()

    // Secondary: Renderer HTTP Gateway
    try {
      const targetUrl = `${this.gatewayUrl}/predict`
      logAI('📡 [AI API REQUEST (GATEWAY)]', { url: targetUrl, method: 'POST', payload: req })

      const response = await this.axiosGatewayClient.post<AIPredictionResponse>('/predict', req)
      const latencyMs = Math.round(performance.now() - startTime)

      logAI('✅ [AI API RESPONSE (GATEWAY)]', { status: response.status, latencyMs, data: response.data })

      const result = {
        ...response.data,
        httpStatus: response.status,
        latencyMs,
        apiUrl: targetUrl
      }

      if (result.prediction && !result.prediction.conditions) {
        const multi = computeMultiConditionPrediction(req.features, req.patientId)
        result.prediction.conditions = multi.prediction.conditions
      }

      return result
    } catch (errGateway) {
      logAI(`⚠️ API Gateway request failed, attempting Direct AI Microservice (${this.directUrl}/predict)...`, formatErrorForLog(errGateway))

      try {
        const targetUrl = `${this.directUrl}/predict`
        logAI('📡 [AI API REQUEST (DIRECT)]', { url: targetUrl, method: 'POST', payload: req })

        const response = await axios.post<AIPredictionResponse>(targetUrl, req, {
          timeout: 8000,
          headers: { 'Content-Type': 'application/json' }
        })
        const latencyMs = Math.round(performance.now() - startTime)

        logAI('✅ [AI API RESPONSE (DIRECT)]', { status: response.status, latencyMs, data: response.data })

        const result = {
          ...response.data,
          httpStatus: response.status,
          latencyMs,
          apiUrl: targetUrl
        }

        if (result.prediction && !result.prediction.conditions) {
          const multi = computeMultiConditionPrediction(req.features, req.patientId)
          result.prediction.conditions = multi.prediction.conditions
        }

        return result
      } catch (errDirect) {
        logAI('⚡ [AI API FALLBACK] Server offline - Executing local multi-condition clinical evaluation engine')
        return computeMultiConditionPrediction(req.features, req.patientId)
      }
    }
  }
}

export function computeMultiConditionPrediction(features: Record<string, number>, patientId: string): AIPredictionResponse {
  const temp = features.temperature || 37.0
  const sys = features.pressionSystolique || features.systolic || 120
  const dia = features.pressionDiastolique || features.diastolic || 80
  const pulse = features.frequenceCardiaque || features.pulse || 75
  const spO2 = features.saturationO2 || features.spO2 || 98
  const age = features.age || 35

  // 1. Paludisme (Malaria)
  let paluRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let paluScore = 0.12
  let paluTitle = 'Absence de Syndrome Fébril Palustre'
  if (temp > 38.5) {
    paluRisk = 'HIGH'
    paluScore = 0.88
    paluTitle = 'Forte Suspicion de Paludisme (Syndrome Fébril Aigu)'
  } else if (temp > 37.5) {
    paluRisk = 'MODERATE'
    paluScore = 0.58
    paluTitle = 'Fièvre Modérée / Suspicion Paludisme à Confirmer'
  }

  const paluCondition: ConditionRiskAssessment = {
    id: 'paludisme',
    title: 'Dépistage & Probabilité Paludisme',
    subtitle: 'Analyse TDR Paludisme, hématologie, syndrome fébril',
    snomedCode: '61462000',
    scoreProbabilite: paluScore,
    niveauRisque: paluRisk,
    intituleDiagnostic: paluTitle,
    facteursContributifs: [
      { feature: 'Température corporelle', valeur: temp, impact: temp > 38.5 ? 'HIGH' : 'LOW', explication: `Température mesurée à ${temp}°C` },
      { feature: 'Zone d\'endémie palustre', valeur: 1.0, impact: 'MODERATE', explication: 'Exposition en zone tropicale sub-saharienne' }
    ],
    recommandations: temp > 37.5 ? [
      'Réaliser un Test de Dépistage Rapide (TDR) Paludisme ou Goutte Épaisse sous 2h',
      'Si TDR+, initier traitement par Combinaison à base d\'Artémisine (CTA / Artéméther-Luméfantrine)',
      'Surveiller l\'évolution de la température et l\'état de conscience'
    ] : [
      'Pas de signe d\'accès palustre aigu à la prise de température.'
    ]
  }

  // 2. Accident Vasculaire Cérébral (AVC / Stroke)
  let avcRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let avcScore = 0.15
  let avcTitle = 'Profil Hémodynamique Cérébral Normal'
  if (sys > 170 || dia > 105) {
    avcRisk = 'CRITICAL'
    avcScore = 0.89
    avcTitle = 'Risque AVC Majeur (Urgence Hypertensive Sévère)'
  } else if (sys > 140 || dia > 90) {
    avcRisk = 'HIGH'
    avcScore = 0.72
    avcTitle = 'Risque Ischémique / Hypertensif Élevé'
  } else if (sys > 130 || age > 60) {
    avcRisk = 'MODERATE'
    avcScore = 0.45
    avcTitle = 'Risque Vascularisé Modéré'
  }

  const avcCondition: ConditionRiskAssessment = {
    id: 'avc',
    title: 'Risque Accident Vasculaire Cérébral (AVC)',
    subtitle: 'Évaluation hémodynamique, pression artérielle et score ischémique',
    snomedCode: '230690007',
    scoreProbabilite: avcScore,
    niveauRisque: avcRisk,
    intituleDiagnostic: avcTitle,
    facteursContributifs: [
      { feature: 'Tension Artérielle Systolique', valeur: sys, impact: sys > 140 ? 'HIGH' : 'LOW', explication: `Systolique à ${sys} mmHg` },
      { feature: 'Tension Artérielle Diastolique', valeur: dia, impact: dia > 90 ? 'HIGH' : 'LOW', explication: `Diastolique à ${dia} mmHg` },
      { feature: 'Âge du patient', valeur: age, impact: age > 55 ? 'MODERATE' : 'LOW', explication: `Âge actuel : ${age} ans` }
    ],
    recommandations: sys > 140 ? [
      'Réaliser un examen neurologique rapide (Score FAST / NIHSS)',
      'Contrôle immédiat de la pression artérielle et surveillance en scope',
      'Scanner cérébral sans injection en urgence si déficit moteur/sensitif'
    ] : [
      'Pression artérielle sous les seuils d\'alerte hypertensive.'
    ]
  }

  // 3. Crise Cardiaque / Infarctus du Myocarde
  let cardioRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let cardioScore = 0.10
  let cardioTitle = 'Fréquence & Rythme Cardiaque Réguliers'
  if (pulse > 115 || (sys > 160 && pulse > 100)) {
    cardioRisk = 'CRITICAL'
    cardioScore = 0.85
    cardioTitle = 'Alerte Crise Cardiaque / Tachycardie Sévère'
  } else if (pulse > 95 || sys > 145) {
    cardioRisk = 'HIGH'
    cardioScore = 0.68
    cardioTitle = 'Suspicion Cardiovasculaire / Stress Myocardique'
  } else if (pulse > 85 || age > 50) {
    cardioRisk = 'MODERATE'
    cardioScore = 0.42
    cardioTitle = 'Vigilance Cardiaque Modérée'
  }

  const cardioCondition: ConditionRiskAssessment = {
    id: 'crise_cardiaque',
    title: 'Risque Cardiovasculaire & Crise Cardiaque',
    subtitle: 'Évaluation myocarde, coronaires et tachycardie',
    snomedCode: '22298006',
    scoreProbabilite: cardioScore,
    niveauRisque: cardioRisk,
    intituleDiagnostic: cardioTitle,
    facteursContributifs: [
      { feature: 'Pouls / Fréquence Cardiaque', valeur: pulse, impact: pulse > 95 ? 'HIGH' : 'LOW', explication: `Rythme cardiaque à ${pulse} bpm` },
      { feature: 'Tension Systolique', valeur: sys, impact: sys > 140 ? 'HIGH' : 'LOW', explication: `Tension à ${sys} mmHg` }
    ],
    recommandations: pulse > 95 || sys > 140 ? [
      'Réaliser un ECG 12 dérivations dans les 10 minutes',
      'Dosage sanguin des marqueurs myocardiques (Troponine I / T hypersensible)',
      'Repos strict au lit et surveillance de la saturation en oxygène'
    ] : [
      'Paramètres hémodynamiques stables.'
    ]
  }

  // 4. Sepsis / Choc Septique
  let sepsisRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let sepsisScore = 0.08
  let sepsisTitle = 'Absence de Critères SIRS / qSOFA'
  if (temp > 38.5 && pulse > 100 && spO2 < 95) {
    sepsisRisk = 'CRITICAL'
    sepsisScore = 0.91
    sepsisTitle = 'Alerte Sepsis Sévère / Défaillance Viscérale'
  } else if (temp > 38.0 && pulse > 90) {
    sepsisRisk = 'HIGH'
    sepsisScore = 0.74
    sepsisTitle = 'SIRS Positif - Risque Sepsis Élevé'
  } else if (temp > 37.5 || pulse > 85) {
    sepsisRisk = 'MODERATE'
    sepsisScore = 0.38
    sepsisTitle = 'Critères Inflammatoires Modérés'
  }

  const sepsisCondition: ConditionRiskAssessment = {
    id: 'sepsis',
    title: 'Risque Sepsis & Choc Septique',
    subtitle: 'Évaluation critères SIRS / qSOFA et défaillance multi-viscérale',
    snomedCode: '91302008',
    scoreProbabilite: sepsisScore,
    niveauRisque: sepsisRisk,
    intituleDiagnostic: sepsisTitle,
    facteursContributifs: [
      { feature: 'Température', valeur: temp, impact: temp > 38.0 ? 'HIGH' : 'LOW', explication: `Température : ${temp}°C` },
      { feature: 'Saturation SpO2', valeur: spO2, impact: spO2 < 95 ? 'CRITICAL' : 'LOW', explication: `SpO2 : ${spO2}%` }
    ],
    recommandations: sepsisRisk === 'CRITICAL' || sepsisRisk === 'HIGH' ? [
      'Bilan bactériologique complet (2 séries d\'hémocultures)',
      'Antibiothérapie à large spectre injectable à débuter dans l\'heure',
      'Remplissage vasculaire par cristalloïdes (30 ml/kg)'
    ] : [
      'Aucun signe de défaillance systémique septique.'
    ]
  }

  // 5. Risque Réhospitalisation 30 Jours
  let rehospiRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let rehospiScore = 0.18
  let rehospiTitle = 'Profil Clinique Stable à Faible Risque'
  if (age > 70 || (temp > 38 && sys > 150)) {
    rehospiRisk = 'HIGH'
    rehospiScore = 0.71
    rehospiTitle = 'Fragilité Clinique Élevée (Risque Réhospitalisation)'
  } else if (age > 50 || temp > 37.8 || sys > 135) {
    rehospiRisk = 'MODERATE'
    rehospiScore = 0.46
    rehospiTitle = 'Vigilance Suivi Post-Consultation Recommandée'
  }

  const rehospiCondition: ConditionRiskAssessment = {
    id: 'rehospitalisation',
    title: 'Risque Réhospitalisation (30 Jours)',
    subtitle: 'Évaluation fragilité, âge et comorbidités',
    snomedCode: '410605003',
    scoreProbabilite: rehospiScore,
    niveauRisque: rehospiRisk,
    intituleDiagnostic: rehospiTitle,
    facteursContributifs: [
      { feature: 'Âge du Patient', valeur: age, impact: age > 65 ? 'MODERATE' : 'LOW', explication: `Âge : ${age} ans` }
    ],
    recommandations: rehospiRisk !== 'LOW' ? [
      'Programmer une consultation de suivi post-soins à J+7',
      'Vérifier la bonne compréhension de l\'ordonnance et l\'observance',
      'Coordonner les soins à domicile si nécessaire'
    ] : [
      'Faible risque de réhospitalisation précoce.'
    ]
  }

  // 6. Anomalies Biologiques Multi-organes
  let bioRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let bioScore = 0.14
  let bioTitle = 'Fonctions Viscérales dans les Plages Normales'
  if (spO2 < 93) {
    bioRisk = 'HIGH'
    bioScore = 0.79
    bioTitle = 'Hypoxémie Sévère & Risque Souffrance Tissulaire'
  } else if (spO2 < 95) {
    bioRisk = 'MODERATE'
    bioScore = 0.52
    bioTitle = 'Légère Hypoxie à Surveiller'
  }

  const bioCondition: ConditionRiskAssessment = {
    id: 'anomalies_bio',
    title: 'Anomalies Biologiques & Viscérales',
    subtitle: 'Évaluation oxygénation tissulaire et dysfonction d\'organe',
    snomedCode: '166312007',
    scoreProbabilite: bioScore,
    niveauRisque: bioRisk,
    intituleDiagnostic: bioTitle,
    facteursContributifs: [
      { feature: 'Saturation SpO2', valeur: spO2, impact: spO2 < 95 ? 'HIGH' : 'LOW', explication: `Saturation mesurée à ${spO2}%` }
    ],
    recommandations: spO2 < 95 ? [
      'Mettre en place une oxygénothérapie au masque à haut débit',
      'Réaliser une gazométrie artérielle et bilan rénal/hépatique'
    ] : [
      'Oxygénation et constantes métaboliques satisfaisantes.'
    ]
  }

  const allConditions = [paluCondition, avcCondition, cardioCondition, sepsisCondition, rehospiCondition, bioCondition]

  const riskLevelsPriority = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 }
  let maxPriority = 1
  let globalRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
  let maxScore = 0.15

  allConditions.forEach((c) => {
    const p = riskLevelsPriority[c.niveauRisque] || 1
    if (p > maxPriority) {
      maxPriority = p
      globalRisk = c.niveauRisque
    }
    if (c.scoreProbabilite > maxScore) {
      maxScore = c.scoreProbabilite
    }
  })

  const combinedFactors: FacteurContributif[] = []
  const combinedRecs: string[] = []

  allConditions.forEach((c) => {
    if (c.niveauRisque !== 'LOW') {
      c.facteursContributifs.forEach((f) => combinedFactors.push(f))
      c.recommandations.forEach((r) => {
        if (!combinedRecs.includes(r)) combinedRecs.push(r)
      })
    }
  })

  if (combinedRecs.length === 0) {
    combinedRecs.push('Toutes les constantes sont dans la norme. Poursuivre le suivi médical habituel.')
  }

  return {
    success: true,
    inferenceId: `INF-MULTI-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    nomModele: 'Évaluation Diagnostique Multi-Pathologies',
    modelVersion: 'v2.0-multi',
    patientId,
    prediction: {
      scoreProbabilite: maxScore,
      niveauRisque: globalRisk,
      intituleDiagnostic: `Synthèse Diagnostique Clinique Multi-Pathologies (6 Pathologies Évaluées)`,
      facteursContributifs: combinedFactors.length > 0 ? combinedFactors : paluCondition.facteursContributifs,
      recommandations: combinedRecs,
      conditions: allConditions
    }
  }
}
export const aiDiagnosticService = new AIDiagnosticService()
