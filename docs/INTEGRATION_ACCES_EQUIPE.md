# Accès Équipe — intégration du footer et Preview

## État actuel

La nouvelle mission autorise la finalisation du code et l’ajout du lien sans
relancer toute la campagne Cloud. Elle remplace la précédente suspension de
l’intégration. Le propriétaire déclare avoir appliqué manuellement la correction
PT409 ; les fonctions distantes restent à vérifier indépendamment.

Le footer comporte désormais « Vous gérez le domaine ? » et
« Accès à l'Espace Équipe », via next/link vers /equipe/connexion, dans la partie
basse existante. Palette, typographies, liens publics, navigation principale et
Hero sont conservés. La zone se replie sur téléphone et reprend hover/focus.

La page de connexion vérifie une session existante avec requireTeamMember :
identité Supabase, fiche active et permissions serveur. Un membre autorisé est
redirigé vers /equipe. Aucun rôle navigateur ou paramètre d’URL ne donne accès.
Le même formulaire reste utilisé pour Admin et Agent ; aucune inscription publique.

Le formulaire d’état des lieux et la référence HTML ne changent pas. La nouvelle
règle CSS est limitée au footer public ; elle ne s’applique pas à l’Espace Équipe.
Aucune dépendance, fonction SQL distante, politique, permission ou compte modifié.

## Vérification et recette

Le rapport [FINALISATION_ESPACE_EQUIPE.md](FINALISATION_ESPACE_EQUIPE.md) décrit les
fichiers, preuves, limites d’accès et réglages Preview. Le
[rapport de recette](ESPACE_EQUIPE_RECETTE_FINALE.md) sépare les tests réellement
réussis des scénarios Cloud encore non validés.

La comparaison publique accepte uniquement la nouvelle zone
.site-footer .footer-team-access : elle conserve les captures réelles, retire ce
seul ajout pour la comparaison stricte avec main, puis contrôle le focus clavier,
le contraste et la navigation vers la connexion sur la vraie page.

Avant de mettre TEAM_INSPECTIONS_ENABLED=true dans la seule Preview de recette,
utiliser [verify-inspection-pt409.sql](../supabase/manual/verify-inspection-pt409.sql)
en lecture seule dans le SQL Editor du projet jijjjgsfdbrkvqvhyjwr. Ne pas rejouer
la migration déclarée appliquée. Les trois corps attendus doivent être conformes,
avec PT409 présent et 40001 absent des branches métier. Une divergence exige une
inspection ; le script ne modifie rien.

Les tests manuels réels (dossiers synthétiques uniquement) sont dans
[GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md](GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md).
Une connexion réussie ou un test local ne valide pas les conflits PostgREST Cloud,
la conservation réelle des dossiers ou le renouvellement après expiration.

## Publication

Le code reste uniquement sur fix/recette-espace-equipe, avec PR en brouillon tant
que les tests personnels et les conditions de production ne sont pas validés.
Aucun paramètre ou déploiement Vercel Production effectué. La Preview doit utiliser
les seules variables de développement, limitées à cette branche, sans mots de
passe de recette ni clé privilégiée.

Le verrou VERCEL_ENV=production et le drapeau fermé par défaut sont conservés.
Le lien ne doit pas être fusionné/publié sur la vitrine de production avant un
accès Auth de production utilisable et validé, une base distincte et les autres
prérequis du handoff. Préparer séparément l’évolution du verrou et l’ouverture
officielle, sous autorisation explicite. Ne jamais utiliser la base de
développement pour les données de voyageurs.
