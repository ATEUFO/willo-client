import { getDrizzleDb } from '../database'
import { users, currentUser } from '../database/schema'
import { eq, sql, and } from 'drizzle-orm'
import { createHash } from 'node:crypto'

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function isHashedPassword(password: string): boolean {
  return typeof password === 'string' && /^[a-f0-9]{64}$/i.test(password)
}

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
   * Hashes the password and looks up user matching username & hashed password.
   */
  static authenticate(username: string, password: string): UserAccount | null {
    const db = getDrizzleDb()
    const hashedPassword = hashPassword(password)

    // Look up user matching username and hashed password directly in SQL
    let row = db
      .select()
      .from(users)
      .where(
        and(
          sql`LOWER(${users.username}) = LOWER(${username})`,
          eq(users.password, hashedPassword)
        )
      )
      .get()

    let user = row as (UserAccount & { password?: string }) | undefined

    // Backward compatibility: If no match found by hashed password, check for legacy unhashed entry
    if (!user) {
      const legacyUser = this.getUserByUsername(username)
      if (legacyUser && legacyUser.password === password) {
        db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, legacyUser.id))
          .run()
        user = legacyUser
      }
    }

    if (!user) return null
    if (user.status !== 'Active') return null

    // Update last_login
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
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
   * Creates a new user account with hashed password.
   */
  static createUser(user: Omit<UserAccount, 'id' | 'lastLogin'> & { password?: string }): UserAccount {
    const db = getDrizzleDb()
    const id = `usr-${Date.now()}`
    const lastLogin = 'Jamais'
    const rawPassword = user.password || 'password123'
    const password = isHashedPassword(rawPassword) ? rawPassword : hashPassword(rawPassword)

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

  /**
   * Seeds initial default test users into local SQLite DB if table is empty,
   * and ensures all existing user passwords in SQLite are hashed.
   */
  static seedDefaultUsers(): void {
    try {
      const db = getDrizzleDb()

      // 1. Migrate any existing plaintext passwords in users table to SHA-256 hashes
      const allRows = db.select().from(users).all()
      for (const row of allRows) {
        if (row.password && !isHashedPassword(row.password)) {
          const hashedPassword = hashPassword(row.password)
          db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, row.id))
            .run()
        }
      }

      // 2. Insert test demo users if user matching username does not exist
      const defaultPasswordHash = hashPassword('password123')
      const defaultUsers = [
        {
          id: 'usr-demo-1',
          name: 'Dr. Sarah Kouassi',
          username: 'skouassi',
          password: defaultPasswordHash,
          role: 'médecin',
          department: 'Médecine Générale',
          status: 'Active' as const,
          lastLogin: 'Jamais'
        },
        {
          id: 'usr-demo-2',
          name: 'Awa Diop',
          username: 'adiop',
          password: defaultPasswordHash,
          role: 'accueil',
          department: 'Caisse & Admissions',
          status: 'Active' as const,
          lastLogin: 'Jamais'
        },
        {
          id: 'usr-demo-3',
          name: 'Administrateur Système',
          username: 'admin',
          password: defaultPasswordHash,
          role: 'admin',
          department: 'Direction Médicale',
          status: 'Active' as const,
          lastLogin: 'Jamais'
        }
      ]

      for (const u of defaultUsers) {
        const existing = db
          .select({ id: users.id })
          .from(users)
          .where(sql`LOWER(${users.username}) = LOWER(${u.username})`)
          .get()

        if (!existing) {
          db.insert(users).values(u).run()
        }
      }
      console.log('Default test users check and seed completed.')
    } catch (err) {
      console.error('Failed to seed default users:', err)
    }
  }
}
