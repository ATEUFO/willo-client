# Synchronisation & Architecture Offline-First (Willo Client)

Ce document constitue la référence technique détaillée du système de synchronisation du client **Willo**. Il explique le fonctionnement de l'architecture **Local-First**, la gestion du mode hors-ligne, les mécanismes de synchronisation montante/descendante, le protocole WebSocket et la résolution des conflits.

---

## 1. Principes Fondamentaux & Architecture Local-First

L'application **Willo Client** s'appuie sur un paradigme **Local-First (Offline-First)** :

- **Réactivité Instantanée** : Toutes les lectures et écritures s'effectuent prioritairement sur la base de données locale **SQLite** (via Drizzle ORM). L'interface utilisateur ne bloque jamais en attendant une réponse réseau.
- **Fonctionnement Déconnecté** : L'utilisateur peut créer, modifier ou consulter des dossiers médicaux même sans connexion internet ou réseau local.
- **Synchronisation Asynchrone Hybride** : Les modifications locales sont empilées dans une file d'attente (**Outbox**) puis poussées vers le serveur central en arrière-plan dès que le réseau est disponible.

### Canaux de Communication Complémentaires

| Canal | Protocole | Rôle | Sens & Déclenchement |
| --- | --- | --- | --- |
| **REST / HTTPS** | HTTP/TLS (Port 5030) | Bootstrap initial, Pull incrémental (Deltas), Push des écritures (Outbox) | **Client ➔ Serveur** (À la demande / Intervalle) |
| **WebSocket** | `wss://` (Port 5030) | Notification de modifications distantes en temps réel (`resource.updated`) | **Serveur ➔ Client** (Poussée continue) |

---

## 2. Architecture Globale de Synchronisation

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                POSTE CLIENT ELECTRON                                   │
│                                                                                        │
│  ┌───────────────────────┐          IPC Bridge          ┌───────────────────────────┐  │
│  │    Renderer (React)   │ ◄──────────────────────────► │  Main Process (Electron)  │  │
│  └───────────────────────┘                              └─────────────┬─────────────┘  │
│                                                                       │                │
│                                                          ┌────────────▼─────────────┐  │
│                                                          │  SyncManager             │  │
│                                                          │  (sync-manager.ts)       │  │
│                                                          └─────┬──────────────┬─────┘  │
│                                                                │              │        │
│          ┌─────────────────────────────────────────────────────┘              │        │
│          │ Écritures/Outbox                                                   │        │
│          ▼                                                                    ▼        │
│  ┌───────────────┐                                                     ┌─────────────┐ │
│  │ SQLite Local  │ (Drizzle ORM)                                       │ Outbox DB   │ │
│  │ (Tables FHIR) │ ◄────────────────────────────────────────────────── │ (pending)   │ │
│  └───────────────┘                                                     └─────────────┘ │
└──────────▲────────────────────────────────────────────────────────────────────┬────────┘
           │                                                                    │
           │ Notification Temps Réel                                            │ REST / Push
           │ (wss://)                                                           │ (https://)
           │                                                                    │
┌──────────┴────────────────────────────────────────────────────────────────────▼────────┐
│                                 SERVEUR CENTRAL WILLO                                  │
│                                                                                        │
│  ┌─────────────────────────┐                            ┌───────────────────────────┐  │
│  │    Realtime Gateway     │ ◄─── Redis Streams ──────► │       API Gateway         │  │
│  │   (WebSocket Server)    │      (Event Bus)           │   (FHIR Fastify REST)     │  │
│  └─────────────────────────┘                            └─────────────┬─────────────┘  │
│                                                                       │                │
│                                                                 ┌─────▼─────────────┐  │
│                                                                 │ PostgreSQL        │  │
│                                                                 │ (Source de vérité)│  │
│                                                                 └───────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Les Trois Mouvements de Synchronisation

Le cycle de vie de la synchronisation s'articule autour de trois mécanismes distincts mais interconnectés.

### 3.1 Synchronisation Initiale par Rôle (Bootstrap Sync)

Lors du premier appairage ou du login initial d'un poste, le client exécute une synchronisation globale pour rapatrier les données nécessaires au fonctionnement du poste.

- **Fonction** : `bootstrapSync()`
- **Requête HTTP** : `GET /api/fhir/sync/bootstrap`
- **Authentification** : Token JWT (`Bearer`) + En-tête `X-Poste-Id`
- **Périmètre Dynamique** : Le serveur filtre le jeu de données renvoyé selon le rôle de l'utilisateur (Médecin, Accueil, Laboratoire, Pharmacie, etc.) afin d'optimiser le volume transféré.
- **Stockage Local** : Les ressources sont insérées dans SQLite via une transaction atomique (`tx.insert().onConflictDoUpdate()`).
- **Mise à jour d'état** : L'horodatage `lastSyncedAt` est mis à jour et sauvegardé dans le stockage persistant `electron-store`.

### 3.2 Synchronisation Montante (Outbox / Push Sync)

Toute création ou modification de donnée sur le poste client suit la démarche d'écriture optimiste via la table `outbox`.

#### Étapes d'Écriture

1. **Création Locale** : La mutation est immédiatement appliquée dans la table SQLite correspondante.
2. **Empilement Outbox** : Une entrée est insérée dans la table `outbox` (`queueLocalMutation`) avec :
   - `id` : UUID unique de la mutation (`clientMutationId`).
   - `resourceType` & `resourceId` : Type et identifiant de la ressource.
   - `action` : Ex. `CREATE`, `UPDATE`.
   - `payload` : Contenu sérialisé au format JSON.
   - `status` : `pending`.
3. **Vidage de la File (`flushOutbox()`)** :
   - Les mutations `pending` sont lues dans l'ordre chronologique de création (`createdAt`).
   - Chaque mutation est transmise au serveur via `POST /api/fhir/{resourceType}`.
   - Headers transmis :
     - `Authorization: Bearer <token>`
     - `X-Client-Mutation-Id: <mutation.id>` (garantie d'idempotence)
     - `X-Poste-Id: <posteId>` (traçabilité de la station)

#### Traitement des Réponses Serveur

| Code HTTP / Résultat | Action Client | Statut Outbox |
| --- | --- | --- |
| **200 OK / 201 Created** | Mutation acceptée par le serveur. | `status = 'sent'` |
| **409 Conflict** | Conflit de version (la ressource a été modifiée entre-temps sur le serveur). | `status = 'failed'`, `errorMessage = 'Version Conflict (409)'` |
| **400 Bad Request** | Erreur de validation des données FHIR. | `status = 'failed'`, `errorMessage = 'Validation Error'` |
| **Erreur Réseau / Timeout** | Le serveur n'est pas joignable. La boucle s'interrompt. | Reste `pending`, planifié pour re-tentative automatique dans 10 secondes. |

### 3.3 Synchronisation Descendante Incrémentale (Pull Delta Sync)

Pour récupérer les modifications effectuées par d'autres postes sur le réseau sans télécharger l'intégralité de la base de données, le client utilise le filtre FHIR `_lastUpdated`.

- **Fonction** : `pullDeltas()`
- **Requête HTTP** : `GET /api/fhir/{resourceType}?_lastUpdated=gt{lastSyncedAt}`
- **Ressources Synchronisées** : `Patient`, `Appointment`, `Encounter`, `Observation`, `CarePlan`, `DiagnosticReport`, `MedicationRequest`, `Medication`, `SupplyRequest`, `Invoice`.
- **Protection des Mutations Locales** : Avant d'appliquer une mise à jour descendante pour une ressource `id`, le client vérifie si cette même ressource possède une mutation en attente (`pending`) dans la table `outbox`. Si c'est le cas, la mise à jour descendante est ignorée pour ne pas écraser l'écriture locale non encore synchronisée.
- **Fréquence** :
  1. Au démarrage de l'application.
  2. À chaque reconnexion WebSocket réussie.
  3. Toutes les 5 minutes via un `setInterval` de sécurité.

---

## 4. WebSocket & Notifications Temps Réel

Le canal WebSocket assure la propagation instantanée des modifications à travers le réseau hospitalier.

```
┌──────────────┐                                       ┌───────────────────────────┐
│ Client (Main)│                                       │ Server (Realtime Gateway) │
└──────┬───────┘                                       └─────────────┬─────────────┘
       │                                                             │
       │ 1. wss://<server>:<port>/ws/                                │
       ├────────────────────────────────────────────────────────────►│
       │                                                             │
       │ 2. Send Auth: { type: 'auth', token: '<JWT>' }              │
       ├────────────────────────────────────────────────────────────►│
       │                                                             │
       │ 3. Reply Auth: { type: 'auth.ok', channels: [...] }         │
       │◄────────────────────────────────────────────────────────────┤
       │                                                             │
       │    [ Trigger: pullDeltas() + flushOutbox() ]                │
       │                                                             │
       │ 4. Push Event: { type: 'resource.updated', payload: ... }   │
       │◄────────────────────────────────────────────────────────────┤
       │                                                             │
       │    [ Save to SQLite + Send IPC 'sync:data-updated' to UI ] │
```

### 4.1 Connexion & Authentification Séquentielle

Pour éviter d'exposer les jetons JWT dans les URLs des journaux d'accès HTTP/Nginx, l'authentification WebSocket se fait en deux temps :

1. Établissement de la connexion WebSocket vers `wss://<host>:<port>/ws/`.
2. Envoi immédiat du premier message applicatif :

   ```json
   { "type": "auth", "token": "<JWT_ACCESS_TOKEN>" }
   ```

3. Le serveur valide le jeton et répond avec :

   ```json
   { "type": "auth.ok", "channels": ["role:doctor", "site:main"] }
   ```

### 4.2 Traitement des Notifications Distantes

Lorsqu'un autre utilisateur modifie un enregistrement :

1. Le serveur publie un événement `resource.updated` sur Redis Streams.
2. La Gateway WebSocket diffuse le message à tous les postes abonnés au canal concerné.
3. Le processus Main du client reçoit le message `{ type: 'resource.updated', payload: { resourceType, resource } }`.
4. Si la ressource n'a pas de mutation `pending` locale dans l'outbox, elle est enregistrée dans SQLite via `saveResourceToLocal()`.
5. Un événement IPC `sync:data-updated` est émis à toutes les fenêtres Electron pour rafraîchir l'affichage React en temps réel.

### 4.3 Gestion des Coupures & Reconnexion Auto

En cas de perte de connexion WebSocket :

- Le statut passe à `isOnline = false` et l'IHM est notifiée via `sync:status-changed`.
- Un algorithme de **Reconnexion avec Backoff Exponentiel & Jitter** est enclenché :
  - Délai initial : `1000 ms`.
  - Doublement du délai à chaque échec, plafonné à `30 000 ms` (+ composante aléatoire Jitter pour éviter les pics de charge simultanés sur le serveur).
- **Rattrapage à la Reconnexion** : Dès que le WebSocket se re-connecte et s'authentifie avec succès, `pullDeltas()` et `flushOutbox()` sont immédiatement exécutés pour combler le retard accumulé pendant la coupure.

---

## 5. Idempotence & Traçabilité (`posteId` et `clientMutationId`)

Pour garantir qu'une coupure réseau lors de l'envoi d'une requête ne crée pas de doublon sur le serveur :

1. **Identification du Poste (`posteId`)** :
   - Chaque installation client génère un UUID unique persistant (`posteId`) conservé dans `electron-store`.
   - Transmis dans l'en-tête HTTP `X-Poste-Id` à chaque requête.

2. **Idempotence des Mutations (`clientMutationId`)** :
   - Chaque opération d'écriture génère un `id` UUID unique lors de son insertion dans l'outbox locale.
   - Transmis au serveur dans l'en-tête `X-Client-Mutation-Id` et dans le corps de la ressource.
   - Le serveur enregistre ce `clientMutationId`. Si la même requête est reçue deux fois (ex. réémission après un timeout), le serveur détecte l'UUID déjà traité et renvoie la ressource existante sans créer de doublon.

---

## 6. Mapping des Données (FHIR ⇄ SQLite Drizzle)

Les ressources médicales au format FHIR (JSON) sont cartographiées vers les tables SQLite du client via des fonctions de conversion dédiées (`mapRowToResource` et `mapResourceToRow`).

| Ressource FHIR | Table SQLite Drizzle | Description |
| --- | --- | --- |
| `Patient` | `patients` | Dossiers administratifs et démographiques des patients |
| `Observation` | `vitals` | Signes vitaux (Tension, Pouls, Température, SpO2) |
| `CarePlan` | `careTasks` | Plan d'injections, soins et tâches infirmières |
| `Encounter` | `consultations` | Consultations et examens médicaux |
| `DiagnosticReport` | `labRequests` | Demandes et résultats d'analyses de laboratoire |
| `MedicationRequest` | `prescriptions` | Ordonnances et prescriptions médicamenteuses |
| `Medication` | `inventory` | Stocks de médicaments et consommables |
| `SupplyRequest` | `purchaseOrders` | Commandes d'approvisionnement |
| `Appointment` | `appointments` | Rendez-vous et planning de réception |
| `Invoice` | `invoices` | Factures et règlements de caisse |

---

## 7. Interfaces IPC & Synchronisation côté UI (Renderer)

Le processus Renderer (React) communique avec le module de synchronisation via le pont IPC sécurisé `contextBridge`.

### Canaux IPC Exposés

- **`sync:getStatus`** : Retourne l'état courant (`isOnline`, `lastSyncedAt`, `pendingCacheSync`).
- **`sync:toggleOnline`** : Permet de basculer manuellement entre le mode En ligne et Hors-ligne.
- **`sync:triggerDeltas`** : Force le déclenchement immédiat d'une synchronisation incrémentale.
- **`sync:getServerConfig`** / **`sync:updateServerConfig`** : Lecture et modification dynamique de l'hôte/port du serveur central.
- **`sync:testConnection`** : Teste la joignabilité du serveur via l'endpoint `/discovery`.

### Événements Émis vers la Vue React

- **`sync:status-changed`** : Diffusé dès que le nombre d'éléments en outbox ou le statut réseau change.
- **`sync:data-updated`** : Diffusé lorsqu'une ressource est mise à jour localement suite à une notification WebSocket, déclenchant l'actualisation des stores Zustand et des composants UI.
