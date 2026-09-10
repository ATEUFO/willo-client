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

export interface PredictionDetails {
  scoreProbabilite: number // 0.0 - 1.0
  niveauRisque: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  intituleDiagnostic: string
  facteursContributifs: FacteurContributif[]
  recommandations: string[]
}

export interface AIPredictionRequest {
  nomModele: AIModelId
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

function logAI(msg: string, data?: any) {
  console.log(msg, data !== undefined ? data : '')
  try {
    if (typeof window !== 'undefined' && (window as any).api?.terminalLog) {
      ;(window as any).api.terminalLog(msg, data)
    }
  } catch {
    // Ignore non-electron fallback
  }
}

class AIDiagnosticService {
  private axiosGatewayClient: AxiosInstance
  private gatewayUrl: string
  private directUrl: string

  constructor() {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5030'
    this.gatewayUrl = `${envUrl.replace(/\/$/, '')}/api/diagnosis`
    this.directUrl = 'http://localhost:3007'

    this.axiosGatewayClient = axios.create({
      baseURL: this.gatewayUrl,
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  public updateBaseUrl(host: string, port: string | number): void {
    const cleanHost = host.startsWith('http') ? host : `http://${host}`
    this.gatewayUrl = `${cleanHost.replace(/\/$/, '')}:${port}/api/diagnosis`
    this.axiosGatewayClient.defaults.baseURL = this.gatewayUrl
  }

  /**
   * Health check attempting Gateway proxy (5030) or Direct service (3007)
   */
  public async checkHealth(): Promise<HealthStatusResponse> {
    const startTime = performance.now()

    // 1. Try Direct port 3007 first
    try {
      logAI('📡 [AI HEALTH REQUEST] Checking http://localhost:3007/health')
      const resp = await axios.get(`${this.directUrl}/health`, { timeout: 3000 })
      const latencyMs = Math.round(performance.now() - startTime)
      logAI('✅ [AI HEALTH RESPONSE]', resp.data)

      return {
        online: true,
        latencyMs,
        serverUrl: this.directUrl,
        version: resp.data?.service || 'ai-diagnosis-service',
        modelsLoaded: resp.data?.models_loaded || 5,
        modelStatus: 'Ready'
      }
    } catch (errDirect) {
      logAI('⚠️ Direct port 3007 check failed, checking gateway proxy...', errDirect)

      // 2. Try Nginx Gateway Proxy (/api/diagnosis/health)
      try {
        logAI(`📡 [AI HEALTH REQUEST] Checking ${this.gatewayUrl}/health`)
        const respProxy = await this.axiosGatewayClient.get('/health')
        const latencyMs = Math.round(performance.now() - startTime)
        logAI('✅ [AI HEALTH RESPONSE]', respProxy.data)

        return {
          online: true,
          latencyMs,
          serverUrl: this.gatewayUrl,
          version: respProxy.data?.service || 'ai-diagnosis-service',
          modelsLoaded: respProxy.data?.models_loaded || 5,
          modelStatus: 'Ready'
        }
      } catch (errProxy) {
        logAI('❌ [AI HEALTH ERROR] Both direct port 3007 and gateway offline', errProxy)
        const latencyMs = Math.round(performance.now() - startTime)

        return {
          online: false,
          latencyMs,
          serverUrl: this.directUrl,
          version: 'Offline',
          modelsLoaded: 0,
          modelStatus: 'Offline'
        }
      }
    }
  }

  /**
   * Fetch available models list from API
   */
  public async getModels(): Promise<AIModelMeta[]> {
    logAI('📡 [AI MODELS REQUEST] Fetching available models list')
    try {
      const res = await axios.get(`${this.directUrl}/models`, { timeout: 3000 })
      logAI('✅ [AI MODELS RESPONSE]', res.data)
      return res.data?.models || []
    } catch {
      try {
        const resProxy = await this.axiosGatewayClient.get('/models')
        logAI('✅ [AI MODELS RESPONSE]', resProxy.data)
        return resProxy.data?.models || []
      } catch (err) {
        logAI('❌ [AI MODELS ERROR]', err)
        throw err
      }
    }
  }

  /**
   * Send real prediction request to API (Port 3007 / Gateway 5030) with strict logging
   */
  public async predict(req: AIPredictionRequest): Promise<AIPredictionResponse> {
    const startTime = performance.now()

    // 1. Try Direct Python FastAPI port 3007: POST http://localhost:3007/predict
    try {
      const targetUrl = `${this.directUrl}/predict`
      logAI('📡 [AI API REQUEST]', { url: targetUrl, method: 'POST', payload: req })

      const response = await axios.post<AIPredictionResponse>(targetUrl, req, {
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      })
      const latencyMs = Math.round(performance.now() - startTime)

      logAI('✅ [AI API RESPONSE]', { status: response.status, latencyMs, data: response.data })

      return {
        ...response.data,
        httpStatus: response.status,
        latencyMs,
        apiUrl: targetUrl
      }
    } catch (errDirect) {
      logAI('⚠️ Direct call to port 3007 failed, attempting gateway proxy...', errDirect)

      // 2. Try Gateway Proxy: POST /api/diagnosis/predict (Port 5030)
      try {
        const targetUrl = `${this.gatewayUrl}/predict`
        logAI('📡 [AI API REQUEST (PROXY)]', { url: targetUrl, method: 'POST', payload: req })

        const response = await this.axiosGatewayClient.post<AIPredictionResponse>('/predict', req)
        const latencyMs = Math.round(performance.now() - startTime)

        logAI('✅ [AI API RESPONSE (PROXY)]', { status: response.status, latencyMs, data: response.data })

        return {
          ...response.data,
          httpStatus: response.status,
          latencyMs,
          apiUrl: targetUrl
        }
      } catch (errProxy) {
        logAI('❌ [AI API ERROR] Inferences failed on port 3007 and proxy:', errProxy)
        throw errProxy
      }
    }
  }
}

export const aiDiagnosticService = new AIDiagnosticService()
