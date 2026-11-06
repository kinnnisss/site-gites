# Diagnostic du conflit de révision — reprise du 6 novembre 2026

## État

**Défaut SQL identifié et correctif validé localement ; correctif non validé sur
Supabase Cloud. Migration distante en attente d’autorisation supplémentaire.**
La recette complète reste interrompue. Aucun timeout n’est compté comme un refus
de concurrence réussi. Aucun écrasement forcé ni modification des délais de
l’application n’a été introduit.

Branche exclusive : `fix/recette-espace-equipe`. Base de reprise locale et distante :
`4ab8615e35c798ad5f85e94f4a8474b44db3df5a`.
Project Reference attendu et vérifié : `jijjjgsfdbrkvqvhyjwr` (développement).
Les cinq identités de test, leurs rôles/statuts et les 13 variables ont été
revérifiés avant création. Aucune clé privilégiée, compte principal, donnée
préexistante ou ressource de production n’a été utilisé pour les écritures.

## Mécanisme identifié

Les trois fonctions versionnées emploient `RAISE ... ERRCODE = '40001'` pour un
**conflit métier permanent** : la révision attendue ne correspond plus à celle
du dossier, ou une création réutilise un UUID existant. `40001` est cependant
le SQLSTATE PostgreSQL `serialization_failure`, prévu pour un échec transactionnel
transitoire susceptible d’être réessayé.

Dans PostgREST 13.0.7, `PostgREST.Query.query` exécute les requêtes via
`Hasql.Transaction.Sessions.transaction` ou `unpreparedTransaction`. La bibliothèque
Hasql compatible 1.1.1.3 traite `40001` et `40P01` en annulant puis recommençant
la transaction **sans limite d’essais**. La nouvelle transaction réutilise les
mêmes paramètres, donc la même ancienne révision : elle échoue encore. Un
timeout par instruction ne limite pas forcément cette succession de transactions
courtes. Un timeout HTTP client n’atteste pas l’arrêt de ces essais côté serveur.

Preuves officielles consultées, versions fixes :

- [PostgREST 13.0.7, Query.hs](https://github.com/PostgREST/postgrest/blob/e30bc63f495f01ea090ac4cf75edab54343b00dd/src/PostgREST/Query.hs), choix `SQL.transaction` / `SQL.unpreparedTransaction`.
- [Hasql Transaction 1.1.1.3, Sessions.hs](https://github.com/nikita-volkov/hasql-transaction/blob/a37951cd4c3dcbe79956418e2af01db35b0d6837/library/Hasql/Transaction/Private/Sessions.hs), `inRetryingTransaction`, `handleTransactionError`, branches `40001` et `40P01`.
- [Codes HTTP personnalisés PostgREST](https://github.com/PostgREST/postgrest/blob/e30bc63f495f01ea090ac4cf75edab54343b00dd/docs/references/errors.rst), famille SQLSTATE `PTxyz`.

Le SDK Supabase installé ne réessaie pas les POST. Le test direct cURL n’en
réessaie aucun non plus (`retry=0`). Next.js n’intervient pas dans ces appels
Data API. La condition atomique `UPDATE ... WHERE id = p_id AND revision =
p_expected_revision` n’a pas été retirée : le problème porte sur le traitement
de l’erreur, pas sur l’introduction d’un écrasement de l’autre version.

Pour les créations répétées, `INSERT ... ON CONFLICT DO NOTHING` est suivi du
même `40001`. Une requête ainsi réessayée peut rester active après une interruption
HTTP. Dès que l’Admin supprime le premier dossier, un essai ultérieur peut insérer
à nouveau le même UUID. Le reçu de suppression peut donc être correct, tout en
étant suivi d’une **nouvelle création** par l’ancienne requête.

## Reproduction réelle sur Supabase Cloud, avant correction

Autorisation du propriétaire : reproduction, créations/modifications et nettoyage
bornés aux UUID synthétiques générés. Aucun SQL distant autorisé ou exécuté.
Nouveau dossier : `1a901e90-3974-4026-8cd9-676e96529bd2`.

| Opération, UTC le 6 novembre | Réponse réellement observée | Durée complète |
| --- | --- | ---: |
| 12:42:34.297, création Agent A, révision attendue 0 | HTTP 200, révision 1 | 265,5 ms |
| 12:42:34.563, modification Agent B, révision attendue 1 | HTTP 200, révision 2 | 225,6 ms |
| 12:42:34.789, sauvegarde obsolète Agent A, révision 1 | Pas de réponse HTTP ; SDK `status=0`, aucun SQLSTATE | 15 001,7 ms |
| 12:42:49.793, relecture Admin de test | HTTP 200, révision 2, **payload B complet inchangé** | 268,4 ms |
| 12:42:50.063, même requête obsolète par cURL via le même proxy | Aucun HTTP reçu (`000`), aucun SQLSTATE, cURL exit 28 | 15 019,3 ms |
| 12:43:05.375, suppression Admin de test, UUID/révision exacts | HTTP 200, reçu UUID conforme | 234,9 ms |

Le timeout du SDK est celui du fetch Node sous-jacent, mesuré jusqu’au corps de
réponse, pas une erreur SQL requalifiée. cURL utilise le même projet, JWT de test,
proxy et TLS, sans secret dans argv ni fichier de configuration. Cette comparaison
écarte un défaut **exclusif** au SDK/Next ; elle n’isole pas le proxy de la passerelle.

Après le premier blocage, la seule tentative supplémentaire de forme mutative
a été cette comparaison du **même conflit obsolète** par cURL. Aucun test de
concurrence ou de création répétée n’a suivi. Ils restent non exécutés sur Cloud,
conformément à l’arrêt demandé. Le contenu d’Agent B a été comparé intégralement
après l’échec SDK ; le brouillon navigateur n’a pas été testé ici.

Absence du dossier confirmée à **12:43:05.841**, **12:43:11.490** et
**12:43:36.855 UTC**. Les cinq sessions fictives ont reçu HTTP 204 au logout local.
Les deux anciens UUID connus étaient absents avant cette reproduction.
La [relecture finale à 13:22 UTC](recette/2026-11-06-nettoyage-final.json) confirme
encore leur absence et celle du nouvel UUID, sans mutation supplémentaire.

Preuves nettoyées :

- [Reproduction Cloud avant correction](recette/2026-11-06-conflit-cloud-avant.json).
- [Précontrôle Auth réel et refus anonymes](recette/2026-11-06-auth-precontrole.json).

## Corrélation avec les journaux fournis

Le propriétaire fournit deux événements de la première campagne :

- **11:38:16.890 UTC**, API `delete_inspection_dossier`, HTTP 200.
- **11:38:17.009 UTC**, PostgreSQL `Revision conflict`, SQLSTATE `40001`, niveau error.

La relecture du résidu de cette campagne avait donné `created_at =
2026-11-06T11:38:17.012477+00:00`. Cette chronologie est compatible avec un
conflit réessayé puis une recréation juste après suppression. Le laboratoire
ci-dessous reproduit exactement ce mécanisme. Ces trois événements ne constituent
cependant pas une trace distribuée corrélée par request ID : l’alignement des
horloges et l’identité précise de chaque requête ne sont pas attestés.

## Reproduction indépendante locale — vrais PostgreSQL et PostgREST

Script livré : `tests/etats-des-lieux/postgrest-conflict-local.mjs`.
Images : PostgreSQL `17-alpine`, PostgREST **13.0.7**. Base et rôle locaux,
aucune variable Supabase transmise aux conteneurs. Le test utilise des fonctions
SQL minimales reprenant les conditions UUID/révision ; il ne prétend pas valider
Supabase Auth, les JWT ou toutes les RLS Cloud.

**14 contrôles réussis :**

- Une seule requête HTTP obsolète reste en attente ; **1 759 occurrences de
  `40001`** sont trouvées dans l’extrait de journal PostgreSQL mesuré après
  environ 600 ms. Le serveur est ensuite arrêté volontairement pour couper la
  boucle ; la durée de 686,2 ms n’est pas un timeout normal de l’application.
- Une création répétée reste en attente. Une suppression SQL locale du premier
  dossier la débloque : elle reçoit HTTP 200 et recrée l’UUID, avec le payload
  de la requête en attente. Durée totale observée : **671,1 ms**.
- Avec un conflit métier `PT409`, la révision obsolète reçoit **HTTP 409 / PT409
  en 2,0 ms**, la création répétée également **en 2,0 ms**.
- Deux sauvegardes de la même révision donnent un succès HTTP 200/révision 3
  (**4,8 ms**) et un conflit HTTP 409/PT409 (**13,5 ms**). Le payload gagnant est
  conservé et aucune recréation ne suit le nettoyage local.

Ces durées sont locales et ne sont pas un engagement de latence Cloud. Les
conteneurs, leur réseau de test et les fichiers privés temporaires ont été retirés.
Deux premiers essais du banc ont nécessité des corrections de démarrage/port
Docker ; ils ne sont pas comptés comme des réussites. La preuve livrée est celle
de l’exécution complète réussie.

[Preuve JSON du laboratoire](recette/2026-11-06-postgrest13-local.json).

## Cause établie et limites restantes

**Le défaut de conception SQL est établi : un conflit métier permanent utilise
un code de sérialisation réessayable. Le bouclage et la recréation tardive sont
démontrés sur PostgREST 13/Hasql.** Ils expliquent les symptômes Cloud observés et
la chronologie fournie. La qualification exacte de la chaîne déployée demeure
limitée par les accès disponibles :

- La lecture OpenAPI `/rest/v1/` a reçu HTTP 401 ; la version Cloud n’a pas été
  obtenue. La branche officielle PostgREST actuelle utilise `transactionNoRetry` :
  le comportement de 13 ne doit pas être attribué à toutes les versions.
- Aucune lecture des définitions SQL Cloud, des rôles DB, de `pg_stat_activity`
  ou de `pg_locks` n’est disponible avec les seuls JWT de membres. Aucune
  différence de définition locale/Cloud n’est donc affirmée.
- Aucun accès aux journaux internes Supabase n’est connecté. Les preuves réseau
  Cloud retenues sont absentes et le diagnostic de fournisseur n’est pas
  accessible ; cela ne démontre pas la santé du proxy.
- Aucun `statement timeout`, `lock timeout` ou deadlock n’a été observé dans les
  preuves disponibles ; leur absence dans les journaux complets n’est pas établie.
- La comparaison depuis un second environnement autorisé reste non effectuée.
  Les relevés de version et de répétition des `40001` ont été demandés au
  propriétaire pour compléter l’attribution Cloud.

L’introspection préparée dans
`supabase/manual/phase5-conflict-diagnostic.sql` est strictement en lecture seule
et omet le texte des requêtes, qui peut contenir des en-têtes/JWT. Elle n’a pas
été exécutée à distance par l’agent.

## Correction minimale préparée, non appliquée à distance

Nouvelle migration :
`supabase/migrations/20261106000100_inspection_business_conflicts.sql`.
SHA-256 : `3d83a18f828c2785ab871ae323d1552b9384e03b88cc9352ea70fd1bda008af8`.

Elle remplace les trois `40001` métier par **`PT409`**, compris par PostgREST
comme HTTP 409, dans le trigger de métadonnées et les RPC save/delete. Les
trois définitions sont sinon identiques, comparées automatiquement au texte
versionné précédent. Une précondition vérifie l’existence des fonctions pour
éviter de créer accidentellement des RPC avec des droits par défaut.

Restent inchangés : `UPDATE ... WHERE revision = ...`, clé UUID, `ON CONFLICT
DO NOTHING`, permissions, RLS, confirmations de suppression, auteurs, horodatages,
payload v1 et tous les champs. Les migrations historiques restent byte-identiques.
Les vrais échecs PostgreSQL de sérialisation restent distincts de ce conflit métier.

L’application reconnaît `PT409` et conserve la lecture des codes historiques
`40001`/`23505`. Les tests Cloud attendent désormais `PT409` par défaut ; le
drapeau `--legacy-40001` sert seulement à reproduire l’ancien comportement.
Ce changement de contrat d’erreur doit être revu avant migration, et non présenté
comme une réussite du test ancien `40001`.

**52 contrôles PostgreSQL/PGlite locaux réussis**, dont migration d’un dossier
existant avec comparaison exacte de ses données, propriétaires/ACL des fonctions,
droits des tables/colonnes et politiques/activation RLS avant/après. Les tests
continuent de vérifier création, concurrence, refus de payload, auteurs et suppression.
Le mapping applicatif couvre PT409 → 409 et erreur de transport → 503.

## Action indispensable du propriétaire et reprise

1. Dans le **SQL Editor du seul projet `jijjjgsfdbrkvqvhyjwr`**, consulter les
   définitions et paramètres avec le script de diagnostic en lecture seule.
   Comparer les trois fonctions aux anciennes migrations. Signaler toute
   divergence non versionnée avant de remplacer une définition.
2. Après revue et **autorisation supplémentaire**, appliquer **uniquement la
   nouvelle migration** `20261106000100_inspection_business_conflicts.sql`.
   Ne pas rejouer les anciennes migrations, ne pas utiliser `db push`, ne pas
   changer de membre/RLS/réglage de production et ne pas communiquer de clé admin.
   L’agent ne dispose volontairement d’aucun accès DDL distant.
3. Confirmer l’application pour relancer les cinq tests Cloud du correctif :
   normal, obsolète, concurrence, création répétée, nettoyage différé.
   Commande après autorisation des dossiers synthétiques :

   ```bash
   NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/conflict-cloud.mjs --allow-development-writes
   ```

4. Seulement si ces tests passent, exécuter `supabase-manual.mjs`, puis les
   parcours Next réels avec drapeau actif dans le seul processus local de recette.
   Les tests de navigateur avec transport intercepté ne remplaceront pas cette étape.

**Aucun test post-correction Cloud réussi n’est revendiqué.** La suite RLS et les
parcours Next réels restent bloqués par cette intervention distante non autorisée
dans la mission actuelle. Le module et le verrou de production restent fermés.
