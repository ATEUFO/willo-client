import { getDatabase } from '../database'

export interface UserAccount {
  id: string
  name: string
  username: string
  password?: string
  role: string
  department: string
  status: 'Active' | 'Inactive'
  lastLogin: string
}

export interface CurrentUser {
  id: string
  name: string
  username: string
  role: string
  department: string
  token?: string
  lastLogin?: string
}

export class UserModel {
  /**
   * Returns all user accounts from local SQLite DB.
   */
  static getAllUsers(): UserAccount[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT id, name, username, role, department, status, last_login as lastLogin
      FROM users
      ORDER BY name ASC
    `)
    return stmt.all() as UserAccount[]
  }

  /**
   * Finds user by username.
   */
  static getUserByUsername(username: string): (UserAccount & { password?: string }) | null {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT id, name, username, password, role, department, status, last_login as lastLogin
      FROM users
      WHERE LOWER(username) = LOWER(?)
    `)
    const row = stmt.get(username) as (UserAccount & { password?: string }) | undefined
    return row || null
  }

  /**
   * Authenticates user against SQLite users table.
   */
  static authenticate(username: string, password: string): UserAccount | null {
    const user = this.getUserByUsername(username)
    if (!user) return null
    if (user.status !== 'Active') return null
    if (user.password !== password) return null

    // Update last_login
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const db = getDatabase()
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id)

    const authenticatedUser: UserAccount = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: user.status,
      lastLogin: now
    }

    // Set active session in current_user
    this.setCurrentUser({
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      username: authenticatedUser.username,
      role: authenticatedUser.role,
      department: authenticatedUser.department,
      lastLogin: now
    })

    return authenticatedUser
  }

  /**
   * Creates a new user account.
   */
  static createUser(user: Omit<UserAccount, 'id' | 'lastLogin'> & { password?: string }): UserAccount {
    const db = getDatabase()
    const id = `usr-${Date.now()}`
    const lastLogin = 'Jamais'
    const password = user.password || 'password123'
    const stmt = db.prepare(`
      INSERT INTO users (id, name, username, password, role, department, status, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, user.name, user.username, password, user.role, user.department, user.status || 'Active', lastLogin)

    return {
      id,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: user.status || 'Active',
      lastLogin
    }
  }

  /**
   * Updates user status.
   */
  static updateUserStatus(id: string, status: 'Active' | 'Inactive'): void {
    const db = getDatabase()
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id)
  }

  /**
   * Retrieves current logged-in user session profile.
   */
  static getCurrentUser(): CurrentUser | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT id, name, username, role, department, token, last_login as lastLogin FROM current_user LIMIT 1')
    const row = stmt.get() as CurrentUser | undefined
    return row || null
  }

  /**
   * Sets current logged-in user profile in local SQLite session.
   */
  static setCurrentUser(user: CurrentUser): void {
    const db = getDatabase()
    db.prepare('DELETE FROM current_user;').run()
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
   * Clears active logged-in user session.
   */
  static clearCurrentUser(): void {
    const db = getDatabase()
    db.prepare('DELETE FROM current_user;').run()
  }
}
