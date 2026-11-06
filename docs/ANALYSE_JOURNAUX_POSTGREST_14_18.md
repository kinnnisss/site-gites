# Analyse de la capture PostgreSQL et de PostgREST 14.18

## Périmètre et conclusion

Analyse effectuée sur `fix/recette-espace-equipe`, à partir du commit `7540891`,
sans aucune nouvelle requête vers Supabase : ni connexion Auth, ni RPC, ni
migration. Aucun compte, dossier distant, `main` ou paramètre Vercel modifié.
Le seul test supplémentaire utilise des conteneurs PostgreSQL/PostgREST locaux
jetables, sans variables Supabase.

La version **14.18 du service PostgREST** est celle communiquée par le propriétaire ;
elle n’est pas déduite de la capture ni confondue avec la version du moteur PostgreSQL.
Sa source officielle confirme le mécanisme de réessais déjà identifié : Hasql
annule et recommence les transactions sur SQLSTATE `40001`. Le laboratoire
14.18 reproduit les erreurs répétées puis **deux `P0002`/HTTP 500 après suppression**.

**La capture corrobore fortement des réessais automatiques côté serveur, pas
douze relances volontaires du script.** L’association de chaque événement Cloud
au même UUID et les statuts HTTP finaux Cloud nécessitent encore les détails des
logs PostgreSQL/PostgREST/API. Aucune validation post-correctif Cloud n’est déduite.

## 1. Deux requêtes obsolètes volontaires, plusieurs erreurs SQL possibles

Pour le dossier `1a901e90-3974-4026-8cd9-676e96529bd2`, la preuve du test contient :

| Heure UTC de départ | Opération intentionnelle | Résultat reçu par le client |
| --- | --- | --- |
| 12:42:34.297 | A crée le dossier, révision attendue 0 | HTTP 200, révision 1, 265,5 ms |
| 12:42:34.563 | B modifie avec révision attendue 1 | HTTP 200, révision 2, 225,6 ms |
| 12:42:34.789 | A sauvegarde la révision obsolète 1 via SDK | Aucun HTTP/SQLSTATE ; timeout après 15 001,7 ms |
| 12:42:50.063 | Même requête obsolète, une fois via cURL pour comparaison | Aucun HTTP/SQLSTATE ; exit 28 après 15 019,3 ms |
| 12:43:05.375 | Admin fictif supprime avec UUID et révision courante | HTTP 200, reçu UUID conforme, 234,9 ms |

Il y a donc **deux tentatives obsolètes volontaires**, pas une boucle de douze
appels côté script. Le SDK installé ne réessaie pas les POST, la sonde désactive
ses retries et cURL utilise `retry=0`. Les scénarios de concurrence et de création
répétée n’ont pas été exécutés sur ce dossier après le blocage.

La capture montre au moins douze `40001 / Revision conflict` entre 12:42:54 et
12:43:05, puis deux `P0002 / Dossier not found` à 12:43:05. Une seule requête HTTP
peut produire plusieurs erreurs PostgreSQL si son exécuteur réessaie la transaction.
Le nombre de lignes visibles n’est donc pas le nombre de requêtes HTTP. La capture
ne permet pas non plus de mesurer le nombre total ni la cadence exacte des essais.

[Preuve client historique](recette/2026-11-06-conflit-cloud-avant.json).

Le propriétaire a ensuite fourni [deux événements PostgreSQL détaillés](recette/2026-11-06-postgres-evenements-fournis.json) :

| Événement | Heure UTC | Corrélation temporelle |
| --- | --- | --- |
| `5118858d-2d7a-403a-b652-b4d859039e02` | 12:42:34.923 | Environ 134 ms après le départ SDK à 12:42:34.789 |
| `51df6a94-f64f-43f6-851a-59730a184868` | 12:43:01.271 | Pendant l’attente cURL, 11,208 s après son départ |

Le premier est cohérent avec un refus SQL rapide, suivi d’une attente de réponse
terminale ; ce n’est pas la preuve que PostgreSQL aurait mis quinze secondes à
détecter le conflit. La comparaison d’horloges cliente/serveur reste une corrélation,
pas une mesure exacte de temps d’exécution SQL. Le second peut appartenir à l’un
des deux traitements encore actifs ; son PID n’est pas fourni.

## 2. Association au dossier : forte corrélation, pas preuve individuelle

Les deux requêtes du script portent exactement sur cet UUID et sur la révision 1.
La correspondance temporelle et le passage de `40001` à deux `P0002` autour du
nettoyage sont très cohérents avec ces deux requêtes encore actives côté serveur.

La capture ne montre cependant ni UUID, ni paramètres du RPC, ni PID/session,
ni request ID. D’autres appels à la même fonction peuvent porter le même message.
Il faut donc distinguer :

- les deux appels du test, dont l’UUID est prouvé dans le script et le journal ;
- l’attribution de chaque ligne PostgreSQL de la capture, encore à confirmer.

Les deux exports détaillés portent `log_type: postgres`, `method: ""`,
`pathname: ""`, `status: "40001"` et `auth_user: null`. Le statut est ici un
SQLSTATE à cinq caractères. Les UUID sont des IDs d’événement, sans preuve d’un
Request-ID HTTP. `auth_user: null` n’établit pas une requête anonyme : ce journal
ne restitue pas nécessairement l’identité du JWT utilisé, vérifiée ailleurs.

À 12:43:05, les secondes seules ne permettent pas d’ordonner précisément les
`P0002` par rapport au DELETE parti à 12:43:05.375. Relever les timestamps complets,
le contexte de fonction (`save_inspection_dossier` ou autre), les PID/session et,
s’il est visible, uniquement le paramètre UUID nettoyé. Ne pas partager le texte
SQL brut : il peut contenir les GUC d’en-têtes ou des JWT.

## 3. Pourquoi le client attend pendant que PostgreSQL signale des conflits

Le code officiel de **PostgREST 14.18** choisit `SQL.transaction` ou
`SQL.unpreparedTransaction` dans `MainTx.hs`. La construction Nix sélectionne
Hasql Transaction **1.1.0.1**. Cette bibliothèque intercepte `40001` et `40P01`,
fait ROLLBACK et recommence la transaction avec les mêmes paramètres.

Ici, réessayer ne peut pas réparer une révision 1 devenue obsolète face à 2 :
la fonction métier lève encore `40001`. Cette erreur est enregistrée par PostgreSQL,
mais n’est pas encore une réponse HTTP terminale : Hasql la traite pour réessayer.
Un timeout client ne garantit pas l’annulation de ces opérations côté serveur.

Après disparition du dossier, une nouvelle exécution peut ne plus trouver l’UUID.
Le RPC lève alors `P0002`. Ce code n’est pas réessayé par Hasql : la boucle prend
fin et l’erreur remonte vers la construction de la réponse HTTP. **Deux `P0002`
sont donc exactement compatibles avec deux requêtes obsolètes en attente.**

Cela concerne des mises à jour obsolètes, pas une répétition de création : sur
ce dossier, aucune seconde création n’a été lancée. Le problème de recréation
tardive de l’ancienne campagne à 11:38 relevait d’un autre UUID et scénario.

Sources officielles fixes consultées :

- [PostgREST 14.18, MainTx.hs](https://github.com/PostgREST/postgrest/blob/6fafa601d13b15f9875e3a70e733ddd6f38f633e/src/PostgREST/MainTx.hs#L97).
- [Choix Hasql 1.1.0.1 dans la construction Nix](https://github.com/PostgREST/postgrest/blob/6fafa601d13b15f9875e3a70e733ddd6f38f633e/nix/overlays/haskell-packages.nix#L144).
- [Hasql 1.1.0.1, boucle et classification des erreurs](https://github.com/nikita-volkov/hasql-transaction/blob/b1b5c4aeecef85071af78b8e5d183ce1ce83c5eb/library/Hasql/Transaction/Private/Sessions.hs).

## 4. Quels statuts HTTP sont établis ?

**Établi sur Cloud :** les réponses normales et le DELETE sont HTTP 200 ; aucune
réponse HTTP des deux sauvegardes obsolètes n’est parvenue à Codex avant timeout.
`status=0`/`000` ne sont pas des statuts HTTP émis par Supabase.

**Établi dans la source 14.18 et dans le laboratoire local :**

| Erreur | Traitement / statut |
| --- | --- |
| `40001` | Intercepté pour réessai ; pas un HTTP 500 indépendant à chaque occurrence. S’il atteint le mapper HTTP, la famille `40*` correspond à 500 |
| `P0002` | Non réessayé ; mapper PostgREST : HTTP 500 |
| `PT409` | Non réessayé ; mapper PostgREST : HTTP 409 |

[Source du mapper HTTP 14.18](https://github.com/PostgREST/postgrest/blob/6fafa601d13b15f9875e3a70e733ddd6f38f633e/src/PostgREST/Error.hs#L598).

**Non établi sur Cloud :** le statut effectivement enregistré/envoyé pour les
deux requêtes en échec. Un HTTP 500 final est attendu sur `P0002`, mais peut survenir
après fermeture de la connexion cliente. Des logs de passerelle peuvent alors
décrire différemment cette interruption. Aucun 499/500/504 final n’est affirmé
sans consulter ces événements.

La vue sélectionnée est **Postgres**, pas PostgREST. Son compteur « Error/5xx »
ne prouve pas la livraison d’une réponse HTTP 500. Les événements PostgREST
visibles dans le compteur latéral doivent être ouverts pour vérifier les
heures complètes, chemins RPC, statuts, durées et identifiants de requête.
Une réponse construite côté serveur et une réponse reçue par Codex sont deux
preuves différentes. Next.js ne participait pas à ces appels directs Supabase.

## 5. Vérification locale avec la version indiquée

Commande locale exécutée, sans connexion Supabase :

```bash
node tests/etats-des-lieux/postgrest-conflict-local.mjs --postgrest-version=14.18
```

**15 contrôles réussis** avec PostgreSQL local et image officielle PostgREST 14.18 :

- Deux requêtes obsolètes en attente après 600 ms ; 2 748 occurrences de `40001`
  dans l’extrait mesuré des journaux locaux, pour seulement deux appels HTTP.
- Après suppression locale du dossier, les deux appels reçoivent effectivement
  **HTTP 500 / P0002**, en 788,1 et 785,5 ms au total.
- Avec le code métier `PT409`, conflit obsolète **HTTP 409 en 3,0 ms** et création
  répétée **HTTP 409 en 3,3 ms**, sans boucle.
- Concurrence : un gagnant HTTP 200/révision 3 et un HTTP 409/PT409 ; contenu
  gagnant conservé et absence de recréation après nettoyage.

[Preuve JSON locale 14.18](recette/2026-11-06-postgrest1418-local.json).
Ces résultats locaux ne sont pas présentés comme de nouveaux tests Cloud.

## Corrections et prochaines validations

1. **SQL :** l’utilisation de `40001` pour un conflit métier permanent doit être
   corrigée. La migration versionnée PT409 et son mapper applicatif sont déjà
   préparés au commit `7540891`. Aucune migration appliquée n’est modifiée et
   aucune migration n’a été exécutée à distance pendant cette analyse.
2. **HTTP :** le mapper applicatif reconnaît déjà PT409 → 409. Aucun besoin
   supplémentaire de modifier le proxy ou d’augmenter les délais n’est démontré.
   Ne jamais transformer un timeout de transport en conflit validé.
3. **Script :** aucun retry client à supprimer n’a été trouvé. Conserver la
   traçabilité UUID, opération, révision attendue, heures et durée ; ajouter lors
   d’une future recette les identifiants de réponse disponibles, via une liste
   blanche excluant cookies, Authorization et clés. Sans réponse, ne pas inventer
   d’identifiant de requête ou de statut serveur.
4. **Lecture seule maintenant :** examiner les événements PostgreSQL détaillés
   et les événements PostgREST/API entre 12:42:34 et 12:43:10 UTC. Confirmer les
   fonctions/PID et statuts des deux requêtes et de la suppression. Comparer les
   définitions distantes avec `supabase/manual/phase5-conflict-diagnostic.sql`.
5. **Après autorisations distinctes :** si les fonctions utilisent encore
   `40001` pour ce conflit, revoir puis appliquer la nouvelle migration dans le
   seul développement. Si elle est déjà appliquée, ne pas la rejouer : dater son
   application et distinguer les journaux anciens du nouvel état. Puis autoriser
   une nouvelle recette sur un UUID synthétique neuf : sauvegarde normale,
   obsolète, concurrence, création répétée, conservation et nettoyage différé.

**Aucune écriture distante n’a été relancée. Le problème ne sera déclaré résolu
qu’après réception des erreurs attendues et réussite des scénarios Cloud réels.**
