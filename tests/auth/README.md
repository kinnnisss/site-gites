# Validation Auth de phase 3

## Navigation de session — finalisation du 6 novembre

Le test ciblé suivant utilise les cinq comptes fictifs privés et un vrai serveur
`next start` local configuré vers le projet de développement épinglé. Il vérifie
les connexions/refus, les rôles, les cookies, la redirection d’une session active
depuis la connexion et la déconnexion locale. Il ne crée aucun dossier, membre,
compte ou e-mail et ne valide pas le renouvellement après expiration.

```bash
# Branche fix/recette-espace-equipe ; serveur local prêt, module dossiers fermé.
TEAM_TEST_BASE_URL=http://127.0.0.1:3500 node tests/auth/session-navigation-manual.mjs --allow-development-auth
```

Les identifiants sont lus uniquement depuis l’environnement privé. Ne pas mettre
les mots de passe dans une commande, Git ou Vercel. Le test s’arrête au premier
échec et masque les détails susceptibles de contenir des secrets.

## Contrôles historiques sans connexion valide

La phase 5 conserve la matrice et ajoute deux tests du drapeau : 27 tests de
politique/configuration au total. Ils n’établissent aucune session réelle. La
procédure complète de recette distante est dans `docs/ESPACE_EQUIPE_HANDOFF.md`.

```bash
node --test tests/auth/policy.test.mjs
# Avec le build final et un serveur Next local déjà lancé sur 127.0.0.1:3000 :
node tests/auth/http.mjs
```

Le premier script vérifie des fonctions pures de permission/configuration, sans
simuler un fournisseur d’authentification. Le second utilise le véritable
serveur Next avec les SDK installés, sans fournir d’identifiants valides. Il
teste uniquement les accès anonymes, la validation locale, les redirections,
le contrôle d’origine et la fermeture des accès si la configuration est absente.
Il lance aussi le même build sur 127.0.0.1:3002 sans les variables Supabase.

Les tests navigateur utilisent Playwright et Chromium déjà disponibles dans
l’environnement cloud, sans nouvelle dépendance de test. Aucun envoi SMTP,
création/invitation de compte, mutation distante ou migration n’est effectué.
Les requêtes PATCH anonymes échouent avant toute écriture.

Les tests de connexion valide/invalide auprès du fournisseur, de refresh et
d’expiration réels, de déconnexion d’une session réelle et de RLS effectif
restent à réaliser après la configuration manuelle. Voir
`docs/ESPACE_EQUIPE_PHASE_3.md`. Ne pas présenter les résultats locaux comme une
validation de Supabase distant.
