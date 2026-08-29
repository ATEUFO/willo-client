import { getDrizzleDb } from '../database'
import { users, currentUser } from '../database/schema'
import { eq, sql } from 'drizzle-orm'

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
    const db = getDrizzleDb()
    const rows = db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        department: users.department,
        status: users.status,
        lastLogin: users.lastLogin
      })
      .from(users)
      .orderBy(users.name)
      .all()
    return rows.map((r) => ({ ...r, lastLogin: r.lastLogin || '' })) as UserAccount[]
  }

  /**
   * Finds user by username.
   */
  static getUserByUsername(username: string): (UserAccount & { password?: string }) | null {
    const db = getDrizzleDb()
    const row = db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`)
      .get()
    return (row as (UserAccount & { password?: string })) || null
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
    const db = getDrizzleDb()
    db.update(users)
      .set({ lastLogin: now })
      .where(eq(users.id, user.id))
      .run()

    const authenticatedUser: UserAccount = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: user.status as 'Active' | 'Inactive',
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
    const db = getDrizzleDb()
    const id = `usr-${Date.now()}`
    const lastLogin = 'Jamais'
    const password = user.password || 'password123'

    db.insert(users)
      .values({
        id,
        name: user.name,
        username: user.username,
        password,
        role: user.role,
        department: user.department,
        status: user.status || 'Active',
        lastLogin
      })
      .run()

    return {
      id,
      name: user.name,
      username: user.username,
      role: user.role,
      department: user.department,
      status: (user.status || 'Active') as 'Active' | 'Inactive',
      lastLogin
    }
  }

  /**
   * Updates user status.
   */
  static updateUserStatus(id: string, status: 'Active' | 'Inactive'): void {
    const db = getDrizzleDb()
    db.update(users)
      .set({ status })
      .where(eq(users.id, id))
      .run()
  }

  /**
   * Retrieves current logged-in user session profile.
   */
  static getCurrentUser(): CurrentUser | null {
    const db = getDrizzleDb()
    const row = db
      .select({
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        role: currentUser.role,
        department: currentUser.department,
        token: currentUser.token,
        lastLogin: currentUser.lastLogin
      })
      .from(currentUser)
      .get()
    return (row as CurrentUser) || null
  }

  /**
   * Sets current logged-in user profile in local SQLite session.
   */
  static setCurrentUser(user: CurrentUser): void {
    const db = getDrizzleDb()
    db.delete(currentUser).run()
    db.insert(currentUser)
      .values({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department,
        token: user.token || null,
        lastLogin: user.lastLogin || new Date().toISOString()
      })
      .run()
  }

  /**
   * Clears active logged-in user session.
   */
  static clearCurrentUser(): void {
    const db = getDrizzleDb()
    db.delete(currentUser).run()
  }
}
