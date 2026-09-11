import axios from 'axios'
import Store from 'electron-store'

interface TestResult {
  name: string
  status: 'PASSED' | 'FAILED'
  durationMs: number
  details?: any
  error?: string
}

const results: TestResult[] = []

function logResult(result: TestResult) {
  results.push(result)
  const icon = result.status === 'PASSED' ? '✅' : '❌'
  console.log(`${icon} [${result.status}] ${result.name} (${result.durationMs}ms)`)
  if (result.details) {
    console.log('   📄 Details:', JSON.stringify(result.details, null, 2))
  }
  if (result.error) {
    console.error('   ⚠️ Error:', result.error)
  }
}

async function runTest(name: string, fn: () => Promise<any>) {
  const start = performance.now()
  try {
    const details = await fn()
    const durationMs = Math.round(performance.now() - start)
    logResult({ name, status: 'PASSED', durationMs, details })
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start)
    const errorMsg = err.response?.data?.detail || err.message || String(err)
    logResult({ name, status: 'FAILED', durationMs, error: errorMsg })
  }
}

async function runAllSystemTests() {
  console.log('====================================================')
  console.log('🚀 DEMARRAGE DE LA SUITE DE TESTS D\'INTEGRATION WILLO')
  console.log('====================================================\n')

  const targetHost = process.env.SERVER_HOST || '10.5.49.37'
  const targetPort = process.env.SERVER_PORT || '5030'
  const baseUrl = `http://${targetHost}:${targetPort}`

  // Test 1: Nginx Gateway Health Check
  await runTest('Backend Nginx Gateway Health (/health)', async () => {
    const resp = await axios.get(`${baseUrl}/health`, { timeout: 3000 })
    if (resp.status !== 200) throw new Error(`HTTP status: ${resp.status}`)
    return resp.data
  })

  // Test 2: Server Discovery Endpoint
  await runTest('Backend Discovery Service (/discovery)', async () => {
    const resp = await axios.get(`${baseUrl}/discovery`, { timeout: 3000 })
    if (resp.data?.service !== 'willo-server') {
      throw new Error(`Unexpected service signature: ${resp.data?.service}`)
    }
    return {
      service: resp.data.service,
      siteName: resp.data.siteName,
      ports: resp.data.ports
    }
  })

  // Test 3: AI Microservice Proxy Health (/api/diagnosis/health)
  await runTest('AI Microservice Gateway Proxy (/api/diagnosis/health)', async () => {
    const resp = await axios.get(`${baseUrl}/api/diagnosis/health`, { timeout: 4000 })
    if (!resp.data?.status || resp.data.status !== 'OK') {
      throw new Error('AI Microservice responded but status is not OK')
    }
    return {
      service: resp.data.service,
      modelsLoaded: resp.data.models_loaded,
      status: resp.data.status
    }
  })

  // Test 4: AI Microservice Catalog (/api/diagnosis/models)
  await runTest('AI Microservice Models Catalog (/api/diagnosis/models)', async () => {
    const resp = await axios.get(`${baseUrl}/api/diagnosis/models`, { timeout: 4000 })
    const models = resp.data?.models || []
    if (models.length === 0) throw new Error('No AI models returned')
    return {
      count: models.length,
      modelIds: models.map((m: any) => m.nomModele)
    }
  })

  // Test 5: AI Microservice Real Inferences (Sepsis & Malaria Models)
  await runTest('AI Microservice Prediction Sepsis Risk v1 (/api/diagnosis/predict)', async () => {
    const payload = {
      nomModele: 'sepsis-risk-v1',
      patientId: 'pat-test-integration-01',
      encounterId: 'enc-test-integration-01',
      features: {
        temperature: 39.1,
        pressionSystolique: 85,
        pressionDiastolique: 55,
        frequenceCardiaque: 122,
        frequenceRespiratoire: 26,
        saturationO2: 91,
        leucocytes: 17800,
        lactate: 4.1,
        scoreGlasgow: 13,
        age: 58,
        sexe: 1
      }
    }
    const resp = await axios.post(`${baseUrl}/api/diagnosis/predict`, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' }
    })

    if (!resp.data?.success) throw new Error('Prediction response marked success = false')
    const pred = resp.data.prediction
    if (!pred?.niveauRisque || !pred?.scoreProbabilite) {
      throw new Error('Prediction result missing risk level or probability score')
    }

    return {
      inferenceId: resp.data.inferenceId,
      niveauRisque: pred.niveauRisque,
      scoreProbabilite: pred.scoreProbabilite,
      intituleDiagnostic: pred.intituleDiagnostic,
      facteursContributifsCount: pred.facteursContributifs?.length || 0,
      fhirResourceType: resp.data.fhirResource?.resourceType
    }
  })

  // Test 6: FHIR Service Patient Endpoint (/api/fhir/Patient)
  await runTest('FHIR Service Create & Read Patient (/api/fhir/Patient)', async () => {
    const testPatientId = `pat-auto-test-${Date.now()}`
    const createPayload = {
      resourceType: 'Patient',
      id: testPatientId,
      nom: 'TEST_INTEGRATION',
      prenom: 'SystemCheck',
      sexe: 'M',
      dateNaissance: '1985-05-15',
      telephone: '+2250700000000',
      status: 'active'
    }

    const postResp = await axios.post(`${baseUrl}/api/fhir/Patient`, createPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Poste-Id': 'test-runner-poste-id'
      },
      timeout: 4000
    })

    return {
      status: postResp.status,
      createdId: testPatientId
    }
  })

  // Summary Report
  console.log('\n====================================================')
  console.log('📊 RESUME DES RESULTATS DU TEST DE SYSTEME WILLO')
  console.log('====================================================')
  const passed = results.filter((r) => r.status === 'PASSED').length
  const failed = results.filter((r) => r.status === 'FAILED').length
  console.log(`✅ Réussis : ${passed} / ${results.length}`)
  console.log(`❌ Échecs  : ${failed} / ${results.length}`)

  if (failed > 0) {
    console.error('\n⚠️ Des composants du système nécessitent une attention. Détails ci-dessus.')
    process.exit(1)
  } else {
    console.log('\n🎉 TOUS LES TESTS FRONTEND & BACKEND SONT PASSES AVEC SUCCES !')
  }
}

runAllSystemTests()
