import { Role } from '../pages/store/hospitalStore'

export interface RoleInfo {
  id: Role
  label: string
  description: string
  allowedModules: Role[]
}

export const ROLE_CONFIGS: Record<Role, { label: string; description: string; allowedModules: Role[] }> = {
  admin: {
    label: 'Administrateur Système',
    description: "Administration générale du système, gestion des utilisateurs, des paramètres, des sauvegardes et des droits d'accès.",
    allowedModules: ['admin', 'reception', 'nursing', 'consultation', 'laboratory', 'pharmacy', 'billing', 'management']
  },
  reception: {
    label: 'Réceptionniste / Accueil',
    description: 'Enregistrement des patients, création des dossiers médicaux, planification des consultations et orientation.',
    allowedModules: ['reception']
  },
  consultation: {
    label: 'Médecin / Practicien',
    description: "Consultation des patients, diagnostic, prescriptions médicales, demandes d'examens et suivi médical.",
    allowedModules: ['consultation', 'laboratory', 'pharmacy']
  },
  nursing: {
    label: 'Infirmier(ère)',
    description: 'Accueil clinique, prise des constantes vitales, soins infirmiers, suivi des patients et mise à jour du dossier.',
    allowedModules: ['consultation', 'reception']
  },
  laboratory: {
    label: 'Laborantin',
    description: "Gestion des examens biologiques, saisie et validation des résultats d'analyses.",
    allowedModules: ['laboratory']
  },
  pharmacy: {
    label: 'Pharmacien',
    description: 'Gestion du stock de médicaments, délivrance des prescriptions et suivi des approvisionnements.',
    allowedModules: ['pharmacy']
  },
  billing: {
    label: 'Caissier / Facturation',
    description: 'Gestion de la facturation, des paiements et des reçus.',
    allowedModules: ['billing']
  },
  management: {
    label: 'Gestionnaire / Directeur',
    description: 'Consultation des tableaux de bord, statistiques, indicateurs de performance et rapports de gestion.',
    allowedModules: ['management']
  }
}

/**
 * Checks if a given user role has access to a specific module role.
 */
export function hasModuleAccess(userRole: Role, targetModule: Role): boolean {
  if (!userRole) return false
  const config = ROLE_CONFIGS[userRole]
  if (!config) return false
  return config.allowedModules.includes(targetModule)
}

/**
 * Returns the list of authorized modules for a given user role.
 */
export function getAllowedModules(userRole: Role): Role[] {
  if (!userRole || !ROLE_CONFIGS[userRole]) return []
  return ROLE_CONFIGS[userRole].allowedModules
}
