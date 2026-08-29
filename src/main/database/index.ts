import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'

let dbInstance: Database.Database | null = null
let drizzleDbInstance: BetterSQLite3Database<typeof schema> | null = null

/**
 * Resolves the SQLite database file path.
 * Uses Electron's app.getPath('userData') when running under Electron,
 * or defaults to local directory if app is not ready.
 */
export function getDatabasePath(): string {
  let dbDir: string
  try {
    dbDir = app && app.getPath ? app.getPath('userData') : path.join(process.cwd(), 'data')
  } catch {
    dbDir = path.join(process.cwd(), 'data')
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  return path.join(dbDir, 'willo_local.db')
}

/**
 * Returns the singleton SQLite Database instance using better-sqlite3.
 * Automatically initializes tables and default seed data if not already initialized.
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath()
    dbInstance = new Database(dbPath)
    dbInstance.pragma('foreign_keys = ON')
    dbInstance.pragma('journal_mode = WAL')
    
    // Initialize Drizzle DB instance
    drizzleDbInstance = drizzle(dbInstance, { schema })
    
    // Initialize schema/run migrations
    initDatabaseSchema(dbInstance)
  }
  return dbInstance
}

/**
 * Returns the singleton Drizzle ORM Database instance.
 */
export function getDrizzleDb(): BetterSQLite3Database<typeof schema> {
  getDatabase() // Ensure SQLite connection is initialized
  return drizzleDbInstance!
}

/**
 * Initializes the SQLite database schema for Willo Client using Drizzle migrations.
 */
export function initDatabaseSchema(db: Database.Database): void {
  try {
    // Baselining: if the database has tables, we ensure the migrations table is populated
    // to prevent Drizzle from attempting to recreate existing tables.
    const usersTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
    const aiDiagnosesExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_diagnoses'").get()

    if (usersTableExists || aiDiagnosesExists) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hash text NOT NULL,
          created_at numeric
        );
      `)

      const initialMigrationRecorded = db.prepare(
        "SELECT id FROM __drizzle_migrations WHERE hash = 'e9d45d0aad9df9f16eb0722afa45bdf6ab1e9e395410263ff48a4de446f9c836'"
      ).get()

      if (!initialMigrationRecorded) {
        db.prepare(
          "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)"
        ).run('e9d45d0aad9df9f16eb0722afa45bdf6ab1e9e395410263ff48a4de446f9c836', 1787967538883)
        console.log('Database baselined: recorded initial migration as completed.')
      }
    }

    const migrationsFolder = path.join(__dirname, 'migrations')
    migrate(drizzleDbInstance!, { migrationsFolder })
    console.log('Database schema successfully initialized/migrated via Drizzle.')
  } catch (err) {
    console.error('Failed to run database migrations:', err)
  }
}

/**
 * Closes the SQLite database connection safely.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    drizzleDbInstance = null
  }
}
