# Accès Équipe — blocage et conditions de reprise

## État au 6 novembre 2026

**Aucun lien ajouté au footer.** La recette Cloud des conflits et les parcours
Next.js avec stockage réel doivent réussir avant de commencer cette intégration.
Le propriétaire confirme que la migration PT409 préparée n’est pas encore
appliquée. Les connexions des cinq comptes fictifs, leurs rôles, les refus de
lecture anonymes et l’absence des trois anciens UUID synthétiques sont revérifiés ;
ils ne suffisent pas à valider la recette complète.

Le [rapport final](ESPACE_EQUIPE_RECETTE_FINALE.md) contient les résultats, durées,
preuves et limites. Le [diagnostic PostgREST 14.18](ANALYSE_JOURNAUX_POSTGREST_14_18.md)
explique les réessais SQL et l’absence de réponse HTTP avant timeout.

## Action manuelle préalable sur Supabase de développement

1. Dans le SQL Editor du seul projet **`jijjjgsfdbrkvqvhyjwr`**, examiner les
   définitions existantes avec
   [phase5-conflict-diagnostic.sql](../supabase/manual/phase5-conflict-diagnostic.sql),
   strictement en lecture seule. Comparer les trois fonctions avec leurs versions
   historiques ; interrompre si des modifications distantes non expliquées existent.
   Ne pas transmettre d’en-têtes, de jetons ni de requêtes SQL contenant des secrets.
2. Après décision explicite du propriétaire, appliquer uniquement
   [20261106000100_inspection_business_conflicts.sql](../supabase/migrations/20261106000100_inspection_business_conflicts.sql).
   SHA-256 : `3d83a18f828c2785ab871ae323d1552b9384e03b88cc9352ea70fd1bda008af8`.
   Cette nouvelle migration remplace les trois codes métier `40001` par `PT409`,
   sans changer les conditions atomiques de révision, les données, ACL ou RLS.
   Ne pas modifier les migrations déjà appliquées, rejouer leur contenu, lancer
   `supabase db push`, créer un compte ou fournir une clé privilégiée à l’agent.
3. Relire les définitions et consigner l’application de cette seule migration.
   Confirmer son application dans le chat pour reprendre les écritures synthétiques
   déjà autorisées. Aucun réglage Vercel n’est nécessaire pour cette opération.

L’agent n’a exécuté aucune migration distante. La présence du fichier dans Git
ou un résultat PostgreSQL local ne prouve pas son application Cloud.

## Ordre des validations avant le footer

1. Depuis `fix/recette-espace-equipe`, vérifier à nouveau la cible privée de
   développement puis lancer sous Node 22 :

   ```bash
   NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/conflict-cloud.mjs --allow-development-writes
   ```

   Utiliser le mode normal qui attend **PT409**, sans `--legacy-40001`. Le test
   crée un seul UUID synthétique journalisé, sauvegarde A puis B, vérifie le
   conflit obsolète par SDK et cURL, le payload B complet, la création répétée,
   la concurrence (un succès, un conflit) et le payload gagnant. Nettoyage limité
   à cet UUID par l’Admin fictif puis lectures d’absence immédiate, à +5 et +30 s.
   Conserver durées, HTTP et SQLSTATE ; un timeout sans HTTP reste un échec de
   transport. Arrêter au premier blocage, sans relance en boucle.
2. Après réussite des conflits, exécuter :

   ```bash
   NODE_USE_ENV_PROXY=1 node tests/etats-des-lieux/supabase-manual.mjs --allow-development-writes
   ```

   Vérifier les vrais JWT/RLS des cinq comptes : lecture partagée, auteurs,
   payload exact, refus anonymes/inactifs/sans fiche, suppression Agent refusée,
   DELETE brut sans effet et suppression Admin confirmée. Le script ne modifie
   aucun compte ou rôle. Conserver le reçu et la preuve de nettoyage de son UUID.
3. Seulement après validation Auth/RLS, activer temporairement le module dans
   un serveur Next local isolé, sans falsifier `VERCEL_ENV`. Avec des contextes
   navigateur distincts, vérifier création, lecture/modification inter-agents,
   conflit HTTP 409 et conservation des saisies, rechargement annulé/accepté,
   double clic, export JSON, impression, Effacer sans écriture et suppression
   administrative confirmée. Mesurer les réponses réelles et nettoyer uniquement
   les UUID synthétiques créés par ces tests.
4. Vérifier aussi les cinq parcours de connexion et refus via Next, la déconnexion,
   les cookies `/equipe` HttpOnly/SameSite/Secure selon le contexte, et le
   renouvellement réel de session. Distinguer le refresh SDK du renouvellement
   et de la transmission des cookies par Next. Pas de récupération par e-mail
   ni modification de compte pour contourner ces vérifications. Les tests de
   gestion/désactivation d’un membre demandent une autorisation distincte.
5. Corriger seulement les erreurs démontrées et rejouer les contrôles affectés :
   lint, typegen, TypeScript, build, PostgreSQL/PostgREST locaux, HTTP, fidélité du
   formulaire et non-régression publique. Documenter les tests non exécutés.

## Intégration future, uniquement après réussite documentée

Dans `components/site-footer.tsx`, conserver la structure et ajouter une zone
discrète près des informations, avec la palette et le style de liens existants :

- « Vous gérez le domaine ? »
- « Accès à l'Espace Équipe », via `next/link` vers `/equipe/connexion`.
- Facultatif : « Accès réservé au personnel autorisé. »

Vérifier ordinateur/mobile, absence de débordement, clavier, focus, hover,
contraste et destination exacte. Comparer les trois pages publiques avec `main`
en identifiant le seul changement intentionnel du footer. Conserver exactement
le formulaire et son rendu d’impression. Vérifier le parcours d’une session déjà
valide et adapter la connexion seulement si nécessaire, en réutilisant les
contrôles serveur de membre actif ; un rôle fourni par le navigateur ne suffit pas.

Cette section décrit des travaux futurs : aucun JSX, CSS, page de connexion ou
layout n’est modifié dans cette reprise bloquée.

## Conditions indépendantes avant production

Garder les changements sur `fix/recette-espace-equipe`, non fusionnés. Le lien
ne doit pas être publié tant que l’accès Auth de production n’est pas utilisable
et validé. Préparer séparément, sous autorisation du propriétaire : projet
Supabase de production distinct, migrations revues, premier administrateur,
origine HTTPS et URLs Auth exactes, cookies/cache, récupération/SMTP, sauvegardes,
politique de conservation et validation client. La base de développement reste
réservée aux données synthétiques.

Le verrou `VERCEL_ENV=production` et le drapeau fermé sont conservés. Leur
évolution et l’ouverture officielle nécessitent une modification distincte revue
et autorisée. Publier le lien en même temps que l’accès officiellement validé,
avec une procédure de retour arrière ; une PR ou un build réussi n’autorise
ni fusion, ni activation, ni déploiement.
