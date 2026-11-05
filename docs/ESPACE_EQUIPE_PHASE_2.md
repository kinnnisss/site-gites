# Espace Équipe — phase 2 : portage fidèle

## Référence et périmètre

- Branche : `feature/espace-equipe`.
- Départ : `76ef6831854e49bcf6e3922289e5130a0bae3a5f`.
- HTML inchangé : `docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html`.
- SHA-256 : `9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0`.

Les composants sont uniquement dans `modules/etats-des-lieux`. Aucune route
applicative ne les importe. Le cadre public et les fondations de phase 1 sont
conservés. Ni Supabase, ni Auth, ni dépendance ou donnée de production n’est ajouté.

## Architecture

Le composant client `InspectionForm` compose le séjour, les deux phases de
contrôle, les checklists, le règlement et le récapitulatif. Le CSS Module reprend
la feuille de style originale et neutralise les effets de Preflight à l’intérieur
du formulaire. Le logo PNG est conservé sans réencodage. Aucun élément visuel
nouveau n’est ajouté.

Le reducer pur gère exactement les champs chaînes, les 26 choix tri-état,
les 23 booléens de procédure et la prise de connaissance. La phase active et
le message de retour restent hors du payload version 1. Les échanges exposent
des copies pour empêcher une mutation accidentelle de l’état interne.

## Adaptations provisoires explicites

Les boutons et leurs libellés sont conservés. Sans adaptateur de stockage,
la sauvegarde et le rechargement affichent seulement leur indisponibilité.
Aucun succès serveur n’est simulé et aucun brouillon local n’est persisté.
Le bouton Effacer réinitialise la mémoire après confirmation, sans suppression
de dossier. L’impression native et l’export JSON sont opérationnels.

Les textes de maquette et lignes de signature papier restent identiques à la
référence. Il n’y a ni photo, ni signature électronique, ni finalisation,
ni autosauvegarde, ni PDF serveur. Le champ responsable reste un champ libre.

## Validation navigateur

Exécution avec Chromium 155, même navigateur et mêmes données synthétiques
pour le HTML original et le composant React monté temporairement en local :

- 32 paires d’images : 320, 375, 500, 501, 780, 781, 1080, 1440 px × initial/
  rempli × arrivée/départ. Correspondance exacte pixel par pixel.
- Deux paires de captures en mode impression : les deux phases visibles,
  indépendamment de l’onglet actif. Correspondance exacte pixel par pixel.
- Douze paires de pages A4 rastérisées depuis les impressions navigateur :
  six pages par onglet actif, correspondance exacte pixel par pixel.
- Textes visibles, dix champs, placeholders, libellés ARIA et logo identiques.
- Sélection, désélection, remplacement, progression jusqu’à 13/13 et indépendance
  des checklists : réussis.
- Chacun des trois contrôles critiques dans chacune des deux phases, y compris
  phase masquée : alerte correcte et réversible.
- Initialisation par payload, remplacement, copies indépendantes, chaînes vides,
  accents, sauts de ligne et textes longs : réussis.
- JSON complet, nom de fichier et indentation identiques à la référence.
- Réinitialisation annulée puis confirmée : réussie ; valeur voyageurs à 6.
- Appel d’impression, restitution du règlement et résumé : réussis.
- Stockage non connecté et absence d’écriture `localStorage` : vérifiés.
- Aucun événement d’erreur JavaScript pendant le parcours.

Les écarts détectés lors du portage (hauteur native des champs date et espace
avant les indicateurs de sécurité) ont été corrigés. Aucun écart visuel
inexpliqué ne reste dans les comparaisons ci-dessus. Les tests sont limités au
navigateur, aux dimensions et aux réglages d’impression décrits.

## Qualité, non-régression et exposition

- `npm run lint`, `npx tsc --noEmit`, `npm run build` : réussis sur le code final,
  après retrait du banc d’essai. Turbopack fonctionne sans repli Webpack.
- Les trois pages publiques répondent HTTP 200. Leurs textes, métadonnées,
  titres et liens restent identiques ; six nouvelles paires de captures à 375
  et 1440 px sont identiques pixel par pixel à la phase 1.
- Navigation clavier, ancres et neuf contrôles de débordement supplémentaires
  à 320, 768 et 1024 px : réussis, sans erreur JavaScript.
- Les URL Équipe, la route temporaire et les fichiers sources/référence ne sont
  pas accessibles par HTTP (404). Aucune donnée privée n’est exposée.
- Aucun import du formulaire depuis `app/`, aucune route d’essai ni code du
  formulaire dans les bundles publics. Le manifeste final ne comporte que
  les trois pages publiques et les pages d’erreur Next.js.
- Les fichiers de la phase 1 sous `app/`, les composants publics, données,
  dépendances et configurations sont inchangés.

## Fichiers

Créés : `modules/etats-des-lieux/inspection-form.tsx`, `inspection.module.css`,
`reference.ts`, `reference-logo.ts`, `state.ts`, `types.ts` ; dans `components/`,
`fields.tsx`, `housing-inspection.tsx`, `rules-and-summary.tsx` ; ce rapport ;
`tests/etats-des-lieux/fidelity.mjs`, `compare-images.py` et `README.md`.

Mis à jour : `README.md` et `modules/etats-des-lieux/README.md`.
La référence HTML n’a pas été modifiée.

## Suite, après validation

Mettre en place l’authentification, les membres actifs et les autorisations
serveur avant de monter le formulaire sur une route Équipe. Raccorder ensuite
la persistance sur des ressources Supabase de développement isolées, après
validation des droits opérationnels et du sens partagé d’Effacer.

Aucune fusion dans `main` ni intervention de déploiement en production.
