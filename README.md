# Domaine Lo Carmalhon — V1 vitrine

Évolution de la démonstration existante, avec Next.js App Router, TypeScript et Tailwind CSS. La palette crème, les compositions, la typographie et le menu mobile sont conservés ; les accents s’accordent au logo officiel.

## Lancer et vérifier

Avec Node.js 22 et les dépendances déjà installées :

```bash
nvm use 22
npm run dev
```

Ouvrir http://localhost:3000.

```bash
npm run lint
npm run build
npx tsc --noEmit
```

Si l’environnement bloque les ports internes de Turbopack, vérifier aussi avec `npm run build -- --webpack`. Pour un serveur de développement dans ce cas : `npm run dev -- --webpack`.

## Organisation

- `data/domain.ts` : identité, adresse, caractéristiques, équipements, horaires, contacts, photos, galerie et navigation. C’est le point d’entrée pour actualiser les informations client.
- `app/page.tsx` : composition des sections, sans logique métier.
- `components/sections/` : sections de la page, rendues côté serveur.
- `components/site-header.tsx` : menu mobile, fermeture par Échap et accès clavier.
- `components/domain-photo.tsx` : `next/image`, emplacements vides et erreurs de chargement.
- `components/cottage-illustration.tsx` : ancienne illustration de démonstration, désormais inutilisée ; l’accueil emploie un placeholder neutre.
- `app/globals.css` : couleurs, typographie et styles partagés.
- `app/layout.tsx` : cadre commun, metadata et Open Graph.
- `app/mentions-legales/` et `app/confidentialite/` : pages préparées, explicitement non définitives.

Aucune base de données, authentification, réservation, paiement, collecte par formulaire ou intégration Supabase. Pas de dépendance supplémentaire pour la V1.

## Logo et photographies

Le logo officiel est déjà présent dans `public/images/logo-domaine-lo-carmalhon.jpeg`. Il est importé statiquement avec `next/image`, sans recadrage, et sert aussi d’icône. Remplacer le fichier au même emplacement si nécessaire.

Placer les photographies validées dans :

| Sujet | Dossier |
| --- | --- |
| Image principale | `public/images/hero/` |
| Maison, cuisine, pièce de vie | `public/images/house/` |
| Chambres | `public/images/bedrooms/` |
| Terrasse et jardin | `public/images/outdoors/` |
| Piscine | `public/images/pool/` |
| Écurie, boxes, carrière, paddock | `public/images/equestrian/` |
| Autres vues | `public/images/gallery/` |

Dans `photos` de `data/domain.ts`, renseigner le chemin public (sans `public`) et un texte alternatif décrivant précisément la vraie photo :

```ts
house: {
  id: "house",
  label: "La maison",
  src: "/images/house/maison.jpg",
  alt: "Description de la photographie validée à renseigner",
},
```

Ce chemin est un exemple technique, aucun fichier photo de maison n’est encore fourni. Tant que `src` ou `alt` est vide, un emplacement explicite est affiché. Une même entrée alimente sa section et la galerie. Pour ajouter une vue, créer une entrée dans `photos`, puis l’ajouter au tableau `gallery` ; aucun JSX à modifier. La photo principale utilise `photos.hero`.

## Contacts

Renseigner `domain.contact.phone`, `whatsapp` et `email`. Utiliser le format international pour les numéros (avec indicatif pays). Les liens `tel:`, WhatsApp et `mailto:` apparaissent uniquement pour les champs non vides. Sans coordonnées, un message d’attente est affiché. Aucun faux bouton d’envoi.

Le lien de cartographie est calculé depuis l’adresse centrale, sans API ni carte embarquée.

## Informations encore attendues

- Téléphone, WhatsApp et e-mail.
- Photos définitives et descriptions alternatives.
- Tarifs, capacité maximale officielle et politique d’annulation.
- Règles concernant les animaux, Wi-Fi et parking.
- Modalités d’utilisation des installations équestres et accueil éventuel des chevaux.
- Informations légales : éditeur, responsable de publication, hébergeur, traitements de données, droits des images et coordonnées applicables.
- Nom de domaine de production.

## Avant publication

Compléter les contacts et documents légaux, valider les contenus avec le client et renseigner `domain.siteUrl`. L’indexation reste volontairement désactivée (`robots` dans `app/layout.tsx`) pendant cette phase ; la revoir avant publication, puis ajouter URL canonique, sitemap et image de partage réelle. Aucun domaine ni image Open Graph fictif n’est déclaré.

## Contrôles manuels

Vérifier à 320, 375, 768, 1024 et 1440 px : absence de débordement, proportions du logo, menu mobile, ancres, liens légaux et retour à l’accueil. Au clavier : lien « Aller au contenu », Tab, Entrée, Échap dans le menu et focus visible. Vérifier aussi les photos sur connexion lente et une URL photo invalide, puis les trois contacts dès qu’ils sont fournis. Le site respecte la préférence de réduction des mouvements.

## Validation de cette V1 — 6 octobre 2026

- ESLint, TypeScript (`tsc --noEmit`) et compilation de production Webpack : réussis.
- `npm run build` exécuté : Turbopack reste bloqué ici par `binding to a port / Operation not permitted`, même après relance autorisée. La configuration du projet reste inchangée.
- Contrôle Chromium à 320, 375, 640, 768, 1024, 1440 et 1920 px : aucun débordement horizontal ; menu, ancres, fermeture par Échap, focus et proportions du logo vérifiés.
- Lien d’évitement, métadonnées, pages légales, absence de coordonnées vides cliquables et absence d’erreur JavaScript : vérifiés.
- Captures mobile et ordinateur inspectées. Aucun outil de test ajouté aux dépendances du projet.
- Les véritables photos et contacts n’étant pas encore fournis, leur contenu final et leur destination restent à valider lors de l’intégration.

## Évolution visuelle — maquette Stitch du 10 octobre 2026

La présentation reprend la composition de la maquette fournie : header compact, titre en deux styles, arche, chiffres clés en cartes, blocs d’équipements, panneaux d’informations pratiques et contact bordeaux. Le menu actif et la navigation clavier sont conservés. Le menu se replie désormais sous 1280 px pour conserver des liens lisibles.

- Newsreader (normal et italique) et Inter (variable) sont auto-hébergées via `next/font/local`, au format WOFF2 dans `app/fonts/`, avec leurs licences SIL OFL. Aucun appel à Google Fonts n’est effectué par le navigateur.
- Les icônes sont des SVG locaux regroupés dans `components/icon.tsx`.
- `DomainPhoto` propose quatre variantes visuelles : `hero`, `editorial`, `landscape`, `gallery`. Toutes continuent à utiliser les données `photos` et `gallery` dans `data/domain.ts`.
- Les images externes et les affirmations non confirmées du modèle Stitch (histoire du lieu, architecture, literie, etc.) n’ont pas été reprises. Les photographies du domaine restent à fournir.

Contrôles de cette évolution : ESLint, TypeScript et compilation Webpack réussis ; navigation, lien actif, clavier, logo et absence de débordement vérifiés dans Chromium à 320, 375, 640, 768, 1024, 1280, 1440 et 1920 px. Captures mobile et ordinateur inspectées. Aucun appel externe du navigateur pendant ces parcours. Le doré utilisé pour les textes est assombri (`#76592d`) pour améliorer le contraste sur les fonds clairs.

### Présentation des mentions légales

La page `/mentions-legales` utilise un fil d’Ariane, un en-tête éditorial et un encart unique « Version à compléter ». Un sommaire permet de rejoindre les cinq rubriques numérotées avec des ancres natives utilisables sans JavaScript. Il reste visible à gauche sur les fenêtres d’au moins 1024 × 700 px, et apparaît au-dessus du contenu sur les écrans plus petits. Son composant est `components/legal-notice.tsx`, avec des styles isolés dans `components/legal-notice.module.css`.

Le texte principal est à 16 px et les paragraphes sont limités à 68 ch pour faciliter la lecture. Les liens ont une hauteur minimale de 48 px ; les cibles des ancres sont décalées sous l’en-tête fixe. Les détails de l’éditeur et de l’hébergeur s’empilent sur téléphone, avec une mention explicite « À renseigner » pour chaque donnée absente. Le statut et les identifiants restent deux champs distincts pour que la présence de l’un ne masque pas l’absence de l’autre. La rubrique photo décrit les emplacements temporaires actuels de l’accueil.

Compléter les informations validées sur l’éditeur et l’hébergeur dans `data/legal.ts`. L’identité du domaine, son adresse et l’e-mail restent issus de `data/domain.ts`. Les valeurs absentes sont affichées comme « À renseigner ». La page demeure explicitement une version à compléter ; les garanties et coordonnées fictives de la maquette ne sont pas reprises.

## Amélioration de l’accueil — 14 octobre 2026

- Nom corrigé en **Domaine Lo Carmalhon**, y compris dans les métadonnées et les pages légales. Le fichier du logo a été renommé sans modifier l’image.
- Identité crème et rouge profond, Newsreader et Inter locales conservées. Corps de texte à 16 px, légendes agrandies, cibles tactiles de 48 px ou plus.
- Contact prioritaire dans le hero, navigation fixe au défilement, ancres dégagées sous l’en-tête et menu mobile à deux colonnes. Le menu se ferme par Échap avec retour du focus et lorsqu’on le quitte au clavier.
- Chiffres clés regroupés en une bande compacte ; listes d’équipements simplifiées et galerie sur deux colonnes sur téléphone, quatre à partir de 768 px.
- Tous les emplacements photo, y compris le hero, utilisent des placeholders neutres portant « Photographie à venir ». Les légendes restent hors de l’image pour préserver leur lisibilité. Les états de chargement et d’erreur utilisent le même cadre pour éviter les déplacements de contenu.
- Pour ajouter les vraies photos, renseigner toujours `src` et `alt` dans `photos` de `data/domain.ts`, puis déposer les fichiers dans `public/images/`. Aucune modification de composant n’est nécessaire.

Validation : ESLint, TypeScript et compilation de production Webpack réussis. Les principaux couples texte/fond mesurés dépassent 4,5:1. Le parcours navigateur de cette évolution n’a pas été exécuté : Chromium est bloqué dans le bac à sable et son lancement hors du bac à sable n’a pas été autorisé. Les contrôles manuels décrits plus haut restent à effectuer. Les coordonnées et les photos réelles restent à fournir.
