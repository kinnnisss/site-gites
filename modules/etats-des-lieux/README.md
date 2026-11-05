# Module d’état des lieux — formulaire et persistance

Le formulaire React de phase 2 est utilisé par les routes privées de phase 4.
L’accès reste fermé par défaut jusqu’à la recette réelle Auth/RLS de développement.
La référence HTML et le contrat JSON v1 sont conservés. Voir
`docs/ESPACE_EQUIPE_PHASE_4.md` pour le raccordement ;
`docs/ESPACE_EQUIPE_HANDOFF.md` pour l’état actuel, la déclaration d’application
manuelle des migrations en développement et la recette réelle encore à faire.
Les sections suivantes décrivent le portage.

## Raccordement de phase 4

`dossier-editor.tsx` fournit `dossier-storage.ts` à `InspectionForm`. L’UUID, la
révision et l’horodatage restent hors du payload. `persistence.ts` valide le
transport et les reçus ; `state.ts` rétablit l’ordre original des clés après
lecture JSONB. Aucune autosauvegarde ou persistance navigateur.

Le rechargement ne valide sa nouvelle révision qu’après confirmation. Le bouton
Effacer garde l’identité/révision du dossier ; seule la liste administrative
permet sa suppression définitive confirmée. Les boutons d’export et d’impression
revérifient la session. Les messages de stockage sont adaptés dans les emplacements
existants lorsque l’adaptateur est fourni ; le mode sans stockage garde le rendu
original pour le banc de fidélité. Les contrôles applicatifs et RLS sont séparés
des simulations de transport utilisées uniquement dans les tests locaux.

## Référence immuable

- Fichier : `docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html`.
- SHA-256 : `9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0`.
- Conserver ce fichier octet pour octet ; il n’est pas un asset public.

La référence définit les quatre sections, les dix champs, les treize contrôles
de chaque phase, les 23 cases de procédure, les sept règles, les textes,
dimensions, interactions, responsive et styles d’impression. Son logo PNG,
ses couleurs vert/ivoire et ses polices Arial/Georgia sont distincts de la
vitrine. Les styles futurs devront être isolés, y compris des resets Tailwind.

## Composants et contrat

- `inspection-form.tsx` : composant client, orchestration, impression et export.
- `components/` : champs, séjour, contrôles, procédures, règlement et résumé.
- `reference.ts` et `reference-logo.ts` : textes ordonnés et PNG exacts du HTML.
- `inspection.module.css` : CSS de référence local et neutralisation ciblée de
  Tailwind Preflight, y compris les pseudo-éléments natifs des champs date.
- `types.ts` : payload version 1 et interface de stockage optionnelle.
- `state.ts` : état initial, validation de forme, copie et reducer pur.

`initialPayload` initialise le dossier au montage ; pour changer de dossier,
remonter le composant avec une nouvelle `key` ou utiliser le handle typé
`replacePayload`. Le handle `getPayload` et `onPayloadChange` restituent une copie
complète, indépendante de l’état interne. Les dates et le nombre de voyageurs
restent des chaînes ; les brouillons incomplets sont autorisés.

Le portage conserve tous les textes et libellés de référence, y compris les
mentions de maquette et les cinq boutons. Deux adaptations provisoires :

- « Sauvegarder sur cet appareil » affiche « Sauvegarde indisponible : aucun
  stockage n’est connecté. » ; aucun `localStorage` n’est écrit.
- « Recharger le brouillon » affiche « Rechargement indisponible : aucun
  stockage n’est connecté. » ; aucun faux chargement n’est effectué.

L’interface optionnelle `InspectionStorage` prépare les opérations futures.
En phase 4, l’adaptateur Supabase raccordé révise le libellé de
sauvegarde pour décrire le stockage partagé. « Effacer » confirme puis
réinitialise uniquement la mémoire ; aucune suppression persistée n’existe.

Les lignes de signature sont destinées au papier. Les mentions de photos et de
signatures dans le texte historique de la maquette ne constituent pas une
implémentation ou une extension du périmètre. L’impression utilise `window.print`.

## Tests et suite

Voir `tests/etats-des-lieux/README.md` et `docs/ESPACE_EQUIPE_PHASE_2.md`.
Le banc d’essai monte temporairement le composant sur une interface locale liée
à `127.0.0.1`, puis supprime sa route. Il n’est jamais conservé dans `app/` ni
dans le build livré. Aucun écran de démonstration n’est déployé.

Pour les étapes suivantes :

- Préserver le payload JSON version 1, avec entrée et sortie dans un même dossier.
- Garder les signatures papier existantes, sans signature électronique ni photo.
- Conserver l’impression native, sans ajouter de générateur PDF serveur.
- N’ajouter ni dashboard, ni finalisation, ni autosauvegarde ou champ nouveau.
- Limiter les adaptations à l’authentification, au chargement et à la persistance
  sécurisés, ainsi qu’aux messages exacts remplaçant les mentions de démonstration.
- Valider les permissions opérationnelles et la portée d’« Effacer » avant les
  mutations partagées. Le champ responsable reste distinct de l’auteur connecté.

Les futures pages et mutations devront vérifier les autorisations côté serveur.
Le développement et les Preview devront utiliser des ressources distinctes de
la production. Supabase et l’authentification sont absents de cette phase et
attendent une validation distincte.
