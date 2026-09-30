# Site de gîtes — démonstration

Accueil en Next.js (App Router), TypeScript et Tailwind CSS. Tous les hébergements et le nom « La Parenthèse » sont fictifs. Aucune connexion Supabase, réservation, collecte de données ou fonctionnalité de paiement.

## Développement

Avec Node.js 22 et les dépendances installées :

```bash
npm run dev
```

Ouvrir http://localhost:3000. Si nécessaire, activer Node avec `nvm use 22` avant cette commande.

## Vérifications

```bash
npm run lint
npm run build
```

Vérifier dans le navigateur : affichage à 375 px puis sur ordinateur, ouverture et fermeture du menu mobile, liens vers les sections, navigation au clavier (Tab, Entrée, Échap dans le menu), lien d’évitement et absence de défilement horizontal.

## Contenu à remplacer

- `data/demo.ts` : nom provisoire et données typées des gîtes fictifs.
- `components/cottage-illustration.tsx` : illustrations vectorielles décoratives locales ; à remplacer par les photos validées.
- `app/page.tsx` : textes éditoriaux et sections.
- `app/globals.css` : couleurs, typographie locale et styles communs.
- `app/layout.tsx` : langue et métadonnées ; indexation désactivée pour la démonstration.

Le cahier des charges `docs/CAHIER_DES_CHARGES.md` est actuellement vide. Les informations commerciales, les règles de séjour et le mode de réservation restent à valider avant toute intégration.

Si Turbopack échoue avec `binding to a port / Operation not permitted` dans un environnement restreint, la compilation peut aussi être vérifiée avec `npm run build -- --webpack`, sans changer la configuration du projet.
