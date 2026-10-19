# Objely

**Objely met en relation les personnes qui perdent un objet et celles qui le trouvent.**
On déclare un objet perdu ou trouvé, Objely cherche automatiquement les déclarations qui correspondent, puis les deux personnes échangent et organisent la restitution en toute sécurité.

🔗 **Démo : [objely.vercel.app](https://objely.vercel.app)**

---

## Fonctionnalités

- **Déclaration en quelques étapes** : objet perdu ou trouvé, catégorie, couleurs, marque, lieu, date et photos.
- **Rapprochement automatique** : chaque déclaration reçoit un score de correspondance avec les objets existants (voir plus bas).
- **Vérification de propriété** avant toute restitution, et vérification d'identité depuis le profil.
- **Messagerie en temps réel** : réponses, modification et suppression de messages, messages vocaux.
- **Rendez-vous de restitution** synchronisés en temps réel entre les deux personnes.
- **Communautés** avec leurs propres objets et leur discussion de groupe.
- **QR code personnel** : un objet étiqueté renvoie vers un profil public pour contacter son propriétaire.
- **Notifications push** sur le web.
- **Score de confiance** des utilisateurs, qui progresse avec les objets rendus.
- **Assistant de support** basé sur Gemini, avec une limite de requêtes pour maîtriser les coûts.
- **RGPD** : suppression du compte, pages CGU et confidentialité.

## Comment fonctionne le rapprochement

Le calcul est fait directement dans PostgreSQL, par la fonction `find_best_match_candidate`.
Seul le meilleur candidat quitte la base, ce qui évite de charger toutes les déclarations dans le navigateur.

| Critère | Points |
|---|---|
| Même type inverse (perdu ↔ trouvé) et même catégorie | 40 (base) |
| Au moins une couleur en commun | +15 |
| Même marque | +15 |
| Au moins un mot de lieu en commun | +15 |
| Dates à 14 jours d'écart au plus | +15 |

Le score est plafonné à 100. Un index partiel sur `(type, category_id, status)` accélère la recherche.

## Base de données

- **80 migrations** Supabase / PostgreSQL versionnées dans `supabase/migrations`
- Sécurité par ligne (RLS) sur les tables, fonctions SQL pour les opérations sensibles
- Suppression logique des objets, stockage des photos et avatars, temps réel sur les messages et les rendez-vous

## L'écosystème Objely

| Application | Rôle |
|---|---|
| **Objely** (ce dépôt) | Application principale pour le grand public |
| [Objely Admin](https://github.com/maureljean55/objely-admin) | Modération : indicateurs, utilisateurs, rapprochements, support, signalements |
| [Objely École](https://github.com/maureljean55/objely-ecole) | Borne tactile pour les lycées et universités |
| [Objely École Admin](https://github.com/maureljean55/objely-admin-ecole) | Gestion des objets par la vie scolaire |

## Stack

Next.js · React · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage, Realtime) · Web Push · API Gemini · Vercel

## Lancer le projet en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

Variables d'environnement à définir dans `.env.local` :

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase |
| `SUPABASE_SECRET_KEY` | Clé serveur Supabase (côté serveur uniquement) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |
| `GEMINI_API_KEY` | Assistant de support |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Notifications push |

## Auteur

**N'cho Jean Maurel Monne**, étudiant en intelligence artificielle à l'ECE Paris · [GitHub](https://github.com/maureljean55)
