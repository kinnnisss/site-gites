# Livraison Vercel — vitrine avec états des lieux fermés

## Périmètre autorisé au 5 novembre 2026

Cette préparation permet d’intégrer le code des cinq phases **sans ouvrir les
états des lieux**. La recette fonctionnelle Supabase est reportée. La publication
de la vitrine fermée et l’activation future du module sont deux décisions
distinctes ; les tests Auth/RLS manquants continuent d’interdire cette activation.

- Dépôt : `kinnnisss/site-gites`, branche `feature/espace-equipe`.
- Reprise : `63a4ad7fff2b62b53244bcd05528b0db6a6b67ad`, rapport ajouté après le
  code de phase 5 `2ae8ea06783071da2e9a9952b450df56b72978de`.
- Base `main` vérifiée : `bfc7a5a7161b5a61312c9da2f3075ed129b4bac8`.
- [Pull Request nº 2](https://github.com/kinnnisss/site-gites/pull/2), en brouillon,
  de `feature/espace-equipe` vers `main`. Aucune fusion ni fusion automatique activée.
- [Preview de branche](https://site-gites-git-feature-espace-equipe-kinelame3-2428s-projects.vercel.app).
  Cette adresse suit les futurs déploiements de la branche : toujours vérifier
  le SHA associé avant d’approuver une version.
- [Projet Vercel existant](https://vercel.com/kinelame3-2428s-projects/site-gites).
  L’intégration GitHub publie déjà des Previews ; aucun second projet n’a été créé.

Le commentaire `vercel[bot]` de la PR et le statut du commit de reprise annoncent
un déploiement **Ready/success**. Cela prouve le résultat communiqué par Vercel,
pas une recette HTTP de cette Preview. L’accès direct HTTPS est bloqué par le
proxy Codex : `CONNECT` refusé avec HTTP **403**, avant la réponse de l’application.
Aucun contournement ou changement TLS n’a été tenté. Les paramètres Vercel ne sont
pas accessibles par les outils connectés de cette session ; ils restent à
contrôler dans le dashboard.

## Vérifications effectuées dans cette préparation

| Vérification | Résultat et limite |
| --- | --- |
| Build de production | `npm run build` réussi sous Node 22.23.4, Next 16.4.5, avec `VERCEL_ENV=production`, drapeau `false`, sans variables Supabase |
| Routage du build | `/`, `/mentions-legales`, `/confidentialite` prérendues ; routes Équipe dynamiques ; Proxy limité à `/equipe/:path*` |
| Source de la vitrine | Trois pages identiques octet pour octet à `main` après leur déplacement dans `(public)` ; `components`, `data`, `public` et polices inchangés |
| Comparaison navigateur avec `main` | **6/6** captures identiques pixel par pixel : trois pages à 375 et 1440 px ; textes, métadonnées et liens identiques |
| Responsive et navigation publique | **9** contrôles supplémentaires à 320/768/1024 px ; clavier, menu, Échap, ancres et absence d’erreur JavaScript réussis |
| Refus d’accès sans Auth | **28** contrôles HTTP/navigateur Auth et **17** dossiers réussis sur le vrai build local : redirections, API sans contenu métier, rôle/cookie forgés refusés, contrôle d’origine, documents de référence et routes de test non exposés |
| Drapeau et verrou | **2** tests ciblés réussis : fermeture par défaut et refus en production même avec un opt-in explicite |
| Configuration du runtime | `engines.node=22.x` ajouté au manifeste et au lockfile ; aucune version de dépendance modifiée |
| Supabase réel | Non testé ; aucun compte, schéma, rôle ou dossier distant modifié |
| Vercel Production | Aucun paramètre, domaine, alias, promotion ou déploiement de production modifié/déclenché par cette préparation |

La comparaison publique réutilise le banc existant contre un checkout séparé de
`main`. Une copie temporaire adapte seulement la sélection du cadre public au
`body` de l’ancienne structure. Les captures sont réalisées avec deux serveurs
locaux de développement ; les refus HTTP utilisent, eux, le build de production
démarré par `next start`. Aucun faux fournisseur Auth ni donnée réelle utilisée.

Commandes principales, sous Node 22 avec les outils navigateur de travail :

```bash
VERCEL_ENV=production TEAM_INSPECTIONS_ENABLED=false npm run build
TEAM_TEST_BASE_URL=http://127.0.0.1:3450 node tests/auth/http.mjs
TEAM_TEST_BASE_URL=http://127.0.0.1:3450 node tests/etats-des-lieux/http.mjs
node --test --test-name-pattern='inspection availability|production lock' tests/auth/policy.test.mjs
```

Ces résultats ne valident ni les comptes réels, ni les sessions Supabase, ni les
RLS distantes. Ils ne remplacent pas la vérification du déploiement hébergé.

## Variables pour cette livraison fermée

**La vitrine n’a besoin d’aucune variable Supabase et fonctionne sans base.**
La configuration cible ci-dessous concerne la livraison fermée ; les valeurs
effectivement enregistrées sur Vercel n’ont pas été consultées ni modifiées ici.

| Variable | Preview fermée | Production future fermée |
| --- | --- | --- |
| `TEAM_INSPECTIONS_ENABLED` | Valeur serveur `false` explicite | `false` à vérifier avant publication ; aucune modification Production effectuée ici |
| `NEXT_PUBLIC_SUPABASE_URL` | **Absente** | **Absente** pour cette livraison sans Auth ; surtout aucune URL de développement |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Absente** | **Absente** ; aucune clé de développement |
| `TEAM_APP_ORIGIN` | **Absente** : récupération désactivée | **Absente** tant que le flux Auth n’est pas validé |
| `TEAM_TEST_EXPECTED_PROJECT_REF`, `TEAM_TEST_*_EMAIL`, `TEAM_TEST_*_PASSWORD` | **Absentes** ; réservées à un environnement privé de recette | **Absentes** |
| Clés Supabase `service_role`/secrètes, mot de passe PostgreSQL, `DATABASE_URL`, secrets SMTP, jetons d’administration | **Absents**, inutiles à l’application | **Absents** de cette application |
| `VERCEL_ENV`, `NODE_ENV` | Fournis par Vercel/Next ; ne pas les remplacer manuellement | Fournis par Vercel/Next ; ne jamais falsifier `VERCEL_ENV` pour lever le verrou |
| `NODE_USE_ENV_PROXY` et variables proxy Codex | Pour les commandes Codex seulement si nécessaire | Ne pas recopier dans Vercel |

Ne pas copier `.env.example` dans Vercel : ses URL/clés fictives ne constituent pas
une configuration de déploiement. Les autres variables existantes du site doivent
être conservées et examinées selon leur usage ; ne pas supprimer des réglages sans
rapport avec ce module.

Lors d’une **recette future distincte**, l’URL et la clé publishable du projet de
développement ne pourront être renseignées que dans l’environnement de recette
autorisé. Jamais de variable partagée Preview/Production pour ces valeurs. Les
mots de passe de test restent dans l’outillage privé, pas dans le site hébergé.
`TEAM_APP_ORIGIN` ne devient nécessaire que pour le flux de récupération autorisé,
avec une origine HTTPS exacte et les redirections Supabase correspondantes.

Une modification de variable nécessite un nouveau déploiement. Ne pas promouvoir
une ancienne Preview construite avec une autre configuration vers la production ;
les variables `NEXT_PUBLIC_*` peuvent être intégrées à la construction.

## Pourquoi aucune donnée de voyageur ne doit atteindre le développement

Les pages publiques utilisent les fichiers locaux ; elles n’importent pas le
client Supabase et ne créent ni réservation ni dossier. Le Proxy ne s’applique
qu’à `/equipe`. Sans URL et clé, Auth est indisponible, les formulaires de connexion
et récupération sont désactivés et les API privées renvoient une erreur générique
sans effectuer d’opération Supabase. Les refus locaux observés sont alors des
redirections sur les pages et des HTTP 503 sur les API de même origine.

Le drapeau `false` et le verrou de production empêchent en plus les opérations
de dossiers pour un membre authentifié. **Le drapeau n’arrête pas l’ensemble
d’Auth, la gestion des membres ou la Data API Supabase.** C’est pourquoi la
livraison fermée demande aussi l’absence des deux variables de connexion :
conserver une base de développement liée à la production serait contraire au
périmètre demandé, même avec les dossiers fermés.

Le module reste fermé sans migration sur une base de production. Aucun compte
supplémentaire n’est nécessaire pour publier la vitrine. La base de développement
reste réservée aux données synthétiques, y compris depuis les autres environnements.

## Préparer et vérifier la Preview existante

1. Ouvrir le projet Vercel `site-gites` ci-dessus. Vérifier en lecture seule le
   dépôt `kinnnisss/site-gites`, la branche de production `main`, la racine du
   projet et l’absence de règle publiant `feature/espace-equipe` en Production.
   Si le réglage diffère, arrêter et demander l’autorisation de le corriger.
2. Vérifier le preset **Next.js**, racine du dépôt, installation `npm ci`, build
   `npm run build`, sortie gérée par Next/Vercel. Le manifeste demande Node
   **22.x**. Garder les fonctions serveur et le Proxy ; aucun `output: export`,
   dossier `out`, suppression d’Auth ou contournement de la protection Preview.
3. Dans les variables de portée **Preview**, vérifier la configuration fermée du
   tableau, y compris les éventuelles valeurs spécifiques à la branche. Ne pas
   changer les valeurs/scopes Production. Si une valeur Supabase commune aux deux
   environnements impose un changement partagé, obtenir d’abord une autorisation
   de séparation ; ne pas supprimer ou remplacer silencieusement un réglage commun.
4. L’intégration GitHub déploie la branche lors des nouveaux commits. Ouvrir la
   PR nº 2 et son lien **Preview** ; vérifier le SHA exact, l’environnement
   **Preview**, l’état **Ready**, les logs de build et Node 22. Si une modification
   Preview autorisée a été nécessaire, redéployer **la branche feature** dans
   l’environnement Preview. Ne pas cliquer sur une promotion en Production.
5. Garder les protections Vercel existantes. Dans un navigateur autorisé, utiliser
   un contexte neuf, sans session Équipe et sans données de voyageur. Vérifier :

   | URL/parcours | Résultat attendu avec la configuration fermée |
   | --- | --- |
   | `/`, `/mentions-legales`, `/confidentialite` | 200 ; vitrine, liens, images, métadonnées, navigation mobile/clavier conservés |
   | `/equipe/connexion` | Page de connexion sans données métier ; bouton désactivé |
   | `/equipe/recuperation` | Demande de lien désactivée ; aucun e-mail envoyé |
   | `/equipe`, `/equipe/mot-de-passe` | Redirection interne vers la connexion |
   | `/equipe/etats-des-lieux`, `/nouveau`, `/00000000-0000-4000-8000-000000000001` | Aucun formulaire ni dossier ; redirection interne vers la connexion |
   | `/equipe/api/session` et `/equipe/api/etats-des-lieux/00000000-0000-4000-8000-000000000001` | 503 avec une seule erreur générique ; aucun payload, membre ou jeton |
   | `/phase2-local-test`, `/phase4-local-test`, document HTML sous `/docs/references/` | 404 |

   Pour les trois URL de dossiers, les suffixes indiqués partent tous de
   `/equipe/etats-des-lieux`. Contrôler `private, no-store` sur les réponses
   d’équipe et l’absence de cache CDN privé. Une demande de connexion Vercel
   protège l’hébergement mais ne valide pas les contrôles de l’application.
6. Consigner SHA, date, URL, résultats et absence de variables de développement,
   sans copier leurs valeurs ni partager de cookies/HAR non nettoyés. Un statut
   Vercel vert seul ne suffit pas à approuver la publication.

## Publication contrôlée de la seule vitrine — action future à autoriser

1. Conserver la PR en brouillon jusqu’à validation de la Preview, du diff et des
   variables. Examiner notamment le changement de runtime Node 22 et les correctifs
   Next ; les contenus publics, le drapeau fermé et le verrou sont conservés.
2. Le propriétaire vérifie en lecture seule la configuration **Production** :
   tableau ci-dessus, aucune URL/clé Supabase de développement, pas de secret de
   test, domaine et branche existants inchangés. Si un changement Production est
   nécessaire, le présenter et obtenir une autorisation distincte **avant** de
   l’effectuer. Sans cette vérification, ne pas approuver la publication.
3. Relever le déploiement de production actuel et le moyen de retour arrière.
   Les contenus/légaux et l’indexation restent dans l’état de la vitrine existante :
   aucune complétion ou ouverture SEO implicite dans cette livraison.
4. Obtenir l’accord explicite de publication de la vitrine fermée. **Ne pas
   fusionner simplement pour “préparer”** : si l’intégration déploie `main`
   automatiquement, la fusion déclenchera une construction de production.
5. Après cet accord seulement, sortir la PR du brouillon, faire la revue et
   fusionner dans `main`. Laisser Vercel construire cette version avec sa
   configuration Production vérifiée ; ne pas promouvoir la Preview par raccourci.
6. Vérifier le SHA réellement servi, les trois pages publiques, le mobile/clavier,
   HTTPS et les refus d’accès à l’équipe/dossiers comme ci-dessus. Ne saisir
   aucune donnée de voyageur dans le module et ne faire aucun test d’écriture
   Supabase pour cette publication.
7. Si la vitrine régresse, utiliser sous autorisation le déploiement de secours
   examiné, ou redéployer un correctif qui garde le module fermé. Tenir compte des
   correctifs de sécurité du framework : ne pas choisir aveuglément une ancienne
   version vulnérable. Un rollback Vercel ne restaure jamais une base Supabase.

Aucune de ces actions de production n’a été exécutée. Le maintien de `main` a été
vérifié pendant la préparation ; la PR n’est pas une autorisation de fusion.

## Activation future des états des lieux

L’ouverture reste interdite avant les tests réels Auth, profils actifs/inactifs/
sans fiche, sessions/expiration, RLS avec JWT de membres, partage inter-agents,
validation du payload, conflits, sauvegarde/rechargement, reset, suppression
administrative confirmée, impression et export. Les autres conditions du handoff
(récupération/SMTP, données personnelles, hébergement, sauvegardes, décision du
propriétaire) restent applicables à cette ouverture.

L’activation en production exigera une base distincte, les autorisations adaptées
et une modification séparée, revue et testée du verrou actuellement conservé.
Mettre seulement `TEAM_INSPECTIONS_ENABLED=true` ne peut pas ouvrir le module en
Vercel Production. Ni cette modification ni ce drapeau ne sont demandés ici.

Références : [phase 5](ESPACE_EQUIPE_PHASE_5.md),
[handoff de recette et d’activation](ESPACE_EQUIPE_HANDOFF.md),
[rapport de recette réelle bloquée](ESPACE_EQUIPE_RECETTE_REELLE.md).
