# Tester l’Espace Équipe dans la Preview

## Avant de commencer

Utiliser exclusivement la Preview de `fix/recette-espace-equipe` et les comptes
fictifs du projet **`domaine-lo-carmalhon-dev` / `jijjjgsfdbrkvqvhyjwr`**.
Ne jamais utiliser l’Administrateur principal ou des informations de voyageurs.
Les identifiants restent saisis en privé, sans apparaître dans une URL ou une capture.

La Preview n’a pas été créée ni vérifiée depuis Codex : suivre la configuration
dans [FINALISATION_ESPACE_EQUIPE.md](FINALISATION_ESPACE_EQUIPE.md). La déclaration
d’application manuelle PT409 doit encore être vérifiée. Ne pas activer les
dossiers tant que ce contrôle et les protections d’accès ne sont pas confirmés.

Dans le SQL Editor du seul projet de développement, exécuter
[verify-inspection-pt409.sql](../supabase/manual/verify-inspection-pt409.sql),
en lecture seule. Pour les trois fonctions, attendre `function_exists=true`,
`body_matches_versioned_pt409=true`, `has_pt409=true`, `has_legacy_40001=false`
et `security_definer=false`. Un corps différent demande une comparaison avec
le fichier versionné, pas une réapplication automatique. Le script expose aussi
l’état RLS courant ; il ne prouve pas à lui seul l’absence de changement depuis
un état antérieur non enregistré. Ne rejouer aucune migration.

Une fois ces prérequis validés, activer le module dans la seule Preview et ouvrir
deux profils de navigateur distincts A et B, plus un profil Admin fictif pour le
nettoyage. Donner au dossier une référence unique, par exemple
`RECETTE-MANUELLE-AAAA-MM-JJ-HEURE`, et noter son UUID depuis son URL. Toutes les
opérations ci-dessous doivent rester limitées à ce dossier synthétique.

## Parcours et résultats attendus

| Étape | Action | Résultat attendu |
| --- | --- | --- |
| 1. Footer | Sur l’accueil, les mentions légales et la confidentialité, descendre au footer, puis atteindre le lien au clavier et l’ouvrir. Tester téléphone et ordinateur. | « Vous gérez le domaine ? » et « Accès à l'Espace Équipe » sont lisibles, sans débordement. Focus visible ; destination exacte `/equipe/connexion`. |
| 2. Admin fictif | Se connecter avec le compte de test Administrateur. | Accès à `/equipe`, rôle administrateur vérifié côté serveur. Aucun formulaire d’inscription. |
| 3. Agent | Dans un autre profil, connecter Agent A puis Agent B séparément. Revenir à la connexion avec une session active. | Rôle agent sur `/equipe`. Le retour à `/equipe/connexion` redirige vers `/equipe` sans redemander le mot de passe. |
| 4. Nouveau dossier | Agent A ouvre « Ouvrir les états des lieux », puis « Nouveau dossier ». Saisir uniquement des valeurs fictives, dont des accents, retours à la ligne et des champs vides. | Les quatre sections, dix champs, contrôles et libellés sont conservés. Aucune sauvegarde automatique à la saisie. |
| 5. Sauvegarde | Compléter des contrôles d’entrée et de sortie, checklists, règlement ; cliquer une fois sur « Sauvegarder le brouillon ». | Attendre le message de réussite avec révision 1, pas seulement la fin de l’animation. L’URL contient l’UUID du dossier. Un double clic ne crée pas de doublon. |
| 6. Rechargement | Modifier une valeur sans enregistrer, cliquer « Recharger le brouillon » et annuler ; recommencer puis accepter. Ouvrir aussi l’URL dans une nouvelle session autorisée. | Annuler conserve les saisies. Accepter retrouve exactement la version enregistrée, y compris l’onglet masqué, dates locales et chaînes vides. |
| 7. Autre agent | B retrouve la même référence, ouvre le dossier, modifie une observation et enregistre. Garder A ouvert sur sa révision 1. | La sauvegarde B réussit en révision 2 ; les deux agents consultent le même dossier. |
| 8. Conflit | A modifie son ancienne version et enregistre. Dans DevTools > Network, regarder uniquement le statut du PATCH, sans partager ses en-têtes ni son corps. | HTTP **409** reçu rapidement ; message de conflit exploitable, aucune attente jusqu’au timeout. Les saisies A restent à l’écran. Une nouvelle session retrouve le contenu B intact, en révision 2. |
| 8 bis. Reprise | Exporter si nécessaire les saisies A ; annuler un rechargement puis tenter de sauvegarder à nouveau ; enfin accepter le rechargement. | Après annulation, le conflit reste refusé. Après acceptation, A retrouve B ; une nouvelle modification explicite peut être sauvegardée à la révision suivante. Aucun écrasement forcé. |
| 9. Effacer | Annuler Effacer, puis confirmer. Vérifier le dossier dans B avant toute nouvelle sauvegarde explicite. | Annuler ne change rien ; confirmer vide uniquement la mémoire du formulaire A. Aucun POST/PATCH/DELETE, aucun dossier supprimé, données enregistrées toujours présentes dans B. |
| 10. Impression | Recharger la version enregistrée, puis imprimer depuis chaque onglet. Utiliser l’aperçu navigateur ou un PDF local. | Entrée et sortie, règles, observations et signatures papier apparaissent ; boutons/onglets masqués ; responsive et mise en page fidèles au HTML. Ne pas confondre aperçu et validation d’une imprimante physique. |
| 11. JSON | Exporter depuis le formulaire restauré, puis ouvrir le fichier local. | Nom `etat-des-lieux-domaine-lo-carmalhon.json`, version 1, dix champs chaînes, contrôles 13/13, procédures 8/7/8, booléens et accents conservés ; pas d’UUID/auteur/révision ajouté au JSON métier. |
| 12. Suppression | Avec l’Admin fictif, retrouver ce seul UUID dans la liste. Annuler, vérifier la présence, puis confirmer la suppression. | Annuler conserve le dossier ; confirmer le supprime. Le bouton de suppression n’existe pas pour les agents. Effacer n’effectue jamais cette opération. |
| 13. Refus | En contextes neufs, essayer anonyme, compte inactif et compte sans fiche. Tenter les URL privées directement. | Anonyme renvoyé vers la connexion ; inactif/sans fiche refusés ; aucune donnée de dossier servie. L’API de session renvoie 401 après refus/déconnexion. Aucun rôle d’URL ou de navigateur ne donne accès. |
| 14. Déconnexion | Déconnecter chaque profil de test et revenir sur une URL privée. | Retour à la connexion, nouvelle opération privée refusée. Les cookies de cette session sont supprimés ; aucune autre session de l’Administrateur principal ne doit être touchée. |

Le code SQLSTATE **PT409** se vérifie dans la réponse directe PostgREST ou le
contrôle SQL ; l’API Next renvoie volontairement un message contrôlé avec le
statut HTTP 409, sans exposer le corps d’erreur du fournisseur.

## Contrôles complémentaires indispensables

- Concurrence : ouvrir la même révision dans A et B, saisir des valeurs distinctes
  et enregistrer simultanément. Attendre un seul succès et un conflit 409 ; relire
  le payload gagnant complet. Consigner les heures et durées, sans JWT ou cookies.
- Session : vérifier les cookies dans DevTools, uniquement leurs attributs :
  HttpOnly, Secure en HTTPS, SameSite=Lax, chemin `/equipe`. Attendre une expiration
  réelle, vérifier le renouvellement via Next et l’absence de boucle. Ce contrôle
  ne se déduit pas d’une connexion courte réussie.
- Nettoyage : après suppression du seul UUID synthétique, chercher sa référence
  et rouvrir son URL immédiatement, à +5 s et +30 s ; il doit rester absent.
  Vérifier depuis une session Admin fictif encore active, puis la déconnecter.
- Noter pour chaque cas le commit Preview, l’heure UTC, le profil, le résultat et
  une preuve nettoyée. Une erreur sans statut HTTP est une erreur de transport,
  jamais un conflit réussi. Arrêter la campagne à toute anomalie de conservation.

Le changement de rôle/statut, la création de compte, les e-mails de récupération,
le changement de mot de passe, les migrations et la production restent hors de
ce guide d’exécution. Ils demandent des opérations distinctes explicitement
autorisées. Ne pas modifier les réglages pour faire artificiellement réussir un test.
