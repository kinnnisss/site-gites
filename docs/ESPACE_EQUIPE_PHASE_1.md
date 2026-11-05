# Espace Équipe — fondations, phase 1

## Référence Git

- Dépôt : `kinnnisss/site-gites`.
- Branche : `feature/espace-equipe`.
- Départ : `main` distant, commit `bfc7a5a7161b5a61312c9da2f3075ed129b4bac8`.
- L’ancien checkout `work` n’a pas servi de base.

## Changements

Le layout racine conserve seulement le document HTML et le socle Tailwind.
Le groupe `(public)` conserve les trois URL, les métadonnées, les polices, le
header, le footer et la navigation. Le CSS de présentation est limité au cadre
`.public-site` ; `:where()` conserve la spécificité des anciens sélecteurs.
Les couleurs réelles restent locales au cadre, et les utilitaires Tailwind les
résolvent par variables. Les références HTML sont exclues du scan Tailwind.

`app/equipe` contient un layout neutre sans page ni endpoint. Ce layout n’est
pas une authentification ; ses métadonnées `noindex` ne protègent pas des données.
`modules/etats-des-lieux` contient uniquement les consignes d’intégration future.

Le HTML client est copié octet pour octet sous `docs/references/`, hors de
`public/`. SHA-256 vérifié :

```text
9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0
```

Ni contenu métier, ni composants publics, ni données, ni dépendances ou
configuration Vercel ne sont modifiés. Aucun formulaire, fournisseur Auth,
accès base de données, secret ou fonctionnalité métier n’est ajouté.

## Validation dans l’environnement cloud

Node.js 22.23.4, Next.js 16.3.6. Contrôles sur les sources issues de `main`, puis
sur les sources refactorisées : ESLint, TypeScript et build Turbopack.

Le cache préexistant `.next/dev/types` référençait les anciens chemins après
déplacement des routes. Sa suppression, serveur arrêté, règle ce problème de
fichiers générés ; aucun assouplissement TypeScript n’est nécessaire.

Les pages sont vérifiées avec le serveur de production local et Chromium 155 :

- `/`, `/mentions-legales`, `/confidentialite` : HTTP 200.
- Six paires de captures pleine page à 375 et 1440 px, avant/après : images
  identiques pixel par pixel. Textes, métadonnées, titres et liens identiques.
- Neuf contrôles supplémentaires des trois pages à 320, 768 et 1024 px : aucun
  débordement horizontal.
- Lien d’évitement, menu mobile, fermeture par Échap, retour du focus, ancre
  contact, sommaire légal et retour à une ancre depuis la page légale : vérifiés.
- Aucun événement d’erreur JavaScript pendant ces parcours.
- Hors de `.public-site`, aucune variable de couleur ni présentation publique
  n’est appliquée au témoin de contrôle.
- `/equipe`, `/equipe/connexion`, `/equipe/etats-des-lieux`, sa route `/nouveau`
  et une URL de dossier : HTTP 404, aucun cadre public ou dossier servi.
- L’URL `/docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html` : HTTP 404.
- Le manifeste de build ne comporte que les trois pages publiques et les pages
  internes d’erreur Next.js.

Les captures et scripts de contrôle ponctuels sont des artefacts locaux de
validation ; aucune dépendance de test n’est ajoutée au projet. Les comparaisons
visuelles portent sur les dimensions et le navigateur indiqués ci-dessus.

## Phase 2

Intégrer fidèlement la référence, sans dashboard ni ajout de champ, photo,
signature électronique, statut de finalisation ou générateur PDF serveur.
Prévoir ensuite Auth et persistance Supabase sur un projet de développement
distinct de la production, avec autorisations serveur et RLS avant les données
réelles. Valider les permissions opérationnelles des agents et la portée
partagée d’« Effacer » avant les mutations. L’impression reste native.

Cette phase ne fusionne pas dans `main` et ne déploie pas en production.
