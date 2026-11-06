# Espace Équipe — reprise de la recette réelle, 6 novembre 2026

## Décision actuelle

**Le conflit n’est pas déclaré résolu sur Supabase Cloud. Le propriétaire confirme lors de cette reprise que la nouvelle migration de développement n’est pas encore appliquée. La recette complète reste bloquée à cette étape ; le lien public dans le footer n’est pas ajouté. Le module reste fermé en production.**

Le défaut SQL identifié est l’utilisation de `40001`, code de sérialisation réessayable, pour un conflit métier permanent. PostgREST 13/Hasql recommence alors la transaction avec les mêmes paramètres. Une création ainsi bloquée peut recréer un dossier après suppression. Le mécanisme et le correctif `PT409` sont démontrés avec un véritable PostgreSQL/PostgREST local, sans simulation de serveur HTTP.

Le propriétaire a depuis communiqué la version **PostgREST 14.18** et une capture des erreurs répétées, suivies de deux `P0002`. La source officielle et un laboratoire de cette version confirment le même mécanisme. Les définitions SQL distantes et les statuts HTTP finaux restent à vérifier. [Analyse complémentaire](ANALYSE_JOURNAUX_POSTGREST_14_18.md). Les preuves Cloud ne valident pas encore le correctif ; aucune écriture distante n’a été relancée pour cette analyse. Le [diagnostic détaillé](DIAGNOSTIC_CONFLIT_REVISION.md) donne les sources, limites, migration et actions manuelles.

L’ancien rapport reste consultable [au commit 4ab8615](https://github.com/kinnnisss/site-gites/blob/4ab8615e35c798ad5f85e94f4a8474b44db3df5a/docs/ESPACE_EQUIPE_RECETTE_FINALE.md).

## Reprise de finalisation — vérifications du 6 novembre à 14:20–14:23 UTC

État distant relu : `fix/recette-espace-equipe` et le checkout local sont au
commit **`6b8b7bce36209283309503eeda6ed8f4bdcbfd3e`** ; `main` reste au
commit **`9035a2e0ed3ae641216d8045b10cccd400f97107`**. Aucune reprise des
anciens changements ni modification de `main`. Les consignes, le handoff, les
scripts Supabase, les migrations, les Route Handlers et les guides installés
Next 16.4.5 (Route Handlers, cookies, Proxy) ont été relus.

Les seuls appels Cloud de cette reprise sont des connexions/déconnexions des
comptes fictifs et des lectures ; aucun RPC de sauvegarde ou suppression appelé.

| Vérification réelle de cette reprise | Résultat |
| --- | --- |
| Variables privées | **13/13 présentes**, valeurs non affichées |
| Projet et clé | Correspondance avec `jijjjgsfdbrkvqvhyjwr`, clé publishable ; santé Auth HTTP 200 |
| Identités des cinq profils | Auth et identité vérifiées pour les cinq comptes fictifs |
| Rôles/statuts | Admin actif ; A et B agents actifs ; agent inactif ; sans fiche, conformes aux attentes |
| Anonyme | Lectures `team_members` et `inspection_dossiers` refusées, **HTTP 401 / 42501** |
| Ancien dossier `1a901e90-3974-4026-8cd9-676e96529bd2` | **0 ligne**, HTTP 200 en **729,7 ms** à 14:23:00.602 UTC |
| Ancien dossier `473fb7b4-b987-4291-b359-15e753ad5628` | **0 ligne**, HTTP 200 en **271,2 ms** |
| Ancien dossier `cd51b563-94ac-412a-b93c-3fbd818ee779` | **0 ligne**, HTTP 200 en **290,6 ms** |
| Session Admin fictif du contrôle des résidus | Déconnexion locale confirmée, HTTP 204 en **637,5 ms** |

Ces lectures mesurent la réponse complète. Aucune erreur SQL, de transport ou
timeout observé dans ce contrôle des résidus. Les refus anonymes attendus ne
valident pas les refus d’écriture ni l’ensemble des politiques RLS.
[Preuve nettoyée de cette reprise](recette/2026-11-06-finalisation-lecture-seule.json).

Le correctif applicatif et la migration sont livrés au commit **`7540891`** ;
le complément PostgREST 14.18 au commit **`6b8b7bc`**. Aucune nouvelle correction
de code n’est démontrée ou nécessaire à partir de ces seules lectures. Les
empreintes de la référence HTML et des trois migrations ont été revérifiées et
restent celles consignées ci-dessous.

Le propriétaire a répondu **« Pas encore appliquée »** concernant
`20261106000100_inspection_business_conflicts.sql`. L’état des définitions SQL
distantes n’est pas introspectable avec les seules capacités de recette utilisées.
Il serait inutile de relancer les mêmes conflits connus avant cette application :
les cinq scénarios Cloud post-correctif, la suite RLS d’écriture et les parcours
Next avec stockage réel restent **non exécutés**, sans résultat de réussite déduit
des tests locaux. Le module n’a pas été activé, même localement, pour cette reprise.

Conformément à l’ordre imposé, **partie A bloquée, partie B non commencée** :
`components/site-footer.tsx`, son layout et les pages publiques restent inchangés.
Les tests du nouveau lien ne sont pas exécutés puisqu’il n’existe pas.
Les [conditions et étapes de reprise](INTEGRATION_ACCES_EQUIPE.md) précisent le
passage obligatoire par Cloud/RLS/Next avant toute intégration du footer.

Seuls ce rapport, ce document de reprise et la preuve JSON sont ajoutés/modifiés
dans cette finalisation. Les résultats de non-régression ci-dessous sont ceux
réellement obtenus lors des corrections antérieures ; ils n’ont pas été relancés
sur cette modification documentaire, qui ne change ni application ni SQL.

## Cible, profils et restrictions respectées

- Dépôt : `kinnnisss/site-gites`, branche exclusive `fix/recette-espace-equipe`.
- Base du diagnostic initial : `4ab8615e35c798ad5f85e94f4a8474b44db3df5a`. Base de cette finalisation : `6b8b7bce36209283309503eeda6ed8f4bdcbfd3e`. `origin/main` vérifié en lecture seule : `9035a2e0ed3ae641216d8045b10cccd400f97107` ; aucune fusion.
- Project Reference : **`jijjjgsfdbrkvqvhyjwr`**, développement, correspondance exacte avec l’URL configurée ; 13 variables privées présentes, sans affichage de leurs valeurs.
- Clé publishable et JWT des seuls comptes fictifs ; aucune clé privilégiée ni accès DDL distant.
- Node 22.23.4, Next 16.4.5, dépendances applicatives inchangées. Proxy et TLS conservés, `NODE_USE_ENV_PROXY=1` pour les requêtes Cloud.
- Autorisation de reproduction et nettoyage des UUID synthétiques générés, **sans autorisation d’application de migration**.
- Aucun compte Auth créé/supprimé/désactivé ni e-mail, mot de passe ou rôle de compte modifié ; seules les connexions/déconnexions fictives normales ont eu lieu. Aucune fiche `team_members`, paramètre Supabase, RLS distante, migration distante ou ressource Vercel modifié. Aucun e-mail envoyé, dossier préexistant modifié ou supprimé.
- L’Administrateur principal n’a été ni utilisé ni modifié. L’Admin ci-dessous est exclusivement le compte fictif dédié.

| Profil | Auth Cloud réellement revérifié | Fiche et statut vérifiés |
| --- | --- | --- |
| ADMIN fictif | Réussi, identité vérifiée | `admin`, actif |
| AGENT_A recréé | Réussi, identité vérifiée | `agent`, actif |
| AGENT_B | Réussi, identité vérifiée | `agent`, actif |
| INACTIVE | Réussi, identité vérifiée | `agent`, inactif |
| NO_MEMBER | Réussi, identité vérifiée | Aucune fiche |

Les cinq sujets sont distincts ; émetteur et sujet du JWT sont contrôlés en mémoire. L’Admin a lu seulement les cinq membres ciblés. Les lectures anonymes de `team_members` et `inspection_dossiers` reçoivent **HTTP 401 / SQLSTATE 42501**. [Preuve Auth/RLS de précontrôle](recette/2026-11-06-auth-precontrole.json).

## Résultats des cinq scénarios indispensables

| Scénario | Cloud avant correction, réellement exécuté | Après correction, local seulement | Cloud après correction |
| --- | --- | --- | --- |
| Sauvegarde normale | Création A : HTTP 200/révision 1, **265,5 ms** ; modification B : HTTP 200/révision 2, **225,6 ms** | Réussi, révision incrémentée | Non testé : migration non appliquée |
| Révision obsolète | **Échec technique** : SDK sans HTTP ni SQLSTATE après **15 001,7 ms** ; cURL sans HTTP ni SQLSTATE, exit 28, **15 019,3 ms**. Relecture après échec SDK : payload B complet conservé, révision 2 | HTTP 409/PT409 en **2,0 ms**, contenu conservé | Non testé |
| Concurrence réelle | Non exécutée, arrêt au blocage | Un HTTP 200/révision 3 en **4,8 ms**, un HTTP 409/PT409 en **13,5 ms**, payload gagnant conservé | Non testé |
| Création répétée, même UUID | Non exécutée dans cette reprise après le blocage ; diagnostic antérieur : timeout 55 002 ms et dossier réapparu | Ancien code : recréation après suppression démontrée ; PT409 : conflit en **2,0 ms**, aucun doublon ni recréation tardive locale | Non testé |
| Nettoyage | Admin : HTTP 200 en **234,9 ms**, reçu UUID conforme ; absence immédiate, à +5 s et +30 s | Réussi ; laboratoire jetable retiré | Non testé sur un dossier créé avec le nouveau SQL |

Les durées locales ne sont pas des mesures Cloud. `status=0` du SDK et `000` de cURL indiquent l’absence de réponse HTTP exploitable, pas un code HTTP envoyé par Supabase ou un conflit validé.

La reproduction actuelle se déroule de **12:42:26 à 12:43:38 UTC**. Après le premier blocage, la seule tentative supplémentaire de forme mutative est la comparaison du même conflit par cURL, suivie du nettoyage. Aucun autre scénario métier d’écriture n’a progressé. Le brouillon navigateur n’a pas été testé sur Cloud.

Le diagnostic corrèle ces observations avec les journaux fournis par le propriétaire : DELETE HTTP 200 à **11:38:16.890**, puis `Revision conflict`/`40001` à **11:38:17.009**, et la date de recréation du résidu à **11:38:17.012477**. La chronologie est compatible avec le mécanisme reproduit ; elle ne constitue pas une trace distribuée complète sans request ID commun.

## Correction minimale préparée

- Nouvelle migration **non appliquée à distance** : `supabase/migrations/20261106000100_inspection_business_conflicts.sql`.
- Les trois erreurs métier passent de `40001` à `PT409` dans save/delete et le trigger. Les trois corps sont sinon identiques, comparés au texte historique. Fonctions existantes exigées avant remplacement ; transaction SQL unique.
- `modules/etats-des-lieux/persistence.ts` reconnaît PT409 → HTTP 409 et conserve les anciens codes pour la compatibilité. Aucun texte ou élément d’interface modifié.
- Tests de mapping et de migration/privilèges ajoutés. Scripts Cloud et laboratoire PostgREST reproductibles livrés. Le script Cloud attend PT409 par défaut ; `--legacy-40001` sert à reproduire l’ancien comportement.
- Introspection préparée dans `supabase/manual/phase5-conflict-diagnostic.sql`, strictement en lecture seule et non exécutée à distance.

La migration conserve les données d’un dossier existant, propriétaires/ACL/modes des fonctions, droits de tables et colonnes, politiques et activation/forçage RLS. Les conditions UUID/révision restent atomiques. Aucun écrasement forcé ni augmentation des délais de l’application.

**Risque à revoir :** changement du contrat d’erreur RPC de 40001 à PT409. Les clients/tests concernés doivent reconnaître PT409. Des définitions Cloud modifiées hors Git doivent être comparées avant remplacement ; aucune identité complète des définitions locales et distantes n’est affirmée.

## Non-régression réellement réexécutée

| Contrôle | Résultat et portée |
| --- | --- |
| `npm run lint` | Réussi |
| `npx next typegen` | Réussi |
| `npx tsc --noEmit` | Réussi |
| `npm run build` | Réussi avec Turbopack ; aucune route d’essai livrée |
| Auth/politique | **27 tests** réussis, fonctions pures |
| Persistance/mapping | **10 tests** réussis |
| Corps JSON | **4 tests** réussis |
| Garde-fous de cible/requêtes | **3 tests** réussis |
| PostgreSQL/PGlite | **52 contrôles** réussis, dont migration d’un dossier existant et conservation des privilèges ; fixture Auth locale |
| PostgreSQL + PostgREST 13 Docker | **14 contrôles** réussis : boucle 40001, recréation tardive, PT409, concurrence, conservation ; aucun accès Supabase |
| Complément PostgreSQL + PostgREST 14.18 Docker | **15 contrôles** locaux réussis : deux appels obsolètes, erreurs réessayées, deux P0002/HTTP 500 après suppression, PT409 et concurrence ; aucune nouvelle écriture Cloud |
| Comparaison formulaire/HTML | **46/46** comparaisons exactes ; interactions, JSON et impressions du banc de référence réussis |
| Persistance navigateur locale | Réussie avec **transport intercepté** : sauvegarde, saisies en attente, conflit, rechargement, Effacer, JSON, impression, responsive et indisponibilité |
| Vitrine comparée à `origin/main` | **6/6** paires exactes ; contenu/métadonnées, clavier, menu, ancres et responsive réussis |
| HTTP Auth | **28 contrôles** réussis sur le build local fermé |
| HTTP dossiers | **17 contrôles** réussis sur ce même build |

Les contrôles HTTP utilisent le véritable build Next local **sans configuration Supabase**. Ils ne valident pas les JWT/RLS Cloud. Les routes temporaires ont été retirées avant typegen/TypeScript/build. Aucune dépendance applicative ajoutée ; outils Docker/PGlite hors du runtime déployé.

## Fidélité et empreintes

Référence et migrations historiques inchangées :

```text
HTML : 9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0
team_members : 2a05486dde2538cdf419cc8df517c4adf3c086362448486fb5dee8c24409ac54
inspection_dossiers : 823083738a76f965e40a2f4d8158b8f1a5bd435ef5504ba060ff8a6a94d90aad
nouvelle migration : 3d83a18f828c2785ab871ae323d1552b9384e03b88cc9352ea70fd1bda008af8
```

Aucun redesign, champ, texte de formulaire, photo, signature électronique, dashboard, réservation ou modification du site public.

## Nettoyage et preuves

UUID de cette reprise : **`1a901e90-3974-4026-8cd9-676e96529bd2`**. Supprimé par l’Admin fictif, absent à **12:43:05.841**, **12:43:11.490** et **12:43:36.855 UTC**. Les anciens UUID `473fb7b4-b987-4291-b359-15e753ad5628` et `cd51b563-94ac-412a-b93c-3fbd818ee779` étaient absents au précontrôle.

Un dernier contrôle strictement en lecture seule à **13:22 UTC** confirme 0 ligne
pour les trois UUID, avec HTTP 200 en 642,3 / 584,7 / 613,4 ms. La session de
l’Admin fictif a ensuite été fermée. Aucun nettoyage complémentaire nécessaire.

La première campagne n’avait pas journalisé son UUID : sa recherche ciblée précédente donnait 0 candidat ; cette limite historique est conservée. Aucune suppression par référence, intervalle ou liste globale.

Preuves nettoyées livrées :

- [Cloud avant correction et nettoyage](recette/2026-11-06-conflit-cloud-avant.json).
- [Auth, rôles et refus anonymes réels](recette/2026-11-06-auth-precontrole.json).
- [Laboratoire PostgREST local](recette/2026-11-06-postgrest13-local.json).
- [Contrôle final des résidus](recette/2026-11-06-nettoyage-final.json).

Captures de travail locales non pérennes : `/tmp/site-gites-phase2/run-1793969920118/` et `/tmp/site-gites-public/run-1793970327836/`.

## Tests non effectués et action indispensable

La migration n’a pas été exécutée sur Supabase. Restent **non testés sur Cloud après correction** : les cinq scénarios du correctif, la suite RLS complète (écritures refusées des inactifs/sans fiche, payload invalide, suppression Agent, DELETE brut, confirmations, métadonnées/auteurs) et tous les parcours Next avec stockage réel.

Restent donc la création/sauvegarde par formulaire, réouverture, modification inter-agents, conflit entre navigateurs, conservation des saisies, rechargement accepté/annulé, Effacer sans écriture, impression/export autorisés, suppression Admin et refus avec JWT. Cookies et renouvellement/expiration réels ne sont pas validés dans cette reprise ; les cinq logouts SDK ont reçu HTTP 204.

Aucune fiche n’a été modifiée ou désactivée ; la désactivation locale simulée n’est pas une validation distante. Gestion/élévation de membres et récupération de mot de passe/SMTP, usage unique et expiration des liens restent non validés et non autorisés ici. Aucun e-mail ni changement de compte effectué. Validation humaine, conservation/confidentialité, hébergement HTTPS et sauvegarde/restauration restent des prérequis indépendants de production.

**Action du propriétaire :** comparer les définitions Cloud avec le script de lecture seule, puis autoriser et faire appliquer uniquement `20261106000100_inspection_business_conflicts.sql` dans le SQL Editor du projet de développement confirmé. Ne pas rejouer les anciennes migrations ni lancer `db push`. Aucune clé administrateur ne doit être transmise à l’agent. Confirmer l’application pour relancer les cinq tests Cloud, puis seulement la recette RLS et Next réelle. Le diagnostic fournit les commandes exactes.

La livraison est sur `fix/recette-espace-equipe`, au commit contenant ce rapport.
Aucune fusion ni intervention sur Vercel Production. L’API GitHub a de nouveau
refusé la lecture des PR (`api.github.com/graphql: Forbidden`) lors de cette
finalisation ; aucune PR brouillon créée ni existence de PR affirmée.
La [comparaison de branche](https://github.com/kinnnisss/site-gites/compare/main...fix/recette-espace-equipe?expand=1)
permet de préparer manuellement une PR en la conservant en brouillon, sans fusion.
Une migration préparée ou une PR ne vaut pas validation d’ouverture.
