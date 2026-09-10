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
  private gatewayUrl: string
  private directUrl: string
  private directIpUrl: string
  private axiosGatewayClient: AxiosInstance

  constructor() {
    const envUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5030'
    this.gatewayUrl = `${envUrl.replace(/\/$/, '')}/api/diagnosis`
    this.directIpUrl = 'http://127.0.0.1:3007'
    this.directUrl = 'http://localhost:3007'

    this.axiosGatewayClient = axios.create({
      baseURL: this.gatewayUrl,
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.initDynamicConfig()
  }

  private async initDynamicConfig() {
    try {
      if (typeof window !== 'undefined' && (window as any).api?.sync?.getServerConfig) {
        const config = await (window as any).api.sync.getServerConfig()
        if (config?.host && config?.port) {
          this.updateBaseUrl(config.host, config.port)
        }
      }
    } catch {
      // Ignore fallback
    }
  }

  public updateBaseUrl(host: string, port: string | number): void {
    const cleanHost = host.startsWith('http') ? host : `http://${host}`
    this.gatewayUrl = `${cleanHost.replace(/\/$/, '')}:${port}/api/diagnosis`
    this.axiosGatewayClient.defaults.baseURL = this.gatewayUrl
  }

  /**
   * Health check attempting Gateway proxy (5030) first, then Direct service (3007)
   */
  public async checkHealth(): Promise<HealthStatusResponse> {
    const startTime = performance.now()

    // 1. Primary Attempt: API Gateway Proxy (/api/diagnosis/health)
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
      logAI('⚠️ Gateway proxy health check failed, checking direct AI service...', formatErrorForLog(errProxy))

      // 2. Secondary Attempt: Direct IPv4 port 3007 (http://127.0.0.1:3007/health)
      try {
        logAI(`📡 [AI HEALTH REQUEST] Checking Direct AI Service: ${this.directIpUrl}/health`)
        const resp = await axios.get(`${this.directIpUrl}/health`, { timeout: 3000 })
        const latencyMs = Math.round(performance.now() - startTime)
        logAI('✅ [AI HEALTH RESPONSE (DIRECT)]', resp.data)

        return {
          online: true,
          latencyMs,
          serverUrl: this.directIpUrl,
          version: resp.data?.service || 'ai-diagnosis-service',
          modelsLoaded: resp.data?.models_loaded || 5,
          modelStatus: 'Ready'
        }
      } catch (errDirectIp) {
        logAI('⚠️ Direct IPv4 check failed, trying localhost...', formatErrorForLog(errDirectIp))

        // 3. Fallback Attempt: Direct localhost port 3007
        try {
          const respLocal = await axios.get(`${this.directUrl}/health`, { timeout: 3000 })
          const latencyMs = Math.round(performance.now() - startTime)
          logAI('✅ [AI HEALTH RESPONSE (DIRECT LOCALHOST)]', respLocal.data)

          return {
            online: true,
            latencyMs,
            serverUrl: this.directUrl,
            version: respLocal.data?.service || 'ai-diagnosis-service',
            modelsLoaded: respLocal.data?.models_loaded || 5,
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
  }

  /**
   * Fetch available models list from API Gateway or Direct service
   */
  public async getModels(): Promise<AIModelMeta[]> {
    logAI('📡 [AI MODELS REQUEST] Fetching available models list')

    // 1. Try API Gateway first
    try {
      const resProxy = await this.axiosGatewayClient.get('/models')
      logAI('✅ [AI MODELS RESPONSE (GATEWAY)]', resProxy.data)
      return resProxy.data?.models || []
    } catch (errProxy) {
      logAI('⚠️ Gateway models fetch failed, trying direct AI service...', formatErrorForLog(errProxy))

      // 2. Try Direct IPv4 port 3007
      try {
        const resIp = await axios.get(`${this.directIpUrl}/models`, { timeout: 3000 })
        logAI('✅ [AI MODELS RESPONSE (DIRECT)]', resIp.data)
        return resIp.data?.models || []
      } catch (errDirectIp) {
        // 3. Try Direct localhost port 3007
        try {
          const res = await axios.get(`${this.directUrl}/models`, { timeout: 3000 })
          logAI('✅ [AI MODELS RESPONSE (DIRECT LOCALHOST)]', res.data)
          return res.data?.models || []
        } catch (err) {
          logAI('❌ [AI MODELS ERROR] Failed to load models list:', formatErrorForLog(err))
          throw err
        }
      }
    }
  }

  /**
   * Send prediction request: API Gateway FIRST, then Direct AI Service fallbacks
   */
  public async predict(req: AIPredictionRequest): Promise<AIPredictionResponse> {
    const startTime = performance.now()

    // 1. PRIMARY: Send request to API Gateway: POST http://127.0.0.1:5030/api/diagnosis/predict (or configured Gateway)
    try {
      const targetUrl = `${this.gatewayUrl}/predict`
      logAI('📡 [AI API REQUEST (GATEWAY)]', { url: targetUrl, method: 'POST', payload: req })

      const response = await this.axiosGatewayClient.post<AIPredictionResponse>('/predict', req)
      const latencyMs = Math.round(performance.now() - startTime)

      logAI('✅ [AI API RESPONSE (GATEWAY)]', { status: response.status, latencyMs, data: response.data })

      return {
        ...response.data,
        httpStatus: response.status,
        latencyMs,
        apiUrl: targetUrl
      }
    } catch (errGateway) {
      logAI('⚠️ API Gateway request failed, attempting Direct AI Microservice (127.0.0.1:3007)...', formatErrorForLog(errGateway))

      // 2. FALLBACK 1: Try Direct Python FastAPI on http://127.0.0.1:3007/predict (IPv4 explicit)
      try {
        const targetUrl = `${this.directIpUrl}/predict`
        logAI('📡 [AI API REQUEST (DIRECT IP)]', { url: targetUrl, method: 'POST', payload: req })

        const response = await axios.post<AIPredictionResponse>(targetUrl, req, {
          timeout: 8000,
          headers: { 'Content-Type': 'application/json' }
        })
        const latencyMs = Math.round(performance.now() - startTime)

        logAI('✅ [AI API RESPONSE (DIRECT IP)]', { status: response.status, latencyMs, data: response.data })

        return {
          ...response.data,
          httpStatus: response.status,
          latencyMs,
          apiUrl: targetUrl
        }
      } catch (errDirectIp) {
        logAI('⚠️ Direct IPv4 call to port 3007 failed, attempting localhost fallback...', formatErrorForLog(errDirectIp))

        // 3. FALLBACK 2: Try Direct Python FastAPI on http://localhost:3007/predict
        try {
          const targetUrl = `${this.directUrl}/predict`
          logAI('📡 [AI API REQUEST (DIRECT LOCALHOST)]', { url: targetUrl, method: 'POST', payload: req })

          const response = await axios.post<AIPredictionResponse>(targetUrl, req, {
            timeout: 8000,
            headers: { 'Content-Type': 'application/json' }
          })
          const latencyMs = Math.round(performance.now() - startTime)

          logAI('✅ [AI API RESPONSE (DIRECT LOCALHOST)]', { status: response.status, latencyMs, data: response.data })

          return {
            ...response.data,
            httpStatus: response.status,
            latencyMs,
            apiUrl: targetUrl
          }
        } catch (errDirect) {
          const detailedErr = formatErrorForLog(errDirect)
          logAI('❌ [AI API ERROR] All inference endpoints failed (Gateway & Direct 3007):', detailedErr)
          throw new Error(`Échec d'analyse IA sur la passerelle et le service direct : ${detailedErr}`)
        }
      }
    }
  }
}

export const aiDiagnosticService = new AIDiagnosticService()
