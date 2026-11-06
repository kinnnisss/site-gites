# Espace Équipe — recette réelle du 6 novembre 2026

## Décision

**Recette Cloud interrompue et non validée. Le module doit rester fermé en
production.** Les connexions et des écritures réelles ont réussi, mais le test
indispensable de révision obsolète n’a pas reçu la réponse attendue. La concurrence
et les parcours Next.js avec persistance réelle ne sont donc pas déclarés réussis.

Le présent rapport actualise la situation auparavant bloquée par les variables
absentes dans `ESPACE_EQUIPE_RECETTE_REELLE.md`. Les rapports historiques ne sont
pas réécrits et leurs simulations ne sont pas comptées comme des succès Cloud.

## Cible, branche et périmètre

- Dépôt : `kinnnisss/site-gites`.
- Branche exclusive : `fix/recette-espace-equipe`, initialement propre.
- Départ et dernier `origin/main` vérifiés après fetch :
  `9035a2e0ed3ae641216d8045b10cccd400f97107`.
- Project Reference de développement : `jijjjgsfdbrkvqvhyjwr`.
- Les 13 variables privées sont présentes. La variable de référence contient le
  hostname complet : sa normalisation stricte donne exactement le projet de
  `NEXT_PUBLIC_SUPABASE_URL`. Aucune valeur d’identifiant ou de clé n’est reproduite.
- Clé `sb_publishable_…` exclusivement ; JWT de membres réels, vérifiés par Auth.
- Node 22.23.4, Next 16.4.5, SDK Supabase installés depuis le lockfile existant.
- Accès derrière le proxy Cloud avec `NODE_USE_ENV_PROXY=1`, TLS maintenu.

Le propriétaire a explicitement autorisé les créations/modifications/suppressions
des seuls UUID synthétiques générés pendant la recette. Aucun dossier préexistant
n’a été modifié. Aucun compte Auth, fiche `team_members`, réglage Supabase,
migration distante, politique RLS ou ressource Vercel n’a été modifié.
L’Administrateur principal n’a été ni utilisé ni modifié.

## Profils et résultats réels Supabase Cloud

Les cinq connexions ont été exécutées dans le script manuel. `auth.getUser()`,
l’adresse attendue (comparée sans être affichée), le sujet et l’émetteur du JWT
ont été vérifiés. Les cinq sujets sont distincts. L’Admin fictif a lu uniquement
les cinq fiches ciblées pour distinguer inactivité et absence de fiche.

| Profil | Résultat Auth réel | Fiche vérifiée |
| --- | --- | --- |
| ADMIN de test | Réussi | `admin`, `active=true` |
| AGENT_A recréé | Réussi | `agent`, `active=true` |
| AGENT_B | Réussi | `agent`, `active=true` |
| INACTIVE | Réussi | `agent`, `active=false` ; fiche invisible dans sa propre session |
| NO_MEMBER | Réussi | Aucune fiche, confirmé par l’Admin de test |

| Contrôle Cloud | État et preuve |
| --- | --- |
| Auth et identités des cinq profils | Réussi réellement, avant toute mutation |
| Lecture des fiches par les actifs ; masquage pour inactif/sans fiche | Réussi réellement |
| Refus anonyme de lecture et de création | Les assertions du script initial ont reçu des erreurs ; leur code n’était pas journalisé. Les contrôles préalables du chat avaient confirmé HTTP 401/SQLSTATE 42501 en lecture. Le script livré exige maintenant le code exact, pour exclure les erreurs de transport ; cette nouvelle assertion n’a pas été rejouée à distance après l’arrêt |
| Création Agent A | Réussie, dossier synthétique à la révision 1 |
| Lecture Agent B et payload intégral | Réussie : comparaison de tout le payload v1, avec chaînes vides, accents, espaces, retours à la ligne, dates locales et tableaux |
| Modification Agent B | Réussie, révision 2 |
| Auteurs serveur A/B et révision | Réussis, UUID comparés en mémoire sans les publier |
| Sauvegarde avec révision 1 après passage à 2 | **Échouée techniquement : réponse attendue non reçue**, voir diagnostic ci-dessous |
| Deux sauvegardes concurrentes | **Non testé**, arrêt avant ce scénario |
| Payload invalide, écritures inactif/sans fiche, suppression Agent, DELETE brut, mauvaises confirmations | **Non testés dans cette recette Cloud**, arrêt avant ces scénarios |
| Modification opérationnelle par l’Admin | Non testée ; ne pas la confondre avec le nettoyage |
| Suppression par RPC Admin et nettoyage | Réussis pour les UUID connus, avec confirmation exacte et révision courante ; contrôle différé effectué |
| Fermeture des sessions de test | `scope: local` demandé dans les blocs `finally`. HTTP 204 observé dans les diagnostics Admin/A. Le parcours final d’assertions des cinq déconnexions n’a pas été atteint |

## Incident de conflit et diagnostic

Commande autorisée réellement exécutée, sous Node 22 :

```bash
NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/supabase-manual.mjs --allow-development-writes
```

1. Première exécution, **11:32:36–11:33:01 UTC** : arrivée au test de révision
   obsolète, puis arrêt. Le libellé initial « Révision obsolète acceptée » était
   trop affirmatif : il signifiait seulement que le code `40001` n’avait pas été
   observé. Le bloc de nettoyage n’a signalé aucune erreur.
2. Reproduction instrumentée, **11:34:18–11:34:42 UTC**, sur un nouvel UUID :
   réponse SDK `status=0`, erreur sans SQLSTATE, alors que la relecture donne
   toujours **révision 2**. Aucun écrasement n’a été constaté. Le nettoyage et
   l’absence du dossier ont été confirmés.
3. Diagnostic sur le seul UUID précédent déjà absent : un RPC de modification
   conditionnelle, donc sans création possible, reçoit HTTP 500/`P0002` en
   environ 375 ms. L’endpoint est joignable ; cela ne valide pas le conflit.
4. Diagnostic brut sans le parseur PostgREST du SDK, sur un troisième dossier
   synthétique : une création initiale réussit ; la tentative de recréation du
   même UUID ne reçoit aucune réponse avant **55 002 ms** (`TimeoutError`). Le
   défaut ne se limite donc pas au décodage d’erreur par le SDK. La durée de
   55 secondes n’a été utilisée que pour cette mesure, sans changer l’application.
5. Après un reçu de suppression correct, ce dernier UUID est encore visible.
   Une création restée en cours puis validée tardivement est une hypothèse ;
   la cause exacte n’a pas été établie. Le dossier a été supprimé de façon
   ciblée une seconde fois, puis son absence vérifiée immédiatement, à +5 s
   et au contrôle final ultérieur.

**La localisation du défaut reste indéterminée entre le chemin réseau, la
passerelle/PostgREST et le traitement SQL distant.** Le résultat n’établit ni une
acceptation de révision obsolète, ni un contournement RLS. Le SQL versionné lève
`40001` sur conflit et le test PostgreSQL local passe ; cela ne prouve pas que
la définition/configuration distante est identique ou que son erreur est
correctement transportée. Aucune migration corrective n’est inventée ou appliquée
sans cause démontrée. Le délai serveur de l’application n’a pas été augmenté
pour transformer le blocage en réussite.

Les autres écritures métier ont été suspendues. Seuls les diagnostics ciblés et
le nettoyage des UUID générés ont suivi l’échec. Aucun parcours réel Next.js
avec création de dossier n’a été lancé après cet incident.

## Nettoyage et résidus

| Exécution | UUID synthétique | Contrôle final |
| --- | --- | --- |
| Reproduction instrumentée | `473fb7b4-b987-4291-b359-15e753ad5628` | 0 ligne |
| Diagnostic brut | `cd51b563-94ac-412a-b93c-3fbd818ee779` | 0 ligne après nettoyage ciblé complémentaire |
| Première exécution | UUID non émis par l’ancienne version du script | Nettoyage sans erreur signalée. Recherche finale en lecture seule par créateur Agent A, référence `PHASE4-TEST-B` et intervalle exact de création : 0 candidat |

**Aucun résidu détecté au contrôle final.** La première exécution ne dispose pas
d’une preuve d’absence par UUID, puisque l’ancien journal ne l’avait pas conservé.
Cette limite est explicite ; aucune suppression par référence ou par intervalle
n’a été exécutée. La recherche finale est restée strictement en lecture seule.
Une réponse HTTP interrompue ne garantit pas l’annulation d’une transaction
distante : conserver les UUID et vérifier les commits tardifs avant toute reprise.

## Corrections livrées

Uniquement des outils de recette et ce rapport ; aucun composant métier ou visuel,
SQL de migration, dépendance, verrou de production ou fichier de référence modifié.

- `tests/etats-des-lieux/development-target.mjs` : référence courte ou hostname
  exact acceptés ; autre projet, destination ambiguë et redirection refusés.
  Garde réseau limitant les mutations au seul UUID généré et aux sessions Auth
  locales ; aucun endpoint de création de compte ou d’écriture de membre autorisé.
- `development-target.test.mjs` : trois tests de non-régression couvrant le
  format réel de configuration, les cibles incorrectes et les requêtes interdites.
- `supabase-manual.mjs` : vérification renforcée de l’identité/projet et des cinq
  rôles/statuts, détection de collision avant mutation, UUID journalisé avant les
  tentatives, y compris anonymes, diagnostic contrôlé du conflit, erreur de
  transport distincte d’un succès, erreurs brutes sensibles masquées, absence
  vérifiée après nettoyage. Même une tentative anonyme censée échouer marque
  désormais l’UUID pour nettoyage. Le DELETE brut sera suivi d’une relecture.

Le dernier durcissement du garde réseau et du refus anonyme a été testé localement,
**pas rejoué sur Cloud** : le blocage indispensable doit être résolu avant de
reprendre la suite distante. Aucun correctif de l’application n’est prétendu
validé de bout en bout.

## Vérifications locales réellement exécutées

| Vérification | Résultat et portée |
| --- | --- |
| `npm run lint` | Réussi |
| `npx next typegen` | Réussi |
| `npx tsc --noEmit` | Réussi |
| `npm run build` | Réussi avec Turbopack ; vitrine statique, équipe dynamique, aucune route de test livrée |
| `node tests/auth/policy.test.mjs` | 27 tests réussis ; décisions pures, pas Auth Cloud |
| `node tests/etats-des-lieux/persistence.test.mjs` | 9 tests réussis |
| `node tests/etats-des-lieux/request-body.test.mjs` | 4 tests réussis |
| `node tests/etats-des-lieux/development-target.test.mjs` | 3 tests réussis |
| `rls-local.mjs` avec PGlite 0.5.15 | 48 contrôles PostgreSQL locaux réussis ; désactivation simulée localement incluse |
| `fidelity.mjs` | 46/46 comparaisons exactes, interactions, JSON et impressions du banc local réussis |
| `persistence-browser.mjs` | Réussi : sauvegarde, doubles clics, conflits, rechargement accepté/annulé, Effacer, export, impression, réseau et responsive ; **transport intercepté**, sans Supabase |
| `tests/public/non-regression.mjs` | 6/6 paires identiques à `origin/main`, contenus/métadonnées, clavier, menu, ancres et responsive réussis |
| `tests/auth/http.mjs` | 28 contrôles réussis sur le build Next réel **sans configuration Supabase** |
| `tests/etats-des-lieux/http.mjs` | 17 contrôles réussis dans cette même configuration fermée |

Les commandes Node ont été exécutées directement pour conserver le détail des
tests, plutôt que compter seulement les fichiers du lanceur `--test`. PGlite a
été installé sous `/tmp/site-gites-test-tools`, sans dépendance applicative ajoutée.
La vitrine a été comparée à un checkout détaché du même `origin/main`, sans
modification de sa branche. Les routes temporaires des bancs ont été retirées
avant le build final.

Référence HTML inchangée, SHA-256 vérifié :

```text
9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0
```

Artefacts locaux de cette session, non livrés dans Git et non pérennes :

- `/tmp/site-gites-recette/` : journaux des suites et contrôle final de nettoyage.
- `/tmp/site-gites-phase2/run-1793964914975/` : comparaison formulaire et A4.
- `/tmp/site-gites-public/run-1793965218788/` : comparaison vitrine.

## Application Next.js réelle, simulations et scénarios non validés

Les serveurs et navigateurs des suites locales utilisent le véritable build ou
Next dev. Ils ne prouvent aucune sauvegarde réelle via les Route Handlers.
Les connexions Next réalisées dans les vérifications préalables du chat ne
remplacent pas la recette de persistance demandée ici.

**Non testés après le blocage Cloud :** connexion applicative des trois actifs,
API de session avec JWT dans le navigateur, cookies HttpOnly/SameSite/Secure
sur ce parcours, refus des profils avec JWT et falsification de rôle, création
par formulaire, réouverture après nouvelle session, lecture inter-agents par
l’interface, concurrence entre navigateurs, Effacer sans écriture réelle,
impression/export autorisés sur dossier Cloud et suppression par l’interface Admin.
Le drapeau `TEAM_INSPECTIONS_ENABLED=true` n’a pas été activé pour ces scénarios.

Le renouvellement, l’expiration et la révocation réelle des refresh tokens ne
sont pas validés. Les tests de politique et de désactivation locale restent des
**simulations locales** ; aucune désactivation distante n’a eu lieu.

La gestion/élévation des fiches `team_members` n’a pas été tentée, conformément à
l’interdiction de les modifier. La récupération de mot de passe/SMTP, l’usage
unique des liens et leurs expirations restent **non testés** : aucun e-mail réel
ni changement de mot de passe n’est autorisé. Aucun compte supplémentaire créé.

## Conditions de reprise et d’ouverture

1. Examiner en lecture seule, dans le projet de développement, les journaux
   réseau/REST/DB correspondant aux heures et UUID ci-dessus. Comparer les
   définitions distantes des RPC/trigger et les réglages transactionnels avec
   les migrations versionnées ; utiliser au besoin
   `supabase/manual/phase4-security-review.sql` sous contrôle du propriétaire.
   Ne pas réappliquer les migrations ni changer les RLS à l’aveugle.
2. Établir la cause du timeout de conflit et du dossier visible après un reçu de
   suppression. Si une correction SQL est démontrée nécessaire, préparer une
   nouvelle migration versionnée et la faire appliquer séparément par le
   propriétaire ; aucune autorisation d’application distante n’est incluse ici.
3. Après résolution, revérifier les UUID connus, puis rejouer le script manuel
   et réussir réellement révision obsolète, concurrence, payload invalide,
   restrictions des profils et suppression confirmée, avec preuve de nettoyage.
4. Seulement après ce succès, ouvrir le processus local de recette avec le
   drapeau demandé, sans falsifier `VERCEL_ENV`, puis exécuter tous les parcours
   navigateur réels et contrôles de sessions restants.
5. Obtenir les autorisations distinctes pour les essais nécessitant comptes ou
   e-mails, puis la validation humaine de la fidélité et des règles métier.
6. Respecter toutes les conditions d’hébergement, base de production isolée,
   sauvegarde/restauration, confidentialité et conservation du handoff avant
   une décision distincte d’ouverture.

Le verrou `VERCEL_ENV=production` reste intact, le module reste fermé et aucune
fusion ou mise en production n’est autorisée par ce rapport. Une PR éventuelle
est une livraison de corrections de recette, **pas une validation d’ouverture**.

## Livraison

Les corrections sont préparées sur `fix/recette-espace-equipe`. Le SHA de livraison
est celui du commit contenant ce rapport (`git log -1`). La consultation des PR
par `gh` a échoué avec `Post https://api.github.com/graphql: Forbidden` ; le domaine
API n’est pas dans les destinations déclarées autorisées de l’environnement.
Le texte de PR est préparé séparément, sans prétendre qu’une PR a été créée.
La branche peut être examinée et une PR brouillon ouverte depuis l’interface
GitHub, sans fusion automatique. Aucun contournement réseau ni changement de
configuration Cloud n’a été effectué pour accéder à l’API.
