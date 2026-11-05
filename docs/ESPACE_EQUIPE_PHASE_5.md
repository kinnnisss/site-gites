# Espace Équipe — phase 5 : audit et préparation de la recette

## État au 5 novembre 2026

L’application est préparée techniquement pour la recette finale. **Elle n’est pas
déclarée prête pour la production.** Les connexions, sessions, RLS et écritures
réelles seront validées ultérieurement par le propriétaire.

Le propriétaire indique avoir appliqué manuellement les migrations `team_members`
et `inspection_dossiers` sur Supabase de développement, puis contrôlé les tables,
politiques, fonctions et le référentiel. C’est une information de reprise fournie
par le propriétaire, pas une vérification distante de cette session. Aucun secret
Supabase ni variable d’environnement métier n’est configuré ici.

- Dépôt : `kinnnisss/site-gites` ; branche : `feature/espace-equipe`.
- Départ local et distant vérifié : `1646189a0e8b1427337221728158950e10b0a602`.
- `main` distant au début : `bfc7a5a7161b5a61312c9da2f3075ed129b4bac8`.
- La livraison est le commit qui contient ce rapport ; son SHA est donné dans le
  compte rendu de livraison et par `git rev-parse HEAD` après récupération.
- Drapeau laissé absent/fermé ; `.env.example` conserve `false`.
- Verrou `VERCEL_ENV=production` conservé, sans exception.
- Aucun utilisateur distant, e-mail, test authentifié distant, écriture Supabase,
  réglage Vercel/Supabase, migration, fusion ou déploiement de production exécuté.

La procédure autonome de recette, de publication future et de retour arrière est
dans [ESPACE_EQUIPE_HANDOFF.md](ESPACE_EQUIPE_HANDOFF.md). Les rapports 1 à 4 restent
des comptes rendus historiques ; ce rapport et le handoff précisent l’état actuel.

## Problèmes vérifiés et corrections

### Dépendances affectées par des avis de sécurité

`npm audit --json` initial signalait 11 paquets affectés : 1 critique, 2 élevés
et 8 modérés, dépendances indirectes comprises. Ce décompte inclut les remontées
de la même vulnérabilité vers plusieurs paquets parents. Ce n’est pas un nombre
de failles indépendantes démontrées dans cette application.

| Dépendance | Avant | Après | Motif |
| --- | --- | --- | --- |
| `next` | 16.3.6 | 16.4.5 | Version affectée par les avis Next.js ; mise à jour dans la même version majeure |
| `eslint-config-next` | 16.3.6 | 16.4.5 | Alignement avec le framework |
| `source-map-js` indirect | 1.2.1 | 1.2.2 | Correctif de déni de service signalé par l’audit |
| `zod` indirect, outils ESLint | 4.6.5 | 4.6.7 | Correctif de consommation mémoire, version admise par les parents |
| `minimatch` sous `@typescript-eslint/typescript-estree` | 10.2.6 | 11.0.1 | Correctif d’amplification de motifs glob ; override limité à ce parent |

Les avis officiels consultés comprennent ceux sur
[l’optimisation d’images](https://github.com/advisories/GHSA-2464-fhr4-w9xw),
[`use cache`](https://github.com/advisories/GHSA-673q-mjm6-r5xr),
[`source-map-js`](https://github.com/advisories/GHSA-68fv-2mgg-jv7q),
[`zod`](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) et
[`minimatch`](https://github.com/advisories/GHSA-g3hv-75wg-m249).
Le paquet Next installé était dans les plages concernées. L’exploitation des
scénarios particuliers sur le site n’a pas été démontrée ; aucun test d’exploitation
ni accès à la production n’a été effectué. Le projet n’active pas `use cache`.

L’override `minimatch` est nécessaire car la branche actuelle de typescript-eslint
déclare encore une plage 10.x. Il concerne un outil de développement, sans changer
les autres usages de minimatch 3.x. C’est une substitution de version majeure
indirecte : lint, compilation, TypeScript et tests doivent rester exigés lors de
toute mise à jour. Le retirer seulement quand la dépendance parente accepte un
correctif sûr sans override. Aucun `npm audit fix --force` ni retour à Next 15.

L’audit final donne **0 vulnérabilité signalée** à la date de cette session. Cette
observation ne remplace ni la recette réelle ni une nouvelle vérification avant
publication. Les SDK Supabase et les versions React n’ont pas été modifiés.

### Recette manuelle : création dont le reçu est perdu

Dans le script de phase 4, le nettoyage dépendait d’un booléen positionné seulement
après réception du reçu de création. Si PostgreSQL validait l’écriture mais que
la réponse réseau était perdue, l’UUID synthétique pouvait ne pas être signalé
au propriétaire et le nettoyage pouvait être omis.

Le script marque désormais la tentative avant l’appel, distingue le reçu confirmé,
borne les requêtes réseau et tente la lecture/nettoyage de son seul UUID. Après
un reçu perdu, il signale cet UUID même si la lecture immédiate ne trouve rien :
un commit tardif doit être vérifié. Les erreurs de nettoyage sont explicites.
Il vérifie aussi cinq identités distinctes et les UUID exacts du créateur et du
modificateur, sans les journaliser. Le script reste manuel, protégé par son option
d’autorisation et le Project Reference épinglé. Il **n’a pas été exécuté à distance**.

### Comportements essentiels auparavant non couverts

Deux tests vérifient explicitement le drapeau absent/faux, les valeurs non admises
et la priorité du verrou de production. La condition a été extraite dans un
helper pur ; elle est inchangée. `requireInspectionMember` continue d’appeler
`requireTeamMember` avant d’autoriser une opération. Le drapeau n’authentifie jamais.

Quatre tests couvrent la lecture des corps JSON : contenu exact, mauvais format,
UTF-8 invalide, taille exacte de 1 Mio, dépassement d’un octet et annulation d’un
flux excessif sans `Content-Length`. La fonction est isolée sans changement de
comportement ; le module HTTP garde `server-only` et les routes gardent leurs
contrôles d’accès avant la lecture. Aucun marqueur de sécurité ou fournisseur
Auth n’a été remplacé pour ces tests.

Le contrôle public auparavant ponctuel est rendu reproductible dans
`tests/public/non-regression.mjs`. Il compare deux checkouts locaux et contrôle
aussi clavier, menu, ancres, erreurs JavaScript et débordements.
Next 16.4 déplace la balise interne `next-size-adjust` : le comparateur normalise
l’ordre des métadonnées, sans ignorer leurs valeurs. Les clics attendent la
navigation effective avant les assertions d’ancre.

## Périmètre de l’audit du code

| Sujet | Constat et limite |
| --- | --- |
| Serveur/client | DAL et clients Supabase serveur marqués `server-only` ; navigateur limité aux API de même origine ; aucune clé privilégiée utilisée |
| Identité/rôle | `auth.getUser()` puis fiche `team_members` relue ; rôle de cookie, en-tête ou payload non accepté comme autorisation |
| Routes/pages | Layout privé et contrôle propre à chaque page ; GET/POST/PATCH/DELETE contrôlés séparément ; formulaire nouveau également protégé |
| Disponibilité | Drapeau exact `true` nécessaire hors production ; le verrou de production prévaut ; aucune activation de configuration pendant la mission |
| Données | Payload v1 complet, copies isolées, forme et valeurs de contrôle validées ; brouillons incomplets, dates locales et chaînes vides préservés |
| Concurrence | RPC invoker, UPDATE conditionnel sur l’UUID et la révision dans une instruction ; HTTP 409 sans effacer la mémoire |
| RLS | Tables de dossiers protégées ; actifs partagent tous les dossiers ; agents exclus de DELETE/gestion des membres ; lecture du modèle seule autorisée |
| Suppression | Admin actif vérifié côté serveur et dans le RPC ; confirmation UUID et révision ; contexte transactionnel exigé par la politique DELETE |
| Métadonnées | Trigger serveur, auteurs issus de `auth.uid()`, création immuable ; pas de métadonnée imposée par le navigateur |
| Sessions | Cookies HttpOnly, SameSite=Lax, chemin `/equipe`, Secure en build de production ; Proxy renouvelle mais ne remplace pas la DAL |
| Cache | Équipe dynamique, fetch `no-store`, réponses privées ; Proxy applique aussi les en-têtes de renouvellement du SDK |
| Erreurs | Messages contrôlés, pas de corps d’erreur fournisseur ; 401/403/404/409/413/415/503 selon le cas ; les tests HTTP anonymes n’atteignent pas les écritures autorisées |
| Logs | Aucun nouveau log applicatif de payload, identifiant personnel, mot de passe ou jeton ; les logs d’infrastructure restent à contrôler par le propriétaire |
| Impression/export | Permission serveur revérifiée par les boutons ; `window.print`, CSS original et JSON v1 conservés ; le navigateur garde le contrôle de ses fonctions natives |
| Vercel | Rendu serveur et cookies requis ; pas d’export statique ; bases isolées, origine de récupération stable et configuration par environnement nécessaires |

Les fonctions RLS et RPC existantes ont été examinées et rejouées dans PostgreSQL
local. Le prédicat de membre actif utilise `SECURITY DEFINER` uniquement pour lire
le rôle de l’appelant sans récursion ; les opérations de dossier restent invoker.
Le schéma privé doit rester hors des schémas exposés par la Data API.
Le drapeau est applicatif : les appels directs Supabase restent régis par les
RLS. Le handoff distingue donc la fermeture de l’interface et un gel complet des
écritures avant une éventuelle restauration de base.

Il n’y a ni nouvelle migration, ni changement de grants/politiques ni changement
du payload. Les empreintes locales des migrations restent :

```text
20261105000100_team_members.sql
2a05486dde2538cdf419cc8df517c4adf3c086362448486fb5dee8c24409ac54
20261105000200_inspection_dossiers.sql
823083738a76f965e40a2f4d8158b8f1a5bd435ef5504ba060ff8a6a94d90aad
```

## Validation locale

Node.js **22.23.4**, Next.js **16.4.5**. Node 22 a été installé uniquement dans un
répertoire de travail externe pour les contrôles. Playwright, Chromium, Python,
Pillow, Poppler et PGlite sont disponibles ; aucune dépendance de test ajoutée au
paquet applicatif. Aucun outil nécessaire à ces contrôles n’est resté manquant.

| Contrôle | Résultat |
| --- | --- |
| `npm ci` | Réussi depuis le lockfile corrigé, sous Node 22 |
| `npm run lint` | Réussi sans erreur ni avertissement de lint |
| `npx tsc --noEmit` | Réussi après `npx next typegen` |
| `npm run build` | Réussi avec Turbopack 16.4.5 ; routes Équipe dynamiques, vitrine statique, aucune route d’essai |
| Auth/politique + drapeau | 27 tests réussis, décisions pures, pas de connexion distante |
| Payload/adaptateur | 9 tests réussis |
| Corps JSON | 4 tests réussis, flux locaux sans serveur Auth |
| PostgreSQL local | 48 contrôles réussis : contraintes, RLS, métadonnées et concurrence |
| Fidélité initiale 16.3.6 | 46/46 comparaisons exactes et interactions réussies |
| Fidélité après mise à jour 16.4.5 | 46/46 comparaisons exactes et interactions réussies |
| Persistance navigateur | Réussie : reçus, doubles clics, saisies pendant requête, conflits, rechargement accepté/annulé, Effacer, export, refus de session, réseau, impression et responsive |
| HTTP Auth et dossiers | 28 + 17 contrôles réussis sur le vrai build local, sans configuration Supabase et sans identifiants distants |
| Non-régression publique | Six paires de captures identiques pixel par pixel, contenus/liens/métadonnées identiques après normalisation d’ordre ; neuf contrôles responsive, clavier, menu et ancres réussis |
| Audit npm final | 0 vulnérabilité signalée, dépendances de développement comprises |
| Exemples JavaScript de reprise | Trois blocs vérifiés syntaxiquement, non exécutés contre Supabase |
| Supabase réel / Vercel | Non exécutés, conformément au périmètre |

Un premier `tsc` a rencontré des types `.next/types` hérités de l’ancien checkout,
pointant vers les anciennes routes publiques. Il s’agit de fichiers générés,
pas d’une erreur de source : régénérer avec `npx next typegen`, puis refaire
`npx tsc --noEmit`. Ne pas assouplir TypeScript ou restaurer les anciennes routes.

Les 46 comparaisons du formulaire comprennent 32 captures écran, deux captures
d’impression et 12 pages A4 rastérisées. Les tests du mode de référence ne font
aucune authentification ; les tests avec stockage interceptent seulement le
transport dans un banc local. PGlite utilise une fixture locale d’`auth.uid()`.
Aucun de ces résultats ne valide Supabase Auth, PostgREST Cloud, SMTP, des JWT
réels ni la configuration d’un déploiement Vercel.

Les preuves détaillées sont des artefacts de travail locaux : journaux de suites,
captures, JSON de comparaison et audits npm. Les commandes reproductibles et les
prérequis sont dans le handoff ; les bancs temporaires ne font pas partie du build.

## Fidélité et absence d’ajout métier

La référence HTML reste inchangée, SHA-256 :

```text
9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0
```

Les quatre sections, dix champs, 13 contrôles par phase, 23 cases de procédure,
sept règles, onglets, progression, alerte, récapitulatif, actions, logo, CSS,
responsive, impression et JSON sont conservés. La phase 5 ne modifie aucun
composant de formulaire ni aucun fichier du site vitrine. Les seules différences
par rapport au HTML restent celles de la persistance partagée documentées en phase 4.

Aucun champ, photo, signature électronique, dashboard, réservation, autosauvegarde,
PDF serveur ou autre fonctionnalité métier n’est ajouté. Effacer reste une
réinitialisation de mémoire ; la suppression administrative reste indépendante.

## Blocages et conditions avant production

Il reste à réussir et consigner : connexions réelles des cinq profils et accès
anonyme, déconnexion, renouvellement/expiration, RLS via Data API, gestion des
membres, CRUD partagé, conflit entre deux sessions, récupération de mot de passe,
impression/export et validation client. La configuration, les migrations et le
premier administrateur de production demandent une préparation séparée et autorisée.

Le handoff distingue les preuves indispensables et les contrôles complémentaires.
Il décrit les environnements, les redirections, les limites d’hébergement, les
logs à masquer, la conservation des données à décider, les migrations et les
deux étapes d’un déploiement futur fermé puis activé. **Un rollback Vercel ne
restaure ni les données ni les migrations Supabase.**

Les routes de récupération contiennent un hash de jeton dans l’URL : vérifier
la suppression/masquage de `token_hash`, des cookies et corps sensibles dans les
logs d’accès et outils d’observabilité avant l’envoi de liens réels. La déconnexion
du navigateur ne doit pas être confondue avec la révocation instantanée de tous
les JWT déjà émis ; le protocole traite explicitement ce point.

## Fichiers de cette phase

- `package.json`, `package-lock.json` : versions corrigées et override ciblé.
- `lib/inspections/feature.ts`, `server.ts` : condition de disponibilité inchangée et testable.
- `lib/inspections/request-body.ts`, `http.ts` : isolation du lecteur JSON sans modifier ses contrôles.
- `tests/auth/policy.test.mjs` : deux tests du drapeau.
- `tests/etats-des-lieux/request-body.test.mjs` : quatre tests de transport.
- `tests/etats-des-lieux/supabase-manual.mjs` : robustesse de la recette manuelle.
- `tests/public/non-regression.mjs` : suite publique reproductible.
- `docs/ESPACE_EQUIPE_PHASE_5.md`, `docs/ESPACE_EQUIPE_HANDOFF.md` : audit et reprise.
- `README.md`, `app/equipe/README.md`, `modules/etats-des-lieux/README.md`,
  `tests/auth/README.md`, `tests/etats-des-lieux/README.md` : actualisation ciblée
  de l’état des migrations, des références et des commandes de test.
- `AGENTS.md` : niveau du titre du bloc généré actualisé automatiquement par Next,
  sans modification des consignes du projet.

La liste exacte est donnée par `git show --stat` du commit de livraison. Aucun
fichier de migration, de référence HTML, de formulaire ou de production n’est modifié.
