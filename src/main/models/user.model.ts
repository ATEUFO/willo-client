import { getDatabase } from '../database'

export interface CurrentUser {
  id: string
  name: string
  username: string
  role: string
  department: string
  token?: string
  lastLogin?: string
}

/**
 * Model handling current logged-in user profile stored on this local machine.
 * Note: Does NOT handle authentication, password hashes, or other users' data.
 */
export class CurrentUserModel {
  /**
   * Retrieves the current user profile from local SQLite DB.
   */
  static getCurrentUser(): CurrentUser | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT id, name, username, role, department, token, last_login as lastLogin FROM current_user LIMIT 1')
    const row = stmt.get() as (CurrentUser & { lastLogin?: string }) | undefined
    return row || null
  }

  /**
   * Sets or updates the current user profile on this local machine.
   */
  static setCurrentUser(user: CurrentUser): void {
    const db = getDatabase()
    db.exec('DELETE FROM current_user;')
    const stmt = db.prepare(`
      INSERT INTO current_user (id, name, username, role, department, token, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      user.id,
      user.name,
      user.username,
      user.role,
      user.department,
      user.token || null,
      user.lastLogin || new Date().toISOString()
    )
  }

  /**
   * Clears the current user profile (on logout or session reset).
   */
  static clearCurrentUser(): void {
    const db = getDatabase()
    db.exec('DELETE FROM current_user;')
  }
}
