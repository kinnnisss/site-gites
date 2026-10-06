# Domaine Lo Carmahon — V1 vitrine

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
- `components/cottage-illustration.tsx` : illustration héritée de la démo, uniquement en attente de la photo du hero et explicitement étiquetée comme ne représentant pas le domaine.
- `app/globals.css` : couleurs, typographie et styles partagés.
- `app/layout.tsx` : cadre commun, metadata et Open Graph.
- `app/mentions-legales/` et `app/confidentialite/` : pages préparées, explicitement non définitives.

Aucune base de données, authentification, réservation, paiement, collecte par formulaire ou intégration Supabase. Pas de dépendance supplémentaire pour la V1.

## Logo et photographies

Le logo officiel est déjà présent dans `public/images/logo-domaine-lo-carmahon.jpeg`. Il est importé statiquement avec `next/image`, sans recadrage, et sert aussi d’icône. Remplacer le fichier au même emplacement si nécessaire.

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
