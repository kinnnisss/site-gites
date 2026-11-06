# Comparaison locale de fidélité

La finalisation et la recette navigateur Preview sont décrites dans
`docs/FINALISATION_ESPACE_EQUIPE.md` et `docs/GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md`.
Le propriétaire déclare avoir appliqué manuellement PT409. Le script
`supabase/manual/verify-inspection-pt409.sql` permet la vérification des trois
corps de fonctions en lecture seule ; ne pas rejouer la migration automatiquement.
Le banc local contrôle aussi ce script avant/après la migration locale.

Pour comparer la vitrine avec `main` en isolant uniquement le nouvel accès footer :

```bash
PUBLIC_BASELINE_ROOT=/chemin/checkout-main node tests/public/non-regression.mjs --allow-team-footer
```

Les captures réelles du footer sont conservées ; seules les captures comparatives
retirent le bloc `.site-footer .footer-team-access`. Textes, liens et pixels du
reste de la page restent comparés sans tolérance. Le mode sans option continue
de comparer les pages complètes sans exclusion.

## Diagnostic de conflit du 6 novembre 2026

Le SQLSTATE `40001` est réessayé par Hasql dans PostgREST 13 : un conflit métier
permanent peut donc boucler. Le correctif préparé utilise `PT409` (HTTP 409), sans
changer les conditions de révision, droits ou données. Voir
`docs/DIAGNOSTIC_CONFLIT_REVISION.md`. La nouvelle migration
`20261106000100_inspection_business_conflicts.sql` nécessite une revue et une
autorisation distincte avant toute application distante ; ne pas lancer `db push`.

Reproduction protocolaire **locale**, Docker géré disponible, sans aucune variable
Supabase transmise aux conteneurs (PostgreSQL 17 + PostgREST 13.0.7) :

```bash
node tests/etats-des-lieux/postgrest-conflict-local.mjs
# Version annoncée pour Supabase, laboratoire toujours exclusivement local :
node tests/etats-des-lieux/postgrest-conflict-local.mjs --postgrest-version=14.18
```

Le banc vérifie aussi que deux appels obsolètes en attente finissent tous deux
en P0002/HTTP 500 après suppression locale du dossier. Cela ne remplace pas la
lecture des statuts réellement émis dans les logs PostgREST/API Cloud.

Reproduction **Cloud**, uniquement après autorisation explicite des dossiers
synthétiques et vérification des cinq comptes. Le script génère/journalise un
seul UUID, compare SDK/cURL via le même proxy, s’arrête au blocage et vérifie
le nettoyage immédiatement, à +5 s et +30 s. Aucun secret dans argv ou les preuves.

```bash
# Diagnostic historique AVANT correction SQL (échec attendu si la boucle persiste) :
NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/conflict-cloud.mjs --allow-development-writes --legacy-40001
# APRÈS application manuelle autorisée de la nouvelle migration en développement :
NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/conflict-cloud.mjs --allow-development-writes
# Puis seulement, recette RLS complète :
NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/supabase-manual.mjs --allow-development-writes
```

Le passage local et la migration préparée ne valident pas le correctif sur Cloud.
Une autorisation d’écritures de dossiers ne vaut pas autorisation de migration.

La phase 4 ajoute `persistence.test.mjs` (9 tests de payload/adaptateur),
`rls-local.mjs` (PostgreSQL/PGlite local), `persistence-browser.mjs` (formulaire
avec transport intercepté) et `http.mjs` (vrai serveur Next, accès anonymes).
Voir `docs/ESPACE_EQUIPE_PHASE_4.md` pour les commandes, prérequis et limites.
`supabase-manual.mjs` exige une autorisation explicite d’écritures de test sur un
Project Reference de développement épinglé ; **il n’a pas été exécuté dans cette
session**. Aucun test local ne constitue une validation de Supabase Cloud.

La phase 5 ajoute quatre tests du lecteur JSON, sans remplacement d’Auth :

```bash
node tests/etats-des-lieux/request-body.test.mjs
```

Pour les pages publiques, utiliser le test reproductible
`tests/public/non-regression.mjs` avec `PUBLIC_BASELINE_ROOT` pointant vers un
checkout de phase 4 séparé et installé. Le handoff décrit les commandes exactes.
Lancer les suites Next dev successivement, puis `npx next typegen`, TypeScript et
le build sans routes temporaires. Les outils restent hors des dépendances de l’application.

```bash
node tests/etats-des-lieux/fidelity.mjs
```

Prérequis déjà présents dans l’environnement cloud utilisé : Node.js 22,
Playwright, Chromium, Python/Pillow et Poppler (`pdftoppm`). Aucun paquet n’est
ajouté au projet. Au besoin, sélectionner le module Playwright existant avec
`PLAYWRIGHT_MODULE_PATH` et l’exécutable Chromium avec `CHROMIUM_PATH`.

Le script refuse `NODE_ENV=production` et un dossier de route temporaire déjà
existant. Il lance Next en développement sur `127.0.0.1:3100` et sert l’original
sur `127.0.0.1:3101`. Il crée `app/phase2-local-test/page.tsx` uniquement pendant
le test, sans authentification fictive et sans donnée personnelle réelle.

Le bloc `finally` ferme les navigateurs et serveurs, supprime cette route et
les types de développement générés qui la référencent. En cas d’arrêt brutal
du processus ne permettant pas le nettoyage, retirer cette route temporaire
avant tout build ou commit. Le build final ne doit contenir aucune route d’essai.

Un dossier de résultats unique est créé dans `/tmp/site-gites-phase2/` (ou sous
`PHASE2_ARTIFACTS`) : captures, exports JSON, impressions navigateur PDF,
rastérisations A4 et rapports JSON. Les PDF sont uniquement des résultats de
test du navigateur : aucun générateur PDF serveur n’est implémenté.

La comparaison vérifie les pixels sans tolérance, aux huit largeurs demandées,
pour les deux phases initiales et remplies. Elle compare aussi les attributs,
textes, payloads et interactions avec le JavaScript original. Les différences
de sauvegarde/rechargement sont testées explicitement comme indisponibles.

La forme du payload est validée sans imposer de complétion, de chronologie ou
de statut métier supplémentaire. Les cas invalides sont refusés sans modifier
l’état courant. Les jeux de données sont exclusivement synthétiques.
