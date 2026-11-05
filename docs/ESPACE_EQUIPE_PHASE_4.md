# Espace Équipe — phase 4 : sauvegarde et dossiers

## État de la livraison

Départ distant vérifié : `feature/espace-equipe`,
`ca9f386771dd54247604f6ba1291eb58ba906722` (phase 3).
La copie initiale `work` de l’environnement était ancienne ; le travail est
réalisé dans un clone séparé du dépôt `kinnnisss/site-gites` à cette référence.
Le commit de livraison est celui contenant ce rapport ; son SHA est fourni dans
le compte rendu de livraison et accessible avec `git rev-parse HEAD`.

**Implémentation préparée et testée localement. Recette Supabase réelle à faire.**
Les variables Supabase ne sont pas configurées dans l’environnement de cette
session. Le contrôle de disponibilité signale leur absence. Les résultats
Cloud 200/401 et l’existence du premier administrateur sont des informations
fournies dans la demande ; ils n’ont pas été revérifiés ici.

`TEAM_INSPECTIONS_ENABLED` reste absent ou `false`. Les pages et les API refusent
l’accès aux dossiers tant que les prérequis réels ci-dessous ne sont pas validés.
La valeur `true` ne suffit jamais à authentifier un utilisateur. Le code refuse
aussi les dossiers lorsque `VERCEL_ENV=production`. Ne pas activer ce drapeau
dans un environnement partagé avec la production.

Aucune migration distante exécutée, aucun compte distant créé, aucun envoi
d’e-mail, aucune fusion dans `main` et aucun déploiement de production.

## Fonctionnement livré

- `/equipe/etats-des-lieux` : liste simple, recherche par référence de réservation,
  25 dossiers par page, liens d’ouverture et de création. Tous les actifs voient
  les mêmes dossiers. Seuls les administrateurs voient la suppression.
- `/equipe/etats-des-lieux/nouveau` et `/equipe/etats-des-lieux/[id]` : formulaire
  React existant. Aucun dashboard, champ métier ou état de finalisation ajouté.
- `POST /equipe/api/etats-des-lieux` : création avec UUID stable, payload validé et
  révision initiale 1. Une nouvelle tentative avec le même UUID ne crée pas de doublon.
- `GET /equipe/api/etats-des-lieux/[id]` : dernière version enregistrée, sans cache.
- `PATCH` sur cette API : payload et révision attendue obligatoires, écriture atomique.
- `DELETE` : administrateur actif, UUID de confirmation et révision attendue.
- L’API de session existante accepte `operation=inspection-export` pour vérifier
  de nouveau l’accès et la permission avant les boutons d’impression/export.

Les métadonnées restent hors du payload/export JSON version 1. Une première
sauvegarde confirmée remplace l’URL par celle du dossier, sans remonter le
formulaire ni perdre les saisies faites pendant la requête. Un message indique
que ces saisies supplémentaires restent à enregistrer. Aucun succès n’est
affiché avant un reçu valide de la base. Les doubles clics sont bloqués.

Un conflit renvoie HTTP 409. Le payload et la révision locale restent conservés.
Exporter les saisies avant de confirmer un rechargement, puis reporter les
modifications à garder. Aucun écrasement forcé n’est proposé.

Le rechargement conserve la confirmation originale « Restaurer le brouillon
enregistré ? ». La révision n’avance qu’après acceptation de cette confirmation.
Une annulation ne permet donc pas d’écraser ensuite une révision plus récente.
Un formulaire neuf jamais enregistré n’invente aucun brouillon.

« Effacer » confirme puis réinitialise uniquement la mémoire, en conservant
l’identifiant et la révision du dossier courant. Il ne lance aucune écriture.
Une sauvegarde ultérieure du formulaire réinitialisé suit les règles normales.
La suppression définitive est un bouton distinct dans la liste administrative.

## Modèle PostgreSQL

| Table | Colonnes et contraintes |
| --- | --- |
| `inspection_templates` | UUID fixe du modèle v1, version unique, SHA-256 de la référence, définition JSONB complète (13 contrôles, procédures et règles ordonnés), date de création |
| `inspection_dossiers` | UUID, FK vers le modèle, payload JSONB complet, créateur et modificateur (FK `auth.users`), dates serveur, révision entière strictement positive |

Le modèle v1 a l’UUID `68a4545f-6af4-4a79-bced-b46cfb367ec1`. Il est inséré dans
la migration avec les textes exacts de `reference.ts`, sans donnée de séjour.
Les clients ne peuvent ni créer, modifier ni supprimer ce référentiel. Les
références sont conservées, les FK utilisent `ON DELETE RESTRICT` ; supprimer un
compte Auth référencé exige donc une politique d’archivage à décider plus tard.
La désactivation d’un membre reste possible immédiatement.

Index : clé primaire UUID, ordre `(updated_at DESC, id DESC)` de la liste,
référence au modèle et FK des deux auteurs. Aucun index JSONB volumineux ni
table de réservation n’est ajouté. La recherche par référence utilise `ILIKE`
avec caractères `%`, `_` et antislash échappés, sans interpolation de filtre SQL.

La validation PostgreSQL et `copyPayload()` vérifient les clés exactes, chaînes,
version 1, choix `null/conforme/corriger`, longueurs 13/13 et 8/7/8, et booléens.
Les brouillons incomplets, chaînes vides et dates locales restent acceptés. Aucune
règle de chronologie, de complétion, de finalisation ou de conversion de fuseau
n’est introduite. Accents, retours à la ligne et espaces sont préservés.
`jsonb` réordonne les clés d’objets : la réhydratation restitue expressément
l’ordre de l’export original et conserve la position de chaque élément de tableau.
Les corps d’API sont bornés à 1 Mio, y compris sans `Content-Length`.

Le trigger fixe les auteurs et horodatages à partir de `auth.uid()` et de
l’horloge PostgreSQL. L’auteur, la date de création, l’UUID et le modèle restent
immuables. Un UPDATE doit fournir la révision suivante, même par Data API directe.
La fonction `save_inspection_dossier` fait `UPDATE ... WHERE id = ... AND
revision = révision_attendue`, puis retourne le reçu. Vérification et écriture
constituent une seule instruction ; une ancienne révision ne peut pas réussir.

## Autorisations et RLS

| Acteur | Lecture, création, modification de tous les dossiers | Impression/export via les boutons | Gestion des membres | Suppression définitive |
| --- | --- | --- | --- | --- |
| Administrateur actif | Oui | Oui, après nouvelle vérification serveur | Oui, mécanisme de phase 3 | Oui, après confirmation et contrôle de révision |
| Agent actif | Oui, y compris dossiers des autres agents | Oui, après nouvelle vérification serveur | Non | Non |
| Inactif ou sans fiche/ rôle autorisé | Non | Non | Non | Non |
| Anonyme | Non | Non | Non | Non |

Chaque page et chaque API vérifie `auth.getUser()`, puis la fiche active dans
`team_members`. Les rôles de cookie, en-tête, payload et `user_metadata` ne donnent
aucun droit. Le layout seul n’est pas une barrière d’autorisation.

Les deux nouvelles tables ont RLS activée et forcée. Aucun droit anonyme.
Les politiques SELECT/INSERT/UPDATE des dossiers exigent un membre actif
`admin` ou `agent`, sans restriction par créateur. Les politiques du modèle
autorisent uniquement sa lecture aux actifs. La politique DELETE exige un admin
actif **et** une confirmation transactionnelle correspondant à l’UUID.

`delete_inspection_dossier` valide la confirmation puis pose un paramètre
transactionnel interne pour cette opération. Une requête Data API DELETE brute,
même avec un JWT admin, ne possède pas cette confirmation et ne supprime rien.
Le schéma `team_private` ne doit pas être exposé par la Data API. Le paramètre
de confirmation ne remplace jamais la vérification du rôle administrateur.

Les deux RPC métier et le trigger utilisent `SECURITY INVOKER` : JWT du membre,
droits par colonne et RLS restent effectifs. Les seuls helpers `SECURITY DEFINER`
sont les prédicats de membre/admin, sans identité fournie par le demandeur,
sans lecture de dossiers, avec `search_path` vide et droits EXECUTE limités.
Aucune clé `service_role` ou secrète n’est nécessaire ni acceptée dans la
configuration publique. Les mutations API imposent une origine identique.
Les réponses d’erreur restent génériques et privées, sans contenu fournisseur.
L’application n’ajoute aucun log de payload, identifiant utilisateur ou jeton.

Une donnée déjà affichée reste en mémoire dans le navigateur : sa révocation ne
peut pas effacer une information déjà vue, copiée ou imprimée. Les boutons
vérifient de nouveau la session ; la fonction d’impression native du navigateur
reste sous le contrôle de l’utilisateur. Les saisies non enregistrées sont
perdues si l’onglet est fermé/rechargé ; aucune autosauvegarde ni persistance
locale n’est ajoutée.

## SQL à appliquer manuellement, après autorisation

1. Vérifier le projet **de développement**, distinct du Supabase de production.
   Examiner le schéma et les versions déjà appliquées. La migration de phase 3
   `20261105000100_team_members.sql` est un prérequis : ne pas la rejouer si elle
   est déjà appliquée. Le premier administrateur existant n’est pas recréé.
2. Examiner puis, uniquement après autorisation explicite, exécuter
   `supabase/migrations/20261105000200_inspection_dossiers.sql` dans le SQL Editor
   de ce projet. Elle est transactionnelle et n’est pas un script de remplacement.
3. Lire manuellement `supabase/manual/phase4-security-review.sql` pour contrôler
   politiques, RLS forcée, modes de sécurité des fonctions et empreinte du modèle.
   Vérifier les grants par colonne et la non-exposition de `team_private`.

Appliquer la migration rend la Data API accessible aux membres actifs selon les
RLS, indépendamment du drapeau applicatif. L’application doit rester fermée
pendant la recette. Aucun des scripts de test locaux n’applique de SQL distant.

## Configuration et recette réelle, sans transmettre d’identifiants dans le chat

### Préparation

Dans la configuration privée de l’environnement de développement, renseigner
`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` du seul projet
de développement. Ne pas utiliser une clé secrète/service_role. Autoriser son
hostname exact dans la politique réseau Codex si nécessaire. Conserver TLS et
le proxy ; utiliser `NODE_USE_ENV_PROXY=1` derrière ce proxy. Les variables de
récupération/SMTP de phase 3 restent séparées et inchangées.

Garder `TEAM_INSPECTIONS_ENABLED=false`. Lancer le serveur local, puis vérifier
`node scripts/check-supabase-readiness.mjs` (avec le mode proxy si nécessaire).
Ne pas prendre des tests de fonctions pures pour une connexion réussie.

### Connexion et déconnexion dans le navigateur

1. Ouvrir `/equipe/connexion` dans un contexte privé. Se connecter avec le compte
   Administrateur de développement déjà créé. Vérifier l’arrivée sur `/equipe`,
   le rôle affiché et un HTTP 200 pour `/equipe/api/session`.
2. Cliquer « Se déconnecter ». Vérifier la page de connexion, le refus d’un retour
   sur `/equipe` et un HTTP 401 pour l’API de session.
3. Dans un nouveau contexte anonyme, essayer les trois routes de dossier et les
   API : redirection vers la connexion ou refus, sans contenu de séjour.
4. Après autorisation des préparations de test, utiliser deux comptes Agent actifs
   A et B, un compte Auth avec fiche inactive, et un compte Auth sans fiche dans
   `team_members`. Les créer/configurer uniquement dans le projet de développement,
   avec adresses confirmées et sans invitation réelle. L’admin existant reste actif.
5. Se connecter séparément avec ces comptes. Les agents accèdent à `/equipe` ;
   les deux comptes non autorisés restent refusés. Un rôle inconnu ne peut pas
   être stocké dans l’enum ; une absence de rôle/fiche doit fermer l’accès.
6. Désactiver ensuite un compte Agent de test, déjà connecté, au moyen du mécanisme
   administratif de phase 3 ou du dashboard approuvé. À la requête suivante,
   `/equipe/api/session` et toutes les opérations de dossier doivent être refusés.
   Rétablir ce compte avant la recette suivante, après autorisation.

### Recette directe Supabase Auth et RLS

Le script `tests/etats-des-lieux/supabase-manual.mjs` est fourni, **non exécuté ici**.
Il nécessite une autorisation de création/suppression de données synthétiques
dans le projet de développement ; il ne modifie ni schéma, ni membre, ni réglage
Auth. Il épingle le Project Reference et utilise uniquement les JWT des cinq
comptes de test, jamais une clé privilégiée.

Créer localement un fichier privé `.env.phase4-test.local` (ignoré par Git) avec
les deux variables Supabase, `TEAM_TEST_EXPECTED_PROJECT_REF`, puis, pour chacun
des préfixes `ADMIN`, `AGENT_A`, `AGENT_B`, `INACTIVE`, `NO_MEMBER`, les variables
`TEAM_TEST_<PREFIXE>_EMAIL` et `TEAM_TEST_<PREFIXE>_PASSWORD`. Utiliser les identifiants
uniquement sur la machine de recette, sans les coller dans le chat, une commande
partagée ou le dépôt. Vérifier que les comptes ont les rôles attendus.

Après validation explicite des écritures de recette, exécuter soi-même :

```bash
node --env-file=.env.phase4-test.local tests/etats-des-lieux/supabase-manual.mjs --allow-development-writes
```

Derrière le proxy de l’environnement, préfixer par `NODE_USE_ENV_PROXY=1`.
Le script teste Auth réel, les cinq profils, l’accès anonyme, la lecture/modification
entre agents, la conservation du payload, les métadonnées, deux sauvegardes
concurrentes, la validation PostgreSQL, les refus RLS et la suppression administrative
confirmée. Il tente de nettoyer uniquement son dossier synthétique et ferme ses
sessions. En cas de coupure empêchant le nettoyage, il donne l’UUID synthétique à
vérifier manuellement. Une sortie en erreur ne constitue pas une validation partielle
de production. Ne pas exécuter ce script en CI ou sur un projet de production.

### Activation de la recette applicative

Après réussite documentée des prérequis Auth et RLS, activer
`TEAM_INSPECTIONS_ENABLED=true` **uniquement en développement**, redémarrer le serveur,
puis vérifier les parcours suivants avec deux contextes navigateur séparés :

1. Agent A : créer un dossier incomplet avec accents, retours à la ligne, dates,
   contrôles, checklists et règlement ; sauvegarder, noter la révision et l’URL.
2. Agent B : retrouver et ouvrir ce dossier ; vérifier toutes les valeurs, y compris
   les phases masquées, modifier et sauvegarder. Aucun filtre par auteur.
3. Agent A : modifier et sauvegarder l’ancienne révision. Attendre HTTP 409, vérifier
   la conservation des saisies, exporter, annuler le rechargement et retenter :
   le conflit doit persister. Confirmer ensuite le rechargement pour recevoir la
   version B, puis reporter et sauvegarder les modifications utiles.
4. Tester « Effacer » annulé puis confirmé. Dans l’autre navigateur, la version
   enregistrée doit rester identique jusqu’à une nouvelle sauvegarde explicite.
5. Tester une coupure réseau : aucune réussite prématurée et aucun effacement des
   saisies. Après reconnexion, recharger pour vérifier l’état si le reçu a été perdu.
6. Imprimer depuis chaque onglet : entrée et sortie visibles, signatures papier,
   CSS original et export JSON v1 sans métadonnées. Vérifier aussi le refus des
   boutons après désactivation/déconnexion du membre.
7. Agent : appeler directement l’API DELETE depuis DevTools, même avec un corps
   de confirmation ; attendre HTTP 403. Admin : annuler puis confirmer le bouton
   de la liste ; seule la confirmation correcte supprime. Une révision modifiée
   depuis l’affichage doit produire un conflit et exiger une nouvelle confirmation.
8. Vérifier mobile, clavier et les trois pages publiques. Refaire aussi les tests
   de renouvellement/expiration et de récupération réels restants de phase 3.

L’expiration/rotation réelles des jetons, le SMTP/récupération et cette recette
authentifiée complète ne sont pas validés dans cette session. Aucun statut
« opérationnel en production » n’est attribué.

## Résultats locaux

Environnement : Node.js 24.22.1, Next.js 16.3.6, SDK verrouillés de phase 3.
Le projet recommande toujours Node 22 ; aucune version de dépendance n’est modifiée.

| Contrôle | Résultat |
| --- | --- |
| `npm run lint` | Réussi sans erreur ni avertissement |
| `npx tsc --noEmit` | Réussi |
| `npm run build` | Réussi, Turbopack ; routes privées dynamiques, pages publiques statiques |
| Politique Auth de phase 3 | 25 tests réussis |
| Payload et adaptateur | 9 tests réussis : forme, copies, ordre des clés, retries, reçus, erreurs et révision après annulation |
| PostgreSQL local PGlite | 48 contrôles réussis : migrations, contraintes, métadonnées, RLS, droits inter-agents, confirmations et conflits |
| Navigateur persistance | Réussi avec API interceptée : sauvegarde confirmée, saisies pendant requête, doubles clics, conflit, rechargement, Effacer, export, impression, erreurs et responsive |
| Fidélité de phase 2 | 46/46 comparaisons exactes : 32 écrans, 2 impressions et 12 pages A4 ; interactions originales réussies |
| HTTP Auth de phase 3 adapté | 28 contrôles réussis sur le vrai serveur Next sans configuration, sans identifiants distants |
| HTTP dossiers | 17 contrôles réussis : refus anonymes, origines tierces/manquantes, faux rôles et absence d’exposition des routes d’essai |
| Pages publiques | Sources inchangées ; six paires de captures à 375/1440 px identiques pixel par pixel, contenus/métadonnées/liens identiques ; neuf contrôles responsive sans débordement |
| Supabase Cloud réel | Non effectué : configuration absente, migrations non autorisées/non appliquées |

PGlite exécute PostgreSQL local avec des sujets JWT de test injectés dans la
fixture `auth.uid()`. Cela valide le SQL et ses RLS, pas Supabase Auth, PostgREST
Cloud ni l’isolation réelle des comptes distants. Le test de concurrence local
soumet deux écritures sur la même révision à cet exécuteur ; le test distant
fourni doit confirmer le comportement avec deux sessions Supabase réelles.
Les tests navigateur de transport interceptent uniquement les API dans leur
banc d’essai local : aucune session Auth factice n’existe dans l’application.

Reproduction :

```bash
node tests/auth/policy.test.mjs
node tests/etats-des-lieux/persistence.test.mjs
node tests/etats-des-lieux/fidelity.mjs
node tests/etats-des-lieux/persistence-browser.mjs
# Avec un serveur Next local sur 127.0.0.1:3000 :
node tests/auth/http.mjs
node tests/etats-des-lieux/http.mjs
```

Les scripts navigateur nécessitent Playwright, Chromium, Pillow et Poppler de
l’environnement, sans ajout aux dépendances applicatives. Les lancer séparément :
chacun retire sa route temporaire et `.next/dev` dans `finally`. Aucun banc
d’essai ne doit exister au build/commit final. Pour le SQL local, installer
`@electric-sql/pglite` dans un répertoire de test externe au dépôt et fournir
`PGLITE_MODULE_PATH=/chemin/vers/node_modules/@electric-sql/pglite` lors de
`node tests/etats-des-lieux/rls-local.mjs`. Aucune dépendance n’est ajoutée au projet.

## Fidélité et limites

Le SHA-256 de la référence reste
`9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0`.
Le CSS du formulaire, le logo, les composants de séjour/contrôle/règlement et
les textes du référentiel sont inchangés. Les quatre sections, 26 contrôles,
23 procédures, sept règles, onglets, progression, alerte de sécurité,
récapitulatif, signatures papier et styles d’impression sont conservés.

Avec stockage raccordé, seuls les messages de notice/footer/sauvegarde et la
confirmation d’Effacer sont adaptés dans leurs emplacements existants. Le bouton
de sauvegarde indique « Sauvegarder le brouillon » pour décrire le stockage partagé.
Les boutons sont temporairement désactivés pendant une opération. Le mode sans
stockage conserve exactement les textes de référence pour les comparaisons.
Les 46 comparaisons de pixels portent sur ce mode de référence ; le mode raccordé
a ses messages autorisés différents et ses propres tests fonctionnels/responsive.

Aucun fichier public, donnée publique, logo, police, dépendance ou configuration
Vercel n’est modifié. Pas de bibliothèque PDF serveur, signature électronique,
photo, réservation, autosauvegarde ou fonctionnalité commerciale supplémentaire.

## Fichiers créés et modifiés

Créés :

- `app/equipe/(prive)/etats-des-lieux/page.tsx`, `nouveau/page.tsx`, `[id]/page.tsx`.
- `app/equipe/api/etats-des-lieux/route.ts` et `[id]/route.ts`.
- `lib/inspections/server.ts`, `http.ts`.
- `modules/etats-des-lieux/persistence.ts`, `dossier-storage.ts`, `dossier-editor.tsx`, `delete-dossier.tsx`.
- `supabase/migrations/20261105000200_inspection_dossiers.sql`.
- `supabase/manual/phase4-security-review.sql`.
- `tests/etats-des-lieux/load-typescript.mjs`, `persistence.test.mjs`, `rls-local.mjs`,
  `persistence-browser.mjs`, `http.mjs`, `supabase-manual.mjs`.
- Ce rapport.

Modifiés :

- `.env.example`, `README.md`, `app/equipe/README.md`, `modules/etats-des-lieux/README.md`.
- `app/equipe/(prive)/page.tsx`, `app/equipe/api/session/route.ts`, `app/equipe/team.module.css`.
- `lib/supabase/database.types.ts`.
- `modules/etats-des-lieux/inspection-form.tsx`, `state.ts`, `types.ts`,
  `components/rules-and-summary.tsx`.
- `tests/auth/http.mjs`, `tests/etats-des-lieux/README.md`.

## Avant toute production

Obtenir l’autorisation des opérations manuelles, valider et consigner toute la
recette Auth/RLS réelle, puis les parcours applicatifs sur le projet de développement.
Conserver l’accès fermé tant que ces prérequis ne sont pas satisfaits. Les mécanismes
de renouvellement et de récupération restants de phase 3 doivent aussi être validés.
Une ouverture de production demanderait une décision et une préparation séparées,
notamment le retrait explicite du verrou `VERCEL_ENV=production` après revue.
Cette livraison ne fusionne pas `main` et ne déclenche aucun déploiement de production.
