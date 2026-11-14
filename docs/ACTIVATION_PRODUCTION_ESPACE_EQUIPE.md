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

## Base de production désignée par le propriétaire

Le propriétaire confirme que `NEXT_PUBLIC_SUPABASE_URL` en Vercel Production est
la même que dans Codex : **`jijjjgsfdbrkvqvhyjwr`**, jusque-là nommé
`domaine-lo-carmalhon-dev`. Il indique aussi que le drapeau Production est
**absent ou false** et que sa connexion Admin sur le site officiel fonctionne.
Ces constats Vercel sont fournis par le propriétaire ; aucun accès au dashboard
ou à l’API Vercel n’est connecté ici. La clé et les valeurs distantes n’ont pas
été lues ou modifiées par l’agent. L’accès HTTP au site officiel est refusé par
le proxy Cloud ; aucune réussite navigateur sur ce domaine n’est revendiquée.

Le propriétaire a ensuite répondu **« oui je confirme »** à la désignation de
**`jijjjgsfdbrkvqvhyjwr` comme base de production**, à l’arrêt de son usage de
développement et au contrôle unique décrit ci-dessous. Cette confirmation ne
couvre ni fusion ni déploiement final. Il s’agit d’une qualification d’usage :
aucun renommage, paramètre ou ressource Supabase modifié par l’agent. Les futurs
développements devront utiliser une base distincte ; les anciennes campagnes
de développement ne doivent plus être lancées sur ce projet. Aucun nouveau
projet Vercel ou nouvelle campagne Preview n’a été créé.

Aucun compte n’est créé, aucun utilisateur Auth ou rôle modifié et aucune donnée
personnelle copiée. L’Administrateur principal reste inchangé et n’est pas utilisé
par l’agent. Aucun SQL administratif, migration, droit ou RLS distant modifié.
Les seules écritures métier ont concerné le dossier synthétique autorisé,
désormais supprimé. Aucun dossier préexistant ou donnée personnelle touché.

## Vérifications Supabase disponibles

Contrôle ciblé réel du seul Agent A fictif sur le projet actuel, en lecture seule
métier : identité et émetteur vérifiés, `role=agent`, `active=true`, référentiel v1
et SHA du HTML conformes, colonnes de dossiers lisibles avec `limit=0` (aucune
ligne de dossier chargée), anonyme refusé **HTTP 401 / SQLSTATE 42501**.
La session fictive est fermée avec HTTP 204. Les durées sont dans la preuve JSON.

L’existence des tables et colonnes attendues ne prouve pas l’historique des
migrations. Les corps SQL et ACL distants ne sont pas accessibles avec les seuls
JWT de membres. Le comportement de sauvegarde obsolète **HTTP 409 / PT409 est
maintenant vérifié sur Cloud** par le contrôle autorisé ci-dessous, sans timeout.
Cela ne constitue pas une introspection des trois définitions et ACL distantes.
Si leur comparaison exacte est nécessaire, utiliser
[verify-inspection-pt409.sql](../supabase/manual/verify-inspection-pt409.sql) en
lecture seule dans le SQL Editor de la base désignée, sans rejouer de migration.
Comparer les corps, protections et droits avec les migrations versionnées ;
signaler toute différence. Le propriétaire doit aussi confirmer les comptes
réellement autorisés et les inscriptions publiques désactivées.

## Test réel unique autorisé et réussi — 6 novembre 2026

Le script [production-smoke.mjs](../tests/etats-des-lieux/production-smoke.mjs)
permet ce contrôle minimal avant publication, sans nouvelle Preview. Il exige
une base explicitement désignée via `TEAM_PRODUCTION_EXPECTED_PROJECT_REF`, sa
configuration publishable et les identifiants privés des seuls comptes fictifs
existants ADMIN et AGENT_A. Il n’utilise jamais le compte principal ou une clé
privilégiée et ne crée aucun compte. L’absence d’option d’autorisation bloque
avant toute connexion distante.

Plan explicitement autorisé puis exécuté :

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

Commande exécutée une seule fois, avec le Project Reference approuvé épinglé :

```bash
NODE_USE_ENV_PROXY=1 TEAM_PRODUCTION_EXPECTED_PROJECT_REF=jijjjgsfdbrkvqvhyjwr node tests/etats-des-lieux/production-smoke.mjs --allow-production-synthetic-write
```

Résultat : **15 vérifications réussies**, 20 requêtes Auth/Data API, de
**16:13:20.277 à 16:13:58.775 UTC**, sur le commit
**`729d746b8ed26fb9c167f6f619ba39cc180112d3`**. UUID synthétique unique :
**`f9645eb5-5e4b-4d86-b504-325f4988c7c4`**.

| Scénario réel | Résultat | Durée complète |
| --- | --- | ---: |
| Connexions ADMIN fictif / AGENT_A | HTTP 200, identités distinctes et rôles actifs vérifiés | 1 411,9 / 760,5 ms |
| Création | HTTP 200, UUID conforme, révision 1 | **627,7 ms** |
| Sauvegarde courante | HTTP 200, révision 2 | **239,7 ms** |
| Rechargement par l’Admin fictif | HTTP 200, payload complet exact, auteurs vérifiés | **263,6 ms** |
| Suppression par l’Agent | **HTTP 403 / 42501**, refus attendu | **244,8 ms** |
| Révision obsolète 1 | **HTTP 409 / PT409**, refus reçu par le client | **243,1 ms** |
| Conservation après refus | HTTP 200, révision 2 et payload sauvegardé intégralement inchangés | **548,4 ms** |
| Suppression Admin fictif | HTTP 200, reçu UUID exact | **240,2 ms** |
| Absence immédiate / +5 s / +30 s | HTTP 200, zéro ligne aux trois lectures | 239,8 / 303,0 / 474,9 ms |
| Déconnexion locale des deux profils | HTTP 204 / 204 | 404,4 / 210,4 ms |

Absence confirmée à **16:13:27.362**, **16:13:32.668** et **16:13:58.156 UTC**.
Aucun timeout ou échec de transport. Les deux erreurs SQL attendues (42501 et
PT409) sont reçues avec des statuts HTTP distincts et ne sont pas des erreurs
réseau requalifiées. Aucun compte/fiche membre ou dossier autre que cet UUID
modifié ; aucun secret journalisé.

[Preuve complète nettoyée](recette/2026-11-06-production-smoke.json).
Ce contrôle Data API réel n’est pas un parcours navigateur Vercel. Deux sauvegardes
concurrentes Cloud, la création répétée et les longues sessions ne font pas partie
de ce test unique. Le lien final et un parcours court de sauvegarde/rechargement
sur le site officiel restent à contrôler après le déploiement autorisé. Ne pas
relancer ce contrôle : l’autorisation accordée concernait cette exécution unique.

## Vérifications techniques et preuves

Les résultats effectifs sont consignés dans
[ESPACE_EQUIPE_RECETTE_FINALE.md](ESPACE_EQUIPE_RECETTE_FINALE.md) et
`docs/recette/2026-11-06-activation-production.json` (préparation), puis
`docs/recette/2026-11-06-production-smoke.json` (contrôle réel approuvé). Ils
distinguent les contrôles locaux, la lecture et le test réel Production. Le
formulaire, son CSS, son HTML, les migrations, Auth et RLS restent
inchangés ; aucune dépendance ajoutée. Les tests de stockage navigateur utilisent
un transport intercepté, pas une base de production.

Résultats de cette préparation : lint, typegen, TypeScript et build Turbopack
réussis ; **44 tests purs**, **54 contrôles PostgreSQL locaux**, **29 + 17 contrôles
HTTP** avec le drapeau local actif, sauvegarde/rechargement/impression/JSON
interceptés réussis, **6/6 comparaisons publiques intégrales exactes** avec le
dernier `main`. Le contrôle minimal de sauvegarde sur la base de production est
désormais réussi, dans les limites précisées ci-dessus.

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

La désignation de la base et le test synthétique unique sont confirmés et réussis.
Il reste à revoir la PR et les preuves, confirmer les réglages Production, puis
autoriser distinctement la fusion, le déploiement final et l’ouverture du drapeau.
Vérifier ensuite le parcours client sur l’URL officielle. Aucun déploiement fermé ou ouvert ne
doit être déclenché par l’agent sans cette autorisation. En cas d’échec, remettre
le drapeau à `false` et redéployer après décision ; cela ferme l’application,
pas les appels directs Data API déjà régis par leurs RLS, et ne restaure pas la base.

Le code et le contrôle minimal sont prêts à revue de publication. Les décisions
de fusion et de déploiement restent distinctes. Le test réussi ne vaut pas une
activation déjà réalisée sur le site officiel.

## Livraison GitHub

[Branche de correction](https://github.com/kinnnisss/site-gites/tree/fix/activation-espace-equipe-production).
Titre de PR : **Activation contrôlée de l’Espace Équipe en production**.
Si l’API refuse la création, ouvrir la
[comparaison vers main](https://github.com/kinnnisss/site-gites/compare/main...fix/activation-espace-equipe-production?expand=1)
et créer la PR en brouillon, sans fusion automatique. Une comparaison n’est pas
une preuve de PR créée.
