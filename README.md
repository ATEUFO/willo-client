# 🏥 Willo Client - Système d'Information Hospitalier (SIH)

**Willo Client** est une application desktop médicale moderne, performante et sécurisée conçue pour la gestion complète d'établissements de santé. Elle offre une interface fluide et réactive pour les différents services hospitaliers (Accueil, Consultation médicale, Soins infirmiers, Diagnostic par IA, Laboratoire, Pharmacie, Caisse et Direction).

---

## 🌟 Fonctionnement & Architecture Client / Serveur

L'application repose sur une **architecture hybride Client/Serveur avec approche Local-First** :

- **Base de Données Locale SQLite (Drizzle ORM)** : Chaque poste client fonctionne de manière autonome en s'appuyant sur une base SQLite locale hyper rapide. Les utilisateurs peuvent continuer à saisir des données même en cas de coupure du réseau local ou d'Internet.
- **Synchronisation avec `willo-server`** : L'application communique en continu avec le serveur central (`willo-server`) via des requêtes HTTP REST, WebSockets (temps réel) et standard **HL7/FHIR**.
- **Outbox Sync Engine** : Les modifications locales sont placées dans une file d'attente et synchronisées automatiquement avec le serveur central dès que la connexion est disponible.
- **Découverte Automatique de Serveur (mDNS / Zeroconf)** : Le client détecte automatiquement le serveur Willo présent sur le réseau local sans configuration complexe.

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** (v9 ou supérieur)

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancement en mode Développement

Pour lancer l'application en mode développement avec rechargement à chaud (Hot Reload) :

```bash
npm run dev
```

### 3. Vérification du Typage TypeScript

```bash
npm run typecheck
```

---

## 📦 Compilation & Génération des Exécutables (Build)

Pour générer l'application sous forme de binaire exécutable distribuable (installateur) :

### Pour Windows (.exe / .msi)

```bash
npm run build:win
```

### Pour macOS (.dmg / .app)

```bash
npm run build:mac
```

### Pour Linux (.AppImage / .deb)

```bash
npm run build:linux
```

Les exécutables générés se trouvent dans le dossier `dist/` ou `out/`.

---

## 👨‍💻 Développeur & Auteur

Ce projet a été conçu et développé par **Arthur**.

### 🔗 Liens & Réseaux Sociaux

- **GitHub** : [https://github.com/ATEUFO](https://github.com/ATEUFO)
- **LinkedIn** : [https://linkedin.com/in/ateufo-arthur](https://linkedin.com/in/ateufo-arthur)
- **Portfolio** : [https://olenceia.com](https://olenceia.com)
- **Email** : [ateufoarthur@gmail.com](mailto:ateufoarthur@gamail.com)

---

© 2026 Willo Hospital Management System. Tous droits réservés.
