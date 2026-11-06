# Conflits de révision — contre-vérification en lecture seule

> État historique du 6 novembre à 12:17 UTC, antérieur à la nouvelle autorisation
> de reproduction. Pour l’état courant, voir
> [DIAGNOSTIC_CONFLIT_REVISION.md](DIAGNOSTIC_CONFLIT_REVISION.md) et
> [ESPACE_EQUIPE_RECETTE_FINALE.md](ESPACE_EQUIPE_RECETTE_FINALE.md).

## Conclusion au 6 novembre 2026

**Le problème n’est pas confirmé résolu. Sa cause exacte reste indéterminée.**
Le présent contrôle n’effectue aucune création, modification ou suppression de
dossier. Les quatre scénarios d’écriture attendent une nouvelle autorisation
explicite du propriétaire, conformément à sa demande actuelle.

Branche locale et distante vérifiées en lecture seule :
`fix/recette-espace-equipe`, commit
`4ab8615e35c798ad5f85e94f4a8474b44db3df5a`.
`main` distant reste à `9035a2e0ed3ae641216d8045b10cccd400f97107` ; il n’a pas
été modifié. Aucun correctif plus récent n’est présent sur la branche de recette.

## Cause, corrections et SQL

La seule cause locale établie puis corrigée est un **blocage préalable du script** :
il attendait une référence courte, tandis que la variable privée contenait le
hostname Supabase complet du même projet. Cette correction ne résout pas le
conflit de révision.

Le commit `4ab8615` contient exclusivement :

- une validation stricte des deux formats de référence du projet ;
- des garde-fous limitant les requêtes au projet et à l’UUID synthétique généré ;
- la vérification des identités et rôles, des diagnostics sans secrets et une
  meilleure traçabilité du nettoyage ;
- trois tests locaux des garde-fous et le rapport historique de recette.

**Aucun code métier, adaptation du traitement de conflit ou SQL n’a été corrigé
par ce commit. Aucune migration distante n’a été exécutée.** La nécessité d’une
modification SQL reste à établir. Le code SQL versionné attend toujours
SQLSTATE `40001` pour un conflit ; l’application le transforme en HTTP 409.
Une consultation du template n’atteste pas la définition des fonctions SQL
réellement installées. D’éventuels changements manuels hors Git ne sont pas
confirmés par ce contrôle.

## Preuves Cloud historiques et état des quatre scénarios

Référence : [rapport précédent](ESPACE_EQUIPE_RECETTE_FINALE.md).
Les résultats ci-dessous proviennent des vrais JWT et dossiers synthétiques de
la précédente recette, pas de simulations locales.

| Scénario indispensable | Preuve réellement obtenue précédemment | État de la nouvelle vérification |
| --- | --- | --- |
| Sauvegarde normale | Création Agent A à la révision 1, lecture et intégrité du payload par B, modification par B à la révision 2 ; métadonnées serveur vérifiées | Non rejouée, autorisation attendue. Les durées complètes de ces sauvegardes n’étaient pas journalisées |
| Refus de révision obsolète | Tentative avec révision 1 alors que la base était à 2 : SDK `status=0`, aucun SQLSTATE reçu ; relecture toujours à la révision 2 | Échec technique antérieur ; aucune nouvelle preuve de résolution |
| Deux sauvegardes concurrentes | Suite arrêtée avant ce scénario ; les tests PostgreSQL locaux ne constituent pas une preuve Cloud | Non testé sur Cloud |
| Conservation après conflit | Révision 2 encore visible après l’échec de transport ; absence d’écrasement observée sur la révision. Pas de comparaison complète du payload après conflit ni de test de conservation du brouillon dans le navigateur | Observation partielle seulement ; scénario complet non validé |

Le diagnostic brut ayant expiré en **55 002 ms** concernait une tentative de
**recréation du même UUID existant**, censée produire le même code de conflit.
Ce n’était pas une nouvelle mesure brute de la mise à jour obsolète. Il est
conservé comme indice de transport, sans confondre ces deux opérations.

Un autre diagnostic, portant sur un UUID synthétique déjà absent et une mise à
jour conditionnelle sans création possible, avait reçu HTTP 500/SQLSTATE `P0002`
environ **375 ms** après l’envoi. Cette erreur SQL effectivement reçue est
distincte d’un `status=0`/timeout sans code serveur. Elle ne valide pas le conflit.

Ni le transport, ni la passerelle/PostgREST, ni le SQL distant ne peuvent être
désignés comme cause exacte avec ces seules observations. Aucune résolution ou
nécessité de migration ne doit être déduite de la réussite des lectures suivantes.

## Nouveau précontrôle réel, sans écriture métier

Exécuté le **6 novembre 2026 de 12:17:09 à 12:17:17 UTC**, sous Node 22.23.4,
avec `NODE_USE_ENV_PROXY=1`, TLS et le proxy injecté conservés.

- 13 variables sur 13 présentes, sans affichage de leurs valeurs.
- Project Reference : `jijjjgsfdbrkvqvhyjwr`, correspondance exacte avec l’URL.
- Clé publishable uniquement ; aucune clé privilégiée.
- Les seuls POST sont les connexions Auth et les déconnexions `scope=local` des
  trois comptes fictifs. Les requêtes métier sont strictement GET ; aucun RPC.
- Identités vérifiées auprès d’Auth ; sujets et émetteur du JWT contrôlés en
  mémoire, trois comptes distincts. Aucune utilisation de l’Administrateur principal.

Durées en millisecondes, mesurées de l’envoi jusqu’à la lecture complète du corps
JSON (ou de la réponse vide), avec une borne de 15 secondes par requête :

| Profil | Connexion HTTP 200 | Identité HTTP 200 | Fiche HTTP 200 | Rôle / statut | Déconnexion HTTP 204 |
| --- | ---: | ---: | ---: | --- | ---: |
| AGENT_A | 441,0 | 257,9 | 827,5 | `agent`, actif | 590,8 |
| AGENT_B | 704,6 | 681,0 | 597,3 | `agent`, actif | 242,4 |
| ADMIN fictif | 323,1 | 667,0 | 249,8 | `admin`, actif | 235,3 |

| Lecture complémentaire | HTTP | Durée | Résultat |
| --- | ---: | ---: | --- |
| Santé Auth | 200 | 1 002,1 ms | Accessible |
| Template v1 par Agent A | 200 | 648,0 ms | Version et SHA-256 contractuel conformes |
| UUID `473fb7b4-b987-4291-b359-15e753ad5628` | 200 | 566,1 ms | 0 ligne |
| UUID `cd51b563-94ac-412a-b93c-3fbd818ee779` | 200 | 245,0 ms | 0 ligne |
| Première exécution : référence synthétique et intervalle de création précis | 200 | 292,7 ms | 0 candidat résiduel |

Les deux anciens UUID connus sont toujours absents, plus de trente minutes après
le nettoyage précédent. Pour la première exécution, l’UUID n’avait pas été émis
par l’ancien script : la recherche ciblée sans résultat conserve cette limite
de preuve. Aucune suppression n’a été effectuée pendant le présent contrôle.

Aucune erreur SQL, de protocole ou de transport pendant ces **17 requêtes**.
Les trois sessions de test ont été fermées avec reçu HTTP 204. Cela démontre la
connectivité courante en lecture, sans établir de garantie de latence générale.

Preuve JSON nettoyée, avec heure UTC, profil, opération, HTTP, classification et
durée de chaque requête :
[ESPACE_EQUIPE_CONFLITS_LECTURE_SEULE.json](ESPACE_EQUIPE_CONFLITS_LECTURE_SEULE.json).
Aucun e-mail, mot de passe, cookie, JWT ou UUID de membre n’y figure.

## Plan d’exécution proposé — aucune écriture lancée

Ce plan nécessite l’autorisation explicite du propriétaire avant sa première
mutation. Il est limité à **un nouvel UUID aléatoire**, généré et journalisé avant
l’appel, pour un dossier entièrement synthétique. Les anciens UUID et tous les
dossiers préexistants restent exclus des écritures.

1. Revérifier la cible exacte et les profils A/B/Admin. Vérifier que le nouvel
   UUID est absent ; en cas de collision, arrêter sans le toucher. Aucune donnée
   réelle, clé privilégiée, modification de membre ou migration.
2. **Sauvegarde normale :** créer le dossier par RPC avec A, obtenir révision 1,
   puis modifier avec B en envoyant révision attendue 1, obtenir révision 2.
   Comparer le payload complet et les métadonnées après chaque reçu. Utiliser
   des chaînes vides, accents, retours à la ligne et valeurs dans les deux phases.
3. **Révision obsolète :** A envoie une proposition différente avec révision 1.
   Exiger une erreur SQL `40001` réellement reçue et consigner son HTTP brut,
   sans présumer que PostgREST utilise le même HTTP que Next. Relire : révision
   toujours 2 et contenu B intégralement conservé. Un timeout sans code SQL
   sera un échec technique, jamais un refus validé.
4. Après réussite du test RPC précédent, démarrer l’application **locale** avec
   `TEAM_INSPECTIONS_ENABLED=true` seulement dans son processus. Conserver le
   verrou et `VERCEL_ENV` réel ; si ce dernier vaut `production`, arrêter.
   Ouvrir A et B dans deux contextes navigateur réels sur le même dossier,
   tous deux à la révision 2, puis préparer deux contenus distincts.
5. **Concurrence :** déclencher les deux sauvegardes en parallèle depuis ces
   navigateurs. Exiger exactement une réponse 200/révision 3 et un conflit
   HTTP 409. Une réponse 503, une interruption ou deux succès invalideront le
   scénario. Le code SQL brut sera consigné pour le test RPC ; l’API Next
   n’expose pas volontairement les détails SQL au navigateur.
6. **Conservation après conflit :** relire le dossier et comparer tout son
   payload au contenu gagnant. Dans le navigateur perdant, comparer toutes les
   saisies et tous les contrôles avant/après le 409. Annuler un rechargement
   doit préserver ces saisies ; accepter ensuite le rechargement doit restituer
   le contenu gagnant sans écrire ni avancer la révision en base.
7. **Nettoyage inclus dans l’autorisation :** l’Admin fictif relit la révision
   courante et supprime uniquement ce nouvel UUID, avec confirmation exacte.
   Vérifier l’absence immédiatement, à +5 s et à +30 s. En cas d’échec, arrêter
   les autres scénarios et ne poursuivre que les lectures de diagnostic et le
   nettoyage ciblé de cet UUID. Un reçu perdu ou un éventuel commit tardif reste
   une incertitude à signaler ; aucune nouvelle tentative automatique de création.
   Fermer seulement les sessions créées pour ce test.

Parcours nominal : **une création, deux modifications réussies et une suppression**.
Les tentatives obsolètes et concurrentes perdantes doivent produire zéro mutation.
Un éventuel nettoyage complémentaire reste borné au seul UUID de cette recette ;
aucune suppression par référence, liste globale ou intervalle temporel.

Chaque opération consignera profil, UUID synthétique, révision attendue, heure
UTC, durée totale, HTTP, code SQL s’il est reçu et état relu. Les erreurs de
transport et de protocole seront séparées des erreurs SQL. Aucun secret, corps
Auth ou erreur brute sensible ne sera journalisé ; aucune hausse des délais
de l’application ne servira à déclarer un succès.

Le rapport des quatre scénarios sera complété après exécution autorisée. Un test
non lancé ou bloqué conservera cet état. **Aucune déclaration de résolution avant
la réussite des quatre scénarios Cloud réels et la vérification du nettoyage.**
