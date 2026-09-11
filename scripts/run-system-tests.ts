import axios from 'axios'
import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { getLocalCandidateIPs, getLocalSubnetPrefixes, scanSubnetForServer } from '../src/main/discovery/subnet-scan'
import { discoverServers } from '../src/main/discovery/find-server'

interface TestResult {
  name: string
  status: 'PASSED' | 'FAILED'
  durationMs: number
  details?: any
  error?: string
}

const baseUrl = 'http://127.0.0.1:5030'
const results: TestResult[] = []

async function runTest(name: string, fn: () => Promise<any>) {
  const start = Date.now()
  try {
    const details = await fn()
    const durationMs = Date.now() - start
    results.push({ name, status: 'PASSED', durationMs, details })
    console.log(`✅ [PASSED] ${name} (${durationMs}ms)`)
    if (details) {
      console.log(`   📄 Details: ${JSON.stringify(details, null, 2).split('\n').slice(0, 8).join('\n')}`)
    }
  } catch (err: any) {
    const durationMs = Date.now() - start
    const errorMsg = err?.response?.data ? JSON.stringify(err.response.data) : err.message || String(err)
    results.push({ name, status: 'FAILED', durationMs, error: errorMsg })
    console.error(`❌ [FAILED] ${name} (${durationMs}ms)`)
    console.error(`   ⚠️ Error: ${errorMsg}`)
  }
}

async function runFullTestSuite() {
  console.log('====================================================')
  console.log('🚀 DEMARRAGE DU SUITE DE TESTS INTEGRAL WILLO')
  console.log('   (BACKEND CONTROLLERS & FRONTEND MODULES)')
  console.log('====================================================\n')

  // ─── 1. BACKEND: GATEWAY & DISCOVERY CONTROLLERS ─────────────────
  await runTest('Backend Nginx Gateway Health (/health)', async () => {
    const resp = await axios.get(`${baseUrl}/health`, { timeout: 3000 })
    if (resp.data?.status !== 'OK') throw new Error('Nginx health status not OK')
    return resp.data
  })

  await runTest('Backend Discovery Controller (/discovery)', async () => {
    const resp = await axios.get(`${baseUrl}/discovery`, { timeout: 3000 })
    if (resp.data?.service !== 'willo-server') throw new Error('Discovery service invalid')
    return {
      siteName: resp.data.siteName,
      apiVersion: resp.data.apiVersion,
      ports: resp.data.ports
    }
  })

  // ─── 2. BACKEND: AUTH SERVICE CONTROLLERS ───────────────────────
  await runTest('Auth Service Controller - Pairing Code Generator (/api/auth/pairing/code)', async () => {
    const resp = await axios.post(`${baseUrl}/api/auth/pairing/code`, { siteId: '00000000-0000-0000-0000-000000000001' }, { timeout: 3000 })
    if (!resp.data?.pairingCode) throw new Error('Pairing code missing in response')
    return {
      pairingCode: resp.data.pairingCode,
      expiresAt: resp.data.expiresAt
    }
  })

  await runTest('Auth Service Controller - Auth Guard Protection (/api/auth/me)', async () => {
    try {
      await axios.get(`${baseUrl}/api/auth/me`, { timeout: 3000 })
      throw new Error('Should have rejected request without Bearer token')
    } catch (err: any) {
      if (err.response?.status === 401) {
        return { status: 401, message: 'Auth protection correctly enforced' }
      }
      throw err
    }
  })

  // ─── 3. BACKEND: FHIR CLINICAL CONTROLLERS ──────────────────────
  let createdPatientId = `pat-auto-test-${Date.now()}`

  await runTest('FHIR Service Controller - Create Patient (/api/fhir/Patient)', async () => {
    const payload = {
      resourceType: 'Patient',
      id: createdPatientId,
      nom: 'WILLO_TEST',
      prenom: 'IntegrationUser',
      sexe: 'M',
      dateNaissance: '1990-01-01',
      telephone: '+2250102030405',
      status: 'active'
    }

    const resp = await axios.post(`${baseUrl}/api/fhir/Patient`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Poste-Id': 'test-runner-poste'
      },
      timeout: 4000
    })

    if (resp.status !== 201 && resp.status !== 200) throw new Error(`Unexpected status ${resp.status}`)
    return { status: resp.status, id: resp.data?.id || createdPatientId }
  })

  await runTest('FHIR Service Controller - Read Patient by ID (/api/fhir/Patient/:id)', async () => {
    const resp = await axios.get(`${baseUrl}/api/fhir/Patient/${createdPatientId}`, { timeout: 3000 })
    if (resp.data?.id !== createdPatientId) throw new Error('Patient ID mismatch in response')
    return { id: resp.data.id, nom: resp.data.nom, prenom: resp.data.prenom }
  })

  await runTest('FHIR Service Controller - Update Patient (/api/fhir/Patient/:id)', async () => {
    const updatePayload = {
      resourceType: 'Patient',
      id: createdPatientId,
      nom: 'WILLO_TEST_UPDATED',
      prenom: 'IntegrationUser',
      sexe: 'M',
      dateNaissance: '1990-01-01',
      telephone: '+2250102030405',
      status: 'active'
    }

    const resp = await axios.put(`${baseUrl}/api/fhir/Patient/${createdPatientId}`, updatePayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    })

    if (resp.data?.nom !== 'WILLO_TEST_UPDATED') throw new Error('Update payload not reflected')
    return { id: resp.data.id, updatedNom: resp.data.nom, metaVersion: resp.data?.meta?.versionId }
  })

  await runTest('FHIR Service Controller - Bundle Search (/api/fhir/Patient)', async () => {
    const resp = await axios.get(`${baseUrl}/api/fhir/Patient?_limit=5`, { timeout: 3000 })
    if (resp.data?.resourceType !== 'Bundle') throw new Error('FHIR search did not return a Bundle')
    return { resourceType: resp.data.resourceType, total: resp.data.total, entriesCount: resp.data.entry?.length || 0 }
  })

  await runTest('FHIR Service Controller - Sync Bootstrap (/api/fhir/sync/bootstrap)', async () => {
    const resp = await axios.get(`${baseUrl}/api/fhir/sync/bootstrap`, { timeout: 3000 })
    if (!resp.data?.scope) throw new Error('Bootstrap scope missing')
    return { role: resp.data.role, scope: resp.data.scope }
  })

  // ─── 4. BACKEND: AI DIAGNOSIS CONTROLLERS ───────────────────────
  await runTest('AI Microservice Controller - Health Check (/api/diagnosis/health)', async () => {
    const resp = await axios.get(`${baseUrl}/api/diagnosis/health`, { timeout: 3000 })
    if (resp.data?.status !== 'OK') throw new Error('AI service health status not OK')
    return { status: resp.data.status, modelsLoaded: resp.data.modelsLoaded || resp.data.models_loaded }
  })

  await runTest('AI Microservice Controller - Models Catalog (/api/diagnosis/models)', async () => {
    const resp = await axios.get(`${baseUrl}/api/diagnosis/models`, { timeout: 3000 })
    const models = resp.data?.models || []
    if (models.length === 0) throw new Error('No AI models returned')
    return { count: models.length, modelIds: models.map((m: any) => m.nomModele) }
  })

  await runTest('AI Microservice Controller - Sepsis Risk Prediction (/api/diagnosis/predict)', async () => {
    const payload = {
      nomModele: 'sepsis-risk-v1',
      patientId: createdPatientId,
      encounterId: 'enc-test-01',
      features: {
        temperature: 39.2,
        pressionSystolique: 88,
        pressionDiastolique: 52,
        frequenceCardiaque: 125,
        frequenceRespiratoire: 28,
        saturationO2: 90,
        leucocytes: 18000,
        lactate: 4.5,
        scoreGlasgow: 13,
        age: 62,
        sexe: 1
      }
    }
    const resp = await axios.post(`${baseUrl}/api/diagnosis/predict`, payload, { timeout: 5000 })
    if (!resp.data?.success) throw new Error('Prediction not successful')
    return {
      niveauRisque: resp.data.prediction?.niveauRisque,
      scoreProbabilite: resp.data.prediction?.scoreProbabilite,
      intituleDiagnostic: resp.data.prediction?.intituleDiagnostic
    }
  })

  await runTest('AI Microservice Controller - Malaria Risk Prediction (/api/diagnosis/predict)', async () => {
    const payload = {
      nomModele: 'malaria-risk-v1',
      patientId: createdPatientId,
      encounterId: 'enc-test-02',
      features: {
        temperature: 38.8,
        tdrMalaria: 1,
        plaquettes: 95000,
        hemoglobine: 9.8,
        age: 24,
        sexe: 0
      }
    }
    const resp = await axios.post(`${baseUrl}/api/diagnosis/predict`, payload, { timeout: 5000 })
    if (!resp.data?.success) throw new Error('Malaria prediction not successful')
    return {
      niveauRisque: resp.data.prediction?.niveauRisque,
      scoreProbabilite: resp.data.prediction?.scoreProbabilite,
      intituleDiagnostic: resp.data.prediction?.intituleDiagnostic
    }
  })

  // ─── 5. BACKEND: ALL MICROSERVICES CONTROLLERS PING ─────────────
  const microserviceEndPoints = [
    { name: 'Labo Microservice (/api/labo/)', path: '/api/labo/' },
    { name: 'Pharmacie Microservice (/api/pharmacie/)', path: '/api/pharmacie/' },
    { name: 'Facturation Microservice (/api/facturation/)', path: '/api/facturation/' },
    { name: 'Statistiques Microservice (/api/statistiques/)', path: '/api/statistiques/' },
    { name: 'Notification Microservice (/api/notification/)', path: '/api/notification/' },
    { name: 'Audit Microservice (/api/audit/)', path: '/api/audit/' },
    { name: 'File Microservice (/api/file/)', path: '/api/file/' },
    { name: 'Clinique Microservice (/api/clinique/)', path: '/api/clinique/' }
  ]

  for (const ep of microserviceEndPoints) {
    await runTest(`Backend Controller Ping - ${ep.name}`, async () => {
      const resp = await axios.get(`${baseUrl}${ep.path}`, { timeout: 3000 })
      if (resp.status !== 200) throw new Error(`Status ${resp.status}`)
      return { status: resp.status, message: resp.data?.message }
    })
  }

  // ─── 6. FRONTEND: DISCOVERY & NETWORK SUBNET SCANNER ────────────
  await runTest('Frontend Module - Local Network Candidate & Subnet Detection', async () => {
    const candidates = getLocalCandidateIPs()
    const prefixes = getLocalSubnetPrefixes()
    if (candidates.length === 0) throw new Error('No local candidate IPs detected')
    return { localCandidates: candidates, subnetPrefixes: prefixes }
  })

  await runTest('Frontend Module - Subnet Scanner Engine (scanSubnetForServer)', async () => {
    const scanned = await scanSubnetForServer()
    if (scanned.length === 0) throw new Error('Subnet scanner returned no servers')
    return { discoveredCount: scanned.length, servers: scanned.map((s) => `${s.host}:${s.port}`) }
  })

  await runTest('Frontend Module - Full Auto-Discovery Manager (discoverServers)', async () => {
    const servers = await discoverServers(1500)
    if (servers.length === 0) throw new Error('Auto-discovery returned no servers')
    return { count: servers.length, primaryServer: `${servers[0].host}:${servers[0].port}` }
  })

  // ─── 7. FRONTEND: SQLITE LOCAL OUTBOX DATABASE OPERATIONS ────────
  await runTest('Frontend Module - SQLite Local Outbox Operations', async () => {
    const dbDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    const dbPath = path.join(dbDir, 'willo_test.db')
    const db = new Database(dbPath)

    db.exec(`
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        sent_at TEXT
      );
    `)

    const testMutationId = `mut-test-${Date.now()}`
    const stmtInsert = db.prepare(`
      INSERT INTO outbox (id, endpoint, method, payload, status, retry_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmtInsert.run(testMutationId, '/api/fhir/Patient', 'POST', JSON.stringify({ id: createdPatientId }), 'pending', 0, new Date().toISOString())

    const stmtQuery = db.prepare(`SELECT * FROM outbox WHERE id = ?`)
    const row = stmtQuery.get(testMutationId) as any
    if (!row) throw new Error('Inserted outbox record not found')

    const stmtDelete = db.prepare(`DELETE FROM outbox WHERE id = ?`)
    stmtDelete.run(testMutationId)

    const rowAfter = stmtQuery.get(testMutationId)
    if (rowAfter) throw new Error('Outbox record deletion failed')

    db.close()
    return { testMutationId, insertedStatus: row.status, deletedCleanly: true }
  })

  // ─── 8. FINAL SUMMARY REPORT ─────────────────────────────────────
  console.log('\n====================================================')
  console.log('📊 RESUME DES RESULTATS DES TESTS SYSTEME ET MODULES')
  console.log('====================================================')
  const passed = results.filter((r) => r.status === 'PASSED').length
  const failed = results.filter((r) => r.status === 'FAILED').length
  console.log(`✅ Réussis : ${passed} / ${results.length}`)
  console.log(`❌ Échecs  : ${failed} / ${results.length}`)

  if (failed > 0) {
    console.error('\n⚠️ Certains tests ont échoué. Détails ci-dessus.')
    process.exit(1)
  } else {
    console.log('\n🎉 TOUS LES TESTS BACKEND & FRONTEND SONT PASSES AVEC SUCCES (100% OK) !')
  }
}

runFullTestSuite()
