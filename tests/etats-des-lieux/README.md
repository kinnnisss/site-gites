# Comparaison locale de fidélité

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
