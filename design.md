# Domaine Lo Carmahon — Brief d’amélioration du design

> Document à transmettre à une IA de design avec le logo officiel et, si possible, des captures du site actuel sur ordinateur et téléphone.
> État du projet : 10 octobre 2026. Description établie à partir des fichiers du site. Les pistes d’amélioration ci-dessous sont des propositions à explorer, pas des changements déjà réalisés.

## 1. Mission pour l’IA de design

Améliorer le design du site vitrine existant du **Domaine Lo Carmahon**, un gîte situé à Saint-Aulaye-Puymangou, en Dordogne, France.

Le site possède déjà une direction visuelle satisfaisante : chaleureuse, sobre, contemporaine et aérée. Faire évoluer cette base pour lui donner davantage de personnalité, mieux valoriser les futures photographies et faciliter la lecture sur téléphone. Ne pas repartir d’un modèle générique ni reconstruire l’identité de zéro.

Le résultat recherché est une proposition visuelle suffisamment précise pour être ensuite implémentée dans le projet Next.js existant. La demande porte sur le design ; ne pas publier le site, changer les informations client ou ajouter des fonctionnalités commerciales.

## 2. Objectif du site et parcours visiteur

Le visiteur doit pouvoir :

1. Comprendre immédiatement le nom du lieu, sa localisation et le type d’hébergement.
2. Découvrir la maison, ses équipements et les espaces extérieurs.
3. Identifier les installations équestres sans supposer qu’un accueil des chevaux est proposé.
4. Parcourir les photographies lorsqu’elles seront disponibles.
5. Trouver les horaires, l’adresse et les moyens de contact renseignés.

**Action principale : « Nous contacter ».**
Action de découverte : « Découvrir le domaine ».

Le public visé est constitué de personnes recherchant un gîte pour un séjour en Dordogne. Aucun profil démographique précis ni positionnement tarifaire n’a été confirmé : ne pas en déduire une offre de luxe, économique ou réservée à un public particulier.

### Périmètre de cette V1

Une page principale à ancres, plus deux pages légales à compléter. Aucun système de réservation, calendrier de disponibilités, paiement, compte utilisateur, formulaire d’envoi, base de données ou espace administrateur.

Ne pas dessiner de boutons « Réserver », de sélecteurs de dates, de prix par nuit, de recherche multi-hébergements ou de faux formulaire fonctionnel. Il s’agit actuellement d’un seul gîte.

## 3. Identité et tonalité à préserver

- Nom : **Domaine Lo Carmahon**.
- Accroche actuelle : **« Une parenthèse de calme au cœur de la Dordogne »**.
- Localisation affichée : **Saint-Aulaye-Puymangou · Dordogne**.
- Sensations recherchées : calme, campagne, confort, vacances, authenticité et soin.
- Ton rédactionnel : français, naturel, sobre et crédible ; pas de superlatifs non justifiés.
- Expression visuelle : surfaces claires, typographie élégante, respiration, photographies mises en valeur.

### Logo officiel

Fichier fourni dans le projet : `public/images/logo-domaine-lo-carmahon.jpeg`.

Il représente un blason rouge et or accompagné du nom du domaine, sur fond blanc. Le conserver intégralement, dans ses proportions, avec une zone de respiration suffisante. Ne pas le redessiner, le déformer, le recolorer ou le recadrer pour en retirer des éléments.

Son inspiration héraldique ne doit pas transformer le site en univers médiéval. Éviter les parchemins, textures de pierre, typographies gothiques, ornements omniprésents et grands aplats dorés. Le rouge profond est un accent ; le doré reste ponctuel.

## 4. Système visuel actuellement implémenté

Ces valeurs décrivent l’existant et servent de point de départ. Toute évolution doit rester cohérente avec l’identité et être expliquée.

### Palette

| Rôle | Valeur actuelle | Usage |
| --- | --- | --- |
| Fond principal | `#FAF8F2` | Crème, fond général |
| Surface secondaire | `#F0EEE5` | Sections alternées et cartes |
| Texte principal | `#33372E` | Texte sombre légèrement végétal |
| Texte secondaire | `#62645B` | Descriptions et légendes |
| Accent | `#7B292F` | Rouge profond, boutons et repères |
| Accent au survol | `#612128` | Bouton principal |
| Doré discret | `#927344` | Petits détails et séparateurs |
| Bordures | `#DEDBD0` | Délimitations fines |

Ne pas présumer que toutes les combinaisons de ces couleurs conviennent aux petits textes : vérifier les contrastes des compositions proposées.

### Typographie

- Titres : `Georgia`, avec repli sur `Times New Roman`, puis serif.
- Texte et interface : `Arial`, `Helvetica`, puis sans-serif.
- Titre principal : environ 48 px sur petit écran, 60 px à partir de 640 px, 72 px à partir de 1024 px.
- Titres de section : généralement 30 à 48 px suivant la largeur.
- Corps de texte : généralement 14 à 16 px ; accroche du hero à 24 px.
- Petits surtitres : capitales espacées, environ 11 px, rouge profond.

Une autre association typographique peut être proposée, mais elle doit apporter un bénéfice identifiable de lisibilité ou d’identité. Éviter les polices décoratives difficiles à lire et limiter le nombre de familles et de graisses.

### Grille, rythme et formes

- Largeur maximale du contenu : **1 160 px**.
- Marges latérales minimales actuelles : **20 px** de chaque côté.
- Espacements verticaux généreux : généralement 64 à 96 px, avec des variations par section.
- Alternance de sections crème et beige clair.
- Compositions texte/image sur deux colonnes à partir de 768 px, empilées sur téléphone.
- Cartes avec bordures fines et angles arrondis, sans ombres marquées.
- Boutons en pilule, hauteur minimale 48 px.
- Images courantes au ratio 4:3, avec angles arrondis.
- Visuel principal au ratio 4:3,5, arrondi en arche dans sa partie supérieure.

## 5. Structure réelle de la page

| Zone | Contenu et présentation actuels | Rôle à préserver |
| --- | --- | --- |
| Header | Logo, signature discrète, CTA contact ; navigation sur une seconde ligne sur ordinateur | Identifier le domaine et orienter rapidement |
| Accueil `#accueil` | Localisation, nom en grand, accroche, deux CTA ; illustration temporaire à droite | Donner une première impression claire et chaleureuse |
| Domaine `#domaine` | Présentation du lieu sur fond beige, puis quatre chiffres clés | Faire comprendre l’offre en quelques secondes |
| Maison `#maison` | Grand emplacement photo à gauche, présentation et caractéristiques à droite | Montrer l’organisation de la maison |
| Équipements `#equipements` | Deux cartes : cuisine et confort | Rendre les équipements faciles à parcourir |
| Extérieurs `#exterieurs` | Deux grandes images prévues, jardin et piscine ; trois groupes d’équipements | Donner davantage de place à l’environnement extérieur |
| Espace équestre `#equestre` | Texte, liste des installations et grand emplacement photo | Présenter uniquement les installations confirmées |
| Galerie `#galerie` | Huit emplacements ; une, deux ou quatre colonnes selon la largeur | Donner une vision d’ensemble des espaces |
| Informations `#informations` | Deux cartes : arrivée/départ et localisation | Faciliter la préparation d’un séjour |
| Localisation `#localisation` | Adresse et lien externe vers Google Maps, dans la section pratique | Permettre de situer le domaine sans carte embarquée |
| Contact `#contact` | Grand panneau rouge profond ; coordonnées conditionnelles | Rendre la prise de contact évidente quand les données sont disponibles |
| Footer | Nom, localisation, liens légaux et retour à l’accueil | Terminer la page avec des accès utiles |

Navigation actuelle : **Accueil · Le domaine · La maison · Équipements · Extérieurs · Galerie · Informations pratiques · Contact**.

L’espace équestre est une section de la page, sans entrée dédiée dans le menu actuel. Il peut rester associé à la découverte des extérieurs. Éviter de surcharger le menu.

### Comportements existants à conserver

- Menu mobile repliable en dessous de 1024 px, affiché dans le flux de la page.
- Header actuellement non fixe ; une variante fixe peut être proposée, mais doit être justifiée et ne pas masquer le contenu ou le focus.
- Lien actif suivant le défilement : texte rouge, fond discret, soulignement et `aria-current="location"`.
- Fermeture du menu après sélection et avec Échap ; gestion du focus clavier.
- Lien « Aller au contenu » visible au clavier.
- Défilement doux uniquement si l’utilisateur n’a pas demandé une réduction des mouvements.
- Pages `/mentions-legales` et `/confidentialite` existantes, avec des contenus explicitement à compléter.
- La galerie actuelle est une grille, sans agrandissement modal ni carrousel. Présenter tout ajout de ce type comme une option à valider.

### Hiérarchie des CTA à examiner

Le header met actuellement « Nous contacter » en avant. Dans le hero, « Découvrir le domaine » est le bouton rempli et « Nous contacter » le bouton secondaire. Proposer une hiérarchie cohérente avec l’objectif de contact tout en conservant une invitation claire à découvrir le lieu. Ne pas multiplier les boutons concurrents.

## 6. Informations client confirmées

Utiliser exclusivement les faits suivants dans les maquettes.

### Maison

- Maison de **100 m²**, entièrement rénovée.
- **3 chambres**, **2 salles de bain**, **2 toilettes**.
- Grande pièce de vie et cuisine entièrement équipée.

### Équipements

- Cuisine : réfrigérateur, congélateur, lave-vaisselle, four, micro-ondes.
- Confort : lave-linge, sèche-linge, climatisation réversible.
- Moustiquaires à toutes les fenêtres et portes-fenêtres.

### Extérieurs

- Jardin de **10 000 m²** et piscine.
- Terrasse extérieure, salon de jardin et espace repas.
- Barbecue / plancha.
- Espace loisirs, terrain de pétanque et terrain de volley.

### Installations équestres

- Écurie, **2 boxes**, carrière et paddock.
- Les modalités d’utilisation et l’accueil éventuel de chevaux ne sont pas confirmés.

### Informations pratiques

- Adresse : **8 rue Jean Jaurès, 24410 Saint-Aulaye-Puymangou, France**.
- Arrivée : **samedi à partir de 16 h**.
- Départ : **samedi avant 10 h**.

Les quatre chiffres clés affichés sont : **100 m² · 3 chambres · 2 salles de bain · 10 000 m² de jardin**.

## 7. Informations absentes et limites absolues

Ne pas inventer :

- Téléphone, WhatsApp, e-mail ou nom de domaine de production.
- Tarifs, promotions, disponibilités ou capacité maximale en voyageurs.
- Avis clients, notes, étoiles ou classement officiel.
- Politique d’annulation, règles concernant les animaux ou durée minimale de séjour.
- Présence de Wi-Fi, parking ou autres services non confirmés.
- Accueil des chevaux, cours d’équitation ou prestations équestres.
- Caractéristiques de la piscine non précisées : chauffage, dimensions, horaires ou exclusivité.
- Distances vers des attractions, temps de trajet ou situation isolée du domaine.

Ne pas inférer la capacité d’accueil à partir du nombre de chambres. Ne pas présenter les documents légaux comme finalisés.

Le composant contact masque actuellement chaque lien dont la valeur est vide. En l’absence de toute coordonnée, il affiche un message indiquant que les coordonnées seront prochainement disponibles. Prévoir une présentation élégante de cet état, et une variante alimentée uniquement avec les coordonnées réellement fournies.

## 8. Photographies et assets

### État actuel

Le logo est disponible. Toutes les sources des photographies du domaine sont encore vides dans les données du site.

Le hero utilise une illustration SVG de campagne, clairement accompagnée de la mention qu’elle ne représente pas le lieu réel. Les autres images sont remplacées par des emplacements neutres et explicitement identifiés comme « Photographie à venir ».

Ne pas utiliser de photo de banque d’images ou d’image générée susceptible d’être prise pour le Domaine Lo Carmahon. Ne pas transformer l’illustration en preuve visuelle de l’architecture réelle de la maison.

### Deux états à concevoir

1. **État actuel sans photos** : interface présentable, signalement clair et sobre des images absentes, sans succession excessive de grands cadres vides.
2. **État avec photos client** : photographies réelles dominantes, cadrages adaptés au contenu, textes et boutons suffisamment contrastés.

Pour représenter le second état sans avoir reçu les photos, utiliser des cadres annotés plutôt que fabriquer le domaine. Ne pas confondre « image à venir » et « erreur de chargement ».

### Sujets attendus

Vue d’ensemble du domaine, façade, chacune des trois chambres, pièce de vie, cuisine, deux salles de bain, terrasse, salon de jardin, espace repas, barbecue/plancha, jardin, piscine, terrains de loisirs et installations équestres.

La galerie actuelle prévoit huit catégories : maison, chambres, pièces de vie, cuisine, terrasse, jardin, piscine et installations équestres. Les vues supplémentaires pourront enrichir ces catégories ou en créer d’autres après réception.

| Emplacement dans le projet | Usage |
| --- | --- |
| `public/images/logo-domaine-lo-carmahon.jpeg` | Logo officiel à joindre au brief |
| `public/images/hero/` | Vue principale |
| `public/images/house/` | Maison et pièces intérieures |
| `public/images/bedrooms/` | Chambres |
| `public/images/outdoors/` | Terrasse et jardin |
| `public/images/pool/` | Piscine |
| `public/images/equestrian/` | Installations équestres |
| `public/images/gallery/` | Vues complémentaires |

## 9. Axes d’amélioration à explorer

Ces pistes doivent être évaluées à partir des captures ou du site, sans prétendre qu’elles constituent déjà des défauts mesurés.

1. **Première impression** : mieux articuler le logo détaillé, le nom du domaine, l’accroche et le futur grand visuel, sans surcharger le haut de page.
2. **Rythme éditorial** : varier les rapports texte/image et les densités pour éviter une répétition de sections identiques, tout en conservant une grille cohérente.
3. **Place des photos** : donner une présence particulière aux extérieurs et à la piscine, sans recadrages arbitraires qui masqueraient les lieux.
4. **Lecture mobile** : conserver la respiration sans créer une page inutilement longue, notamment avec les emplacements photo encore vides.
5. **Équipements** : rendre les groupes immédiatement compréhensibles ; si des icônes sont proposées, employer un style unique et conserver les libellés.
6. **Navigation** : rendre le lien actif et le CTA évidents ; préserver l’accès à toutes les sections sur les écrans étroits.
7. **Contact** : rendre la fin de page accueillante et utile, avec une distinction honnête entre les états sans coordonnées et avec coordonnées.
8. **Finitions** : harmoniser rayons, séparateurs, légendes, alignements et transitions, sans ajouter des effets décoratifs systématiques.

Éviter : rouge ou or omniprésent, style médiéval, effet « hôtel de luxe » non confirmé, carrousels automatiques, animations excessives, texte sur une image sans contraste maîtrisé, et transformation de toutes les informations en cartes identiques.

## 10. Responsive et accessibilité attendus

- Fournir des maquettes au minimum en **1440 px** et **375 px** ; préciser le comportement intermédiaire à **768 px** et le menu à **1024 px**.
- Prévoir une largeur minimale de **320 px**, sans défilement horizontal.
- Conserver les libellés longs réels, dont « Saint-Aulaye-Puymangou » et « Informations pratiques ».
- Définir l’empilement et l’ordre de lecture des compositions texte/image.
- Garder des cibles tactiles d’au moins 44 px, idéalement 48 px pour les CTA.
- Prévoir les états normal, survol, focus clavier et actif des liens et boutons.
- Ne pas signaler l’état actif uniquement par une couleur.
- Viser un contraste d’au moins 4,5:1 pour le texte courant et 3:1 pour les grands textes.
- Préserver la hiérarchie des titres, les textes alternatifs des photographies et une navigation sans souris.
- Respecter `prefers-reduced-motion` ; aucune animation indispensable à la compréhension.
- Prévoir les états photo absente, photo chargée et chargement échoué sans déplacement brutal de la mise en page.

Ces critères sont des exigences de conception à vérifier, pas une déclaration de certification du site.

## 11. Contraintes de réalisation et fichiers de référence

Le projet utilise **Next.js App Router, TypeScript et Tailwind CSS**. Garder cette base et ses composants modulaires. Ne pas proposer une migration de technologie ou une refonte du modèle de données pour une amélioration visuelle.

| Fichier / dossier | Responsabilité |
| --- | --- |
| `data/domain.ts` | Informations client, navigation, contacts, photos et galerie centralisés |
| `app/page.tsx` | Assemblage des sections |
| `app/globals.css` | Palette, typographie, grille et styles communs |
| `app/layout.tsx` | Cadre commun et métadonnées |
| `components/site-header.tsx` | Menu responsive et lien actif |
| `components/brand.tsx` | Logo officiel avec `next/image` |
| `components/domain-photo.tsx` | Affichage des images et états manquants/erreurs |
| `components/section-heading.tsx` | Titres de section et listes d’équipements |
| `components/sections/` | Sections indépendantes de la page |
| `components/site-footer.tsx` | Pied de page |
| `components/legal-page.tsx` | Présentation des pages légales |

Les photographies sont gérées par `next/image`. Les contenus doivent rester séparés du JSX autant que possible. Aucune dépendance lourde d’animation n’est nécessaire pour cette V1.

Si une implémentation est demandée ultérieurement, lire `AGENTS.md` et la documentation Next.js installée dans `node_modules/next/dist/docs/` avant de coder. Les fonctionnalités futures de réservation ou d’administration mentionnées dans le cahier des charges général ne font pas partie de ce brief.

## 12. Livrables attendus de l’IA de design

1. Un diagnostic court distinguant les qualités à conserver et les améliorations proposées.
2. Une direction artistique principale argumentée, issue de l’identité actuelle.
3. Une maquette complète ordinateur et une maquette complète mobile, avec les contenus réels du brief.
4. Les variantes du menu mobile ouvert et fermé, du lien actif et du focus clavier.
5. Les états sans photos / avec emplacements pour vraies photos, ainsi que sans contacts / avec contacts renseignés, sans coordonnées inventées.
6. Une mini-charte : couleurs, échelle typographique, espacements, largeur de grille, rayons, boutons et traitement des images.
7. Les règles responsive et les adaptations nécessaires pour les pages légales.
8. Une liste priorisée des changements à réaliser, reliée aux composants existants, en distinguant l’essentiel des options.

Une simple image du hero ne suffit pas : proposer une expérience cohérente sur toute la page et dans les deux formats.

## 13. Texte prêt à joindre à l’envoi

> Tu es designer web UX/UI. À partir de ce brief, du logo officiel et des captures jointes si elles sont disponibles, propose une amélioration du site existant du Domaine Lo Carmahon. Conserve son identité chaleureuse et contemporaine, ses tons crème et son accent rouge profond. Travaille particulièrement la hiérarchie, le rythme de la page, la place des futures photos, la navigation et la lecture mobile. Respecte les informations confirmées : un seul gîte, aucun tarif ou contact inventé, aucune réservation en ligne et aucune fausse photographie du domaine. Distingue le design actuel de tes propositions. Fournis une maquette complète ordinateur et mobile, les états d’interface et une mini-charte utilisable ensuite dans Next.js et Tailwind. Si tu n’as pas accès au site ou aux captures, indique que ton analyse de l’existant repose uniquement sur ce document.

## 14. Éléments à transmettre avec ce document

- Le logo officiel, indispensable pour travailler son intégration visuelle.
- Si possible, une capture complète de la page actuelle sur ordinateur et sur téléphone, ainsi qu’une capture du menu mobile ouvert.
- Les photographies réelles dès qu’elles seront disponibles, avec l’identification des pièces et des espaces.
- Facultativement, deux ou trois références visuelles choisies par le propriétaire, en précisant les aspects appréciés.

Le fichier `design.md` reste utilisable seul pour comprendre le projet. Une IA extérieure ne peut pas accéder à votre `localhost:3000` ni lire les chemins locaux mentionnés ici : joindre les fichiers visuels séparément lorsqu’ils sont nécessaires.
