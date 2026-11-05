# Emplacement de l’Espace Équipe

Cette phase réserve le segment `/equipe` et son layout neutre, sans créer de
`page.tsx`, de Route Handler ou de Server Action. Les URL d’équipe restent donc
indisponibles (404) ; aucun formulaire ni dossier n’est servi.

Le layout ne reprend ni le cadre ni les styles de la vitrine. Ses métadonnées
`noindex` ne constituent pas une protection d’accès.

Avant de servir des données réelles, mettre en place Supabase Auth, le contrôle
serveur d’un membre actif, les permissions et les politiques RLS. Un contrôle
dans un layout ou un Proxy seul ne suffit pas. Aucune inscription publique.

Les comptes auront deux rôles : administrateur et agent. Tous les membres
autorisés et actifs pourront consulter tous les dossiers ; les permissions de
mutation et la portée du bouton « Effacer » restent à valider.
