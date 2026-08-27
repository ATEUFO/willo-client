import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: '#00C853',    // Éléments cliquables, boutons, liens actifs
          hover: '#00B048',      // État hover du vert principal
          subtle: '#DCFCE7',     // Fonds légers, badges de succès
          dark: '#0A192F',       // Sidebar, titres majeurs, structure
          lightBg: '#F8F9FA',    // Arrière-plan général des pages
          cardBg: '#FFFFFF',     // Fond des cartes et tableaux
          border: '#E2E8F0',     // Lignes de séparation et bordures
          danger: '#EF4444',     // Urgences, alertes vitales
          warning: '#F59E0B'      // Files d'attente, stocks bas
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
