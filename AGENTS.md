<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Projet : site de location de gîtes

## Objectif
Créer un site professionnel, chaleureux et adapté au téléphone pour présenter les gîtes d'une entreprise et permettre aux visiteurs de consulter les disponibilités et de demander une réservation.

## Technologies retenues
- Next.js avec App Router
- TypeScript
- Tailwind CSS
- PostgreSQL hébergé par Supabase
- Déploiement prévu sur Vercel
- Node.js 22 pour le développement local

## Fonctionnalités prévues
- Accueil présentant l'entreprise et les hébergements.
- Liste des gîtes et page détaillée pour chaque gîte.
- Galerie de photos, équipements, capacité, tarifs et informations pratiques.
- Recherche par dates et nombre de personnes.
- Consultation des disponibilités.
- Demande de réservation avec récapitulatif avant envoi.
- Contact par formulaire, téléphone, e-mail et WhatsApp.
- Espace privé permettant à l'entreprise de gérer les contenus et les réservations.
- Pages adaptées au mobile et référencement des gîtes.

## Décisions encore en attente
Le nom de l'entreprise, les gîtes réels, les photos, les tarifs, les coordonnées, les règles de séjour et les conditions d'annulation restent à fournir.
Le mode de réservation (demande à valider ou confirmation immédiate), le paiement en ligne et l'acompte restent à décider.

Ne présente jamais des données d'exemple comme des informations réelles de l'entreprise. N'implémente pas le paiement ni la confirmation automatique d'une réservation avant validation de ces choix.

## Consignes de travail pour l'agent
- Lire le cahier des charges et les fichiers existants avant de coder.
- Avant une fonctionnalité importante, expliquer brièvement les fichiers qui seront modifiés et les choix à valider.
- Travailler par petites étapes fonctionnelles que je peux vérifier dans le navigateur.
- Garder des composants lisibles et des types TypeScript explicites.
- Prévoir les états de chargement, les erreurs et l'utilisation au clavier et sur téléphone.
- Protéger l'espace d'administration et les données personnelles des visiteurs.
- Ne jamais placer de clé secrète Supabase dans du code envoyé au navigateur ou dans Git.
- Vérifier le résultat avec les commandes de contrôle du projet et signaler ce qui n'a pas pu être testé.
- Ne pas inventer une règle métier lorsqu'elle manque : la noter comme décision à prendre.