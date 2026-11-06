# Activation contrôlée de l’Espace Équipe — livraison client

## État de la livraison

Branche : `fix/activation-espace-equipe-production`, créée depuis le dernier
`origin/main`, **`31cc4df77fca9d4468e6c3be9d1288b5ee28f086`**. L’ancienne branche
`fix/recette-espace-equipe` est à `5b9db55` et a été fusionnée par le propriétaire
dans `main` (PR nº 4). Cette préparation ne modifie pas `main`, ne fusionne rien
et ne déclenche aucun déploiement final. Le commit livré est celui contenant
ce rapport (`git log -1`).

Le verrou permanent `VERCEL_ENV !== production` est remplacé par le drapeau
exact `TEAM_INSPECTIONS_ENABLED=true`, admis dans tous les environnements.
Absent, `false`, `TRUE`, `1` ou une autre valeur : accès aux dossiers fermé.
La désactivation ultérieure reste possible par `false` et nouveau déploiement.
Le drapeau n’authentifie jamais : `requireInspectionMember` appelle toujours
`requireTeamMember` avant d’autoriser les données. Configuration Supabase valide,
`auth.getUser()`, fiche active, rôle et permission serveur restent obligatoires ;
les RLS et le JWT du membre s’appliquent ensuite aux opérations PostgreSQL.

Le message fermé devient « L’accès aux dossiers est désactivé sur ce déploiement. »
Il ne prétend plus qu’une validation automatique du projet de développement est
en attente. Le footer est déjà présent dans `main`, avec les deux textes demandés
et `next/link` vers `/equipe/connexion` ; il n’est pas modifié.

## Base actuellement utilisée et prérequis bloquant

Le propriétaire confirme que `NEXT_PUBLIC_SUPABASE_URL` en Vercel Production est
la même que dans Codex : **`jijjjgsfdbrkvqvhyjwr`**, jusque-là nommé
`domaine-lo-carmalhon-dev`. Il indique aussi que le drapeau Production est
**absent ou false** et que sa connexion Admin sur le site officiel fonctionne.
Ces constats Vercel sont fournis par le propriétaire ; aucun accès au dashboard
ou à l’API Vercel n’est connecté ici. La clé et les valeurs distantes n’ont pas
été lues ou modifiées par l’agent. L’accès HTTP au site officiel est refusé par
le proxy Cloud ; aucune réussite navigateur sur ce domaine n’est revendiquée.

**La base actuellement appelée par la Production est donc celle de développement.**
Elle ne devient pas silencieusement une base de livraison par changement du
drapeau. Le propriétaire doit désigner la base destinée à la production : un
projet de production approprié, ou une qualification explicite du projet actuel.
Dans ce second cas, cesser de l’utiliser pour le développement et isoler les
futurs essais avant d’y accueillir des données de voyageurs. Aucun projet Vercel
nouveau ou nouvelle campagne Preview n’est nécessaire pour ce changement de code.

Aucun compte n’est créé, aucun utilisateur Auth ou rôle modifié et aucune donnée
personnelle copiée. L’Administrateur principal reste inchangé et n’est pas utilisé
par l’agent. Aucun SQL administratif, migration, droit, RLS ou donnée métier
distante n’est modifié. Un changement de cible ou transfert de données ne doit
pas être improvisé pour contourner ce prérequis.

## Vérifications Supabase disponibles

Contrôle ciblé réel du seul Agent A fictif sur le projet actuel, en lecture seule
métier : identité et émetteur vérifiés, `role=agent`, `active=true`, référentiel v1
et SHA du HTML conformes, colonnes de dossiers lisibles avec `limit=0` (aucune
ligne de dossier chargée), anonyme refusé **HTTP 401 / SQLSTATE 42501**.
La session fictive est fermée avec HTTP 204. Les durées sont dans la preuve JSON.

L’existence des tables et colonnes attendues ne prouve pas l’historique des
migrations. Les corps SQL et ACL distants ne sont pas accessibles avec les seuls
JWT de membres. PT409 est déclaré appliqué manuellement par le propriétaire et
validé localement ; son HTTP 409 Cloud n’a pas encore été revérifié. Utiliser
[verify-inspection-pt409.sql](../supabase/manual/verify-inspection-pt409.sql) en
lecture seule dans le SQL Editor de la base désignée, sans rejouer de migration.
Comparer les corps, protections et droits avec les migrations versionnées ;
signaler toute différence. Le propriétaire doit aussi confirmer les comptes
réellement autorisés et les inscriptions publiques désactivées.

## Test réel unique préparé — pas encore autorisé ni exécuté

Le script [production-smoke.mjs](../tests/etats-des-lieux/production-smoke.mjs)
permet ce contrôle minimal avant publication, sans nouvelle Preview. Il exige
une base explicitement désignée via `TEAM_PRODUCTION_EXPECTED_PROJECT_REF`, sa
configuration publishable et les identifiants privés des seuls comptes fictifs
existants ADMIN et AGENT_A. Il n’utilise jamais le compte principal ou une clé
privilégiée et ne crée aucun compte. L’absence d’option d’autorisation bloque
avant toute connexion distante.

Plan soumis à autorisation explicite :

1. Vérifier les deux identités, rôles actifs et le projet épinglé ; générer un
   seul UUID, le journaliser avant écriture et confirmer son absence.
2. Créer ce seul dossier entièrement synthétique avec Agent A : révision 1 ;
   modifier une observation et sauvegarder : révision 2 ; relire le payload exact.
3. Essayer de supprimer ce dossier avec l’Agent : HTTP 403/42501 attendu.
   Envoyer une sauvegarde obsolète de révision 1 : HTTP 409/PT409 attendu,
   sans timeout ni écrasement ; relire et comparer intégralement la révision 2.
4. Supprimer uniquement cet UUID avec l’Admin fictif, confirmation UUID et
   révision courante ; vérifier le créateur avant nettoyage et le reçu exact.
   Confirmer l’absence immédiatement, à +5 s et +30 s, puis fermer les sessions.

Soit deux écritures de sauvegarde, deux appels devant être refusés et une
suppression synthétique. Arrêt au premier échec, nettoyage ciblé dans `finally`,
aucun retry POST. Durées, statuts HTTP et codes SQL séparés des erreurs de transport.
Un reçu perdu ou nettoyage non confirmé reste un échec avec UUID à recontrôler.

Après désignation de la base et autorisation explicite seulement :

```bash
NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/production-smoke.mjs --allow-production-synthetic-write
```

Ce contrôle Data API réel ne sera pas présenté comme un parcours navigateur
Vercel. Le lien final et un parcours court de sauvegarde/rechargement sur le site
officiel resteront à contrôler après le déploiement autorisé. Aucun dossier
Production n’a été créé ou supprimé dans cette préparation.

## Vérifications techniques et preuves

Les résultats effectifs sont consignés dans
[ESPACE_EQUIPE_RECETTE_FINALE.md](ESPACE_EQUIPE_RECETTE_FINALE.md) et
`docs/recette/2026-11-06-activation-production.json`. Ils distinguent les contrôles
locaux, la lecture réelle du projet actuel et les opérations Production non
effectuées. Le formulaire, son CSS, son HTML, les migrations, Auth et RLS restent
inchangés ; aucune dépendance ajoutée. Les tests de stockage navigateur utilisent
un transport intercepté, pas une base de production.

Résultats de cette préparation : lint, typegen, TypeScript et build Turbopack
réussis ; **44 tests purs**, **54 contrôles PostgreSQL locaux**, **29 + 17 contrôles
HTTP** avec le drapeau local actif, sauvegarde/rechargement/impression/JSON
interceptés réussis, **6/6 comparaisons publiques intégrales exactes** avec le
dernier `main`. Aucun test de sauvegarde Production n’est compté comme réussi.

## Réglages Vercel et procédure finale

Dans le projet Vercel existant, portée **Production** uniquement, après validation
de la base destinée à la livraison :

| Variable | Réglage requis |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS exacte de la base explicitement destinée à la production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable du même projet, saisie en privé |
| `TEAM_INSPECTIONS_ENABLED` | `false` pendant la préparation ; `true` uniquement lors de l’ouverture explicitement autorisée |
| `TEAM_APP_ORIGIN` | Origine officielle `https://domaine-lo-carmalhon.vercel.app` si le flux de récupération est préparé et validé séparément |

Ne mettre ni mots de passe fictifs, ni clé `service_role`, ni secret DB/SMTP dans
Vercel. Ne pas modifier ou falsifier `VERCEL_ENV`/`NODE_ENV`. Vérifier Node 22.x
et conserver le projet et le domaine existants. Une variable modifiée nécessite
un nouveau déploiement pour prendre effet.

Les seules actions indispensables avant publication sont : désigner et valider
la base de production (schéma/PT409, comptes et RLS), autoriser puis réussir le
test synthétique unique, et approuver la livraison. Ensuite seulement : revoir
la PR, autoriser sa fusion et le déploiement final, ouvrir le drapeau et vérifier
le parcours client sur l’URL officielle. Aucun déploiement fermé ou ouvert ne
doit être déclenché par l’agent sans cette autorisation. En cas d’échec, remettre
le drapeau à `false` et redéployer après décision ; cela ferme l’application,
pas les appels directs Data API déjà régis par leurs RLS, et ne restaure pas la base.

La PR reste en brouillon tant que la base et le contrôle réel ne sont pas validés.
Une préparation de code réussie ne vaut pas une activation réalisée en Production.

## Livraison GitHub

[Branche de correction](https://github.com/kinnnisss/site-gites/tree/fix/activation-espace-equipe-production).
Titre de PR : **Activation contrôlée de l’Espace Équipe en production**.
Si l’API refuse la création, ouvrir la
[comparaison vers main](https://github.com/kinnnisss/site-gites/compare/main...fix/activation-espace-equipe-production?expand=1)
et créer la PR en brouillon, sans fusion automatique. Une comparaison n’est pas
une preuve de PR créée.
