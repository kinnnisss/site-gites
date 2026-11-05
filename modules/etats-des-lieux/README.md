# Futur module d’état des lieux

Emplacement réservé à l’intégration fidèle du HTML client. Aucun composant,
formulaire, état métier, stockage ou accès réseau n’est implémenté en phase 1.

## Référence immuable

- Fichier : `docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html`.
- SHA-256 : `9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0`.
- Conserver ce fichier octet pour octet ; il n’est pas un asset public.

La référence définit les quatre sections, les dix champs, les treize contrôles
de chaque phase, les 23 cases de procédure, les sept règles, les textes,
dimensions, interactions, responsive et styles d’impression. Son logo PNG,
ses couleurs vert/ivoire et ses polices Arial/Georgia sont distincts de la
vitrine. Les styles futurs devront être isolés, y compris des resets Tailwind.

## Suite prévue, sans l’implémenter ici

- Séparer les textes de référence, les types, les transitions et les composants.
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
la production. Supabase et l’authentification sont absents de cette phase.
