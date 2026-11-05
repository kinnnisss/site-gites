# Espace Équipe — phase 3 : Auth et autorisations

## État et limites

Départ : `efd2f4ce8f53a5ed759f40cbe53bc908f903e84a`, branche
`feature/espace-equipe`. Aucun formulaire, CSS, texte ou test de phase 2 n’est
modifié. Le formulaire reste non monté tant que la connexion et les autorisations
réelles n’ont pas été validées sur le projet de développement.

Les variables `NEXT_PUBLIC_SUPABASE_URL` et
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sont présentes et déclarées prêtes par
Codex Cloud. Leur forme est valide. Le contrôle de santé en lecture seule échoue
avec un refus HTTP 403 du tunnel du proxy. Aucun test de connexion réelle, envoi
SMTP, invitation, création de compte ou migration distante n’a été exécuté.

Aucun projet Supabase n’a été créé. Les SQL fournis sont à examiner et exécuter
manuellement après vérification du projet ciblé. Aucune table de dossier n’est
créée en phase 3.

## SDK et sources officielles consultées

- `@supabase/supabase-js` **2.119.0** (Node.js >= 22).
- `@supabase/ssr` **0.12.7**, `createServerClient`, cookies `getAll`/`setAll`.
- README et types/source du SDK installé ; dépôt officiel
  <https://github.com/supabase/ssr>.
- Guides officiels SSR : <https://supabase.com/docs/guides/auth/server-side>.
- Documentation Next.js 16.3.6 installée : authentification, Proxy, cookies,
  Server Actions et contrôles proches des données.

Les versions sont verrouillées. Aucun ancien paquet auth-helpers n’est utilisé.
Les installations utilisent un cache npm inscriptible dans l’environnement
cloud (`npm_config_cache=/workspace/.cache/npm`).

## Variables, sans valeurs réelles

Le fichier `.env.example` contient uniquement des placeholders fictifs.

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS du projet Supabase Cloud de développement |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé **publishable**, jamais une clé secrète/service_role |
| `TEAM_APP_ORIGIN` | Origine de confiance côté serveur, nécessaire pour activer la récupération ; localhost en développement, Preview de développement en HTTPS |

Les deux premières sont injectées dans la machine actuelle. La troisième n’y
est pas configurée ; le parcours de demande de récupération reste désactivé.
Aucune clé service_role, clé secrète Supabase, connexion PostgreSQL ou variable
SMTP n’est nécessaire à l’application de cette phase. SMTP se configure dans
Supabase, pas dans le code. Aucun secret ne doit être entré dans Git ou le chat.

Le code refuse une configuration absente/invalide et les clés secrètes placées
par erreur dans la variable publique. Il n’existe aucun accès permissif de repli.

## Sessions et accès serveur

- `/equipe/connexion` : e-mail/mot de passe via une Server Action et Supabase Auth.
  Aucun formulaire d’inscription. Destination après connexion fixe : `/equipe`.
- Client Supabase neuf par requête, sans singleton ni cache partagé de session.
- Cookies limités à `/equipe`, HttpOnly, SameSite=Lax et Secure en production HTTPS.
  Le SDK gère le découpage, le renouvellement et la rotation selon Supabase.
- `proxy.ts` ne s’exécute que sous `/equipe`. Il renouvelle les sessions et
  transmet les cookies mis à jour à la requête et à la réponse ; il ne décide
  jamais à lui seul des autorisations.
- `auth.getUser()` vérifie l’identité auprès d’Auth. Aucun `getSession()` ou rôle
  fourni par le navigateur n’est considéré comme preuve d’autorisation.
- Chaque page privée et chaque opération protégée appelle le contrôle serveur.
  Le rôle et `active` sont relus dans `team_members` pour l’identité vérifiée.
  Une désactivation est donc prise en compte à la requête suivante, sans attendre
  l’expiration du JWT. Les données `user_metadata` ne donnent aucun privilège.
- Pages Auth dynamiques et réponses privées non stockables (`private, no-store`).
  Les pages publiques ne lisent pas la session et conservent leur rendu statique.
- Déconnexion locale : révocation Auth demandée pour cette session, puis
  suppression des cookies de ce navigateur même si Auth est indisponible.
  Une révocation distante ne peut pas être garantie pendant une panne réseau.
- Erreurs génériques : ni jeton, ni mot de passe, ni corps d’erreur fournisseur
  ne sont exposés. Les mutations de formulaire bénéficient du contrôle d’origine
  de Next.js ; l’API PATCH impose aussi une origine identique et un petit JSON.

`/equipe` est uniquement un écran d’accès vérifié avec déconnexion, sans tableau
statistique. `/equipe/api/session` renvoie le minimum sur le membre connecté.
L’API `PATCH /equipe/api/membres/[id]` permet à un administrateur actif de modifier
le rôle/statut d’un membre existant, avec une seconde protection RLS. Elle ne
crée pas d’utilisateur Auth et n’envoie pas d’invitation. La gestion des comptes
reste séparée du formulaire. Il n’existe pas de route de dossier/formulaire.

## Matrice préparée pour la phase 4

Tous les membres actifs : consulter, créer, modifier, sauvegarder et exporter
les dossiers. Administrateurs actifs uniquement : gérer l’équipe et supprimer
un dossier définitivement. Ces permissions sont définies côté serveur ; les
opérations/tables de dossiers et leurs RLS seront réalisées en phase 4.

## SQL à examiner

1. `supabase/migrations/20261105000100_team_members.sql` : table avec FK vers
   `auth.users`, enum admin/agent, compte inactif par défaut, RLS activée.
2. Lecture de sa propre fiche pour les membres actifs ; lecture globale des
   fiches réservée aux admins actifs. Un membre inactif ne lit aucune fiche.
   Cela ne limite pas la future lecture de tous les dossiers par tous les actifs.
3. Insert/update de membres réservés aux administrateurs actifs. Aucun droit
   DELETE ni trigger d’auto-inscription. Identifiant et date de création non
   modifiables via les droits accordés. Un admin ne peut pas se désactiver ou
   se rétrograder lui-même via cette politique.
4. Fonction SECURITY DEFINER sans paramètre d’identité, dans le schéma non
   exposé `team_private`, search_path vide et droits EXECUTE restreints. Elle évite
   la récursion RLS et ne fait que vérifier l’admin courant.
5. `supabase/manual/bootstrap-admin.sql` : script SQL Editor, rôle postgres,
   UUID à remplacer, utilisateur déjà confirmé obligatoire, refus si un admin
   actif existe déjà, verrou transactionnel. Aucune fonction de bootstrap
   callable depuis l’application n’est publiée.

Ne pas appliquer cette migration sur une table existante sans examiner le
schéma. Elle est transactionnelle, pas un script de remplacement automatique.
Ne pas exposer le schéma `team_private` dans les schémas de la Data API.

## Récupération de mot de passe

Le code prépare un parcours réel, sans envoi de mail pendant les tests :

1. `/equipe/recuperation` n’active la demande que si `TEAM_APP_ORIGIN` est valide.
2. Le serveur demande `resetPasswordForEmail` avec une URL de retour fixe issue
   de cette origine. La réponse reste identique pour une adresse connue ou non.
3. Le modèle d’e-mail doit utiliser le hash de token décrit ci-dessous.
4. `/equipe/confirmation` n’accepte que le type `recovery`. Supabase vérifie le
   token à usage unique, puis le contrôle serveur vérifie le membre actif.
   Les paramètres `next`/`returnTo` ne sont jamais suivis.
5. `/equipe/mot-de-passe` et son action exigent à nouveau une session vérifiée et
   un membre actif. Le mot de passe est modifié pour cet utilisateur seulement,
   puis la session locale est fermée. La politique Supabase peut être plus stricte.

Les liens invalides/expirés échouent sans afficher leur token. Aucun SMTP, compte
ou accès de secours n’est inventé. Un compte désactivé ne récupère pas l’accès
Équipe au moyen de ce parcours.

## Opérations manuelles — Codex et Supabase de développement uniquement

### Connectivité Codex

Dans les paramètres réseau de l’environnement, autoriser **le seul hostname du
projet indiqué par `NEXT_PUBLIC_SUPABASE_URL`**, sans schéma ni chemin. Le preset
actuel des gestionnaires de paquets ne l’inclut pas. Ne pas élargir à tous les
projets Supabase. Après propagation, contrôle en lecture seule :

```bash
NODE_USE_ENV_PROXY=1 node scripts/check-supabase-readiness.mjs
```

Node.js 22.23.4 connaît ce mode proxy (encore signalé expérimental par Node).
Conserver le proxy et le certificat CA injectés ; ne pas désactiver TLS. Le
script ne se connecte à aucun compte, ne crée rien et n’envoie aucun e-mail.
Pour lancer ensuite l’application dans ce même environnement derrière proxy :

```bash
NODE_USE_ENV_PROXY=1 npm run dev
```

Ce réglage de transport n’est pas nécessaire sur une machine sans proxy.

### Configuration Supabase

1. Ouvrir le projet **de développement** dans le dashboard. Comparer son Project
   Reference et son URL avec ceux de la variable configurée. Ne pas sélectionner
   le projet utilisé par la production Vercel.
2. Examiner le schéma existant, puis exécuter la migration SQL depuis SQL Editor,
   en tant qu’administrateur SQL de ce projet. Vérifier table, enum, grants, RLS
   et absence d’exposition du schéma `team_private`.
3. Dans Authentication > Sign In / Providers, activer Email/Password et
   **désactiver Allow new users to sign up**, ainsi que les connexions anonymes
   si elles sont activées. L’absence de page signup dans le code
   ne change pas ce réglage distant ; son état actuel n’a pas pu être lu.
4. Créer manuellement un utilisateur Auth de test contrôlé, avec mot de passe
   fort et adresse confirmée. Utiliser la création manuelle, sans invitation
   réelle. Copier son UUID, sans inscrire ses identifiants dans Git.
5. Dans une copie locale/non committée de `bootstrap-admin.sql`, remplacer le
   UUID nul par cet UUID vérifié et exécuter le script dans le même SQL Editor.
   Vérifier qu’une fiche admin active existe et qu’une seconde exécution échoue.
6. Créer ensuite les utilisateurs de test nécessaires dans Auth. Ajouter leur
   fiche autorisée sous le contrôle de l’admin : `role='agent'`, `active=true`
   pour l’agent ; `active=false` pour le cas inactif. Ne créer aucun voyageur.
7. Configurer Authentication > URL Configuration : Site URL de développement et
   URLs de retour exactes pour `/equipe/confirmation`. N’ajouter que localhost
   et/ou une Preview dédiée au développement ; aucun domaine de production ni
   wildcard global sur toutes les Preview Vercel.
8. Pour activer la récupération, choisir/configurer les moyens d’envoi approuvés
   dans Supabase (SMTP et destinataires de test selon les limites du fournisseur).
   Aucun SMTP n’est configuré par ce code. Définir aussi `TEAM_APP_ORIGIN` dans
   l’environnement de développement, avec la même origine de confiance.
9. Adapter le modèle **Reset password** avec ce lien. La Site URL doit être
   exactement l’origine de développement choisie dans `TEAM_APP_ORIGIN` :

   ```html
   <a href="{{ .SiteURL }}/equipe/confirmation?token_hash={{ .TokenHash }}&type=recovery">Réinitialiser le mot de passe</a>
   ```

   Ce chemin fixe évite de concaténer un second `?` à un RedirectTo auquel le
   SDK pourrait ajouter un identifiant de flux PKCE. Si l’on passe de localhost
   à une Preview, aligner aussi la Site URL et `TEAM_APP_ORIGIN` sur cette origine.

10. Tester manuellement la matrice ci-dessous. Désactiver un membre via
    `team_members.active=false`, même si l’on désactive aussi son compte dans
    Auth : c’est cette métadonnée qui ferme l’accès applicatif et les permissions.

Ces actions sont à faire par l’utilisateur ; aucun SQL, invitation ou réglage
Supabase n’a été exécuté automatiquement. La configuration Vercel Production
n’est pas modifiée.

## Tests exécutés localement

- ESLint, TypeScript et build Turbopack : réussis avec Node.js 22.23.4.
- 25 tests unitaires : matrice de permissions admin/agent, révocation, refus des
  identités absentes/incohérentes, configuration absente ou clé privilégiée,
  origine de récupération et contrôle d’origine API. Ce sont des décisions de
  politique testées, pas des connexions Supabase réussies.
- 25 vérifications HTTP/navigateur sur le vrai serveur Next local, avec les
  variables disponibles puis sans configuration : redirections privées,
  session anonyme refusée, faux champs de rôle ignorés, PATCH anonyme refusé,
  origine tierce refusée, callback invalide sans redirection externe, absence
  d’inscription/formulaire et récupération désactivée sans origine configurée.
- Validation locale d’identifiants au format invalide avant tout appel Auth.
  Aucun identifiant réel n’a été envoyé et aucun compte n’a été simulé.
- Tests de fidélité de phase 2 inchangés : 46 comparaisons pixel par pixel et
  parcours fonctionnels toujours réussis ; aucune route temporaire conservée.
- Trois pages publiques : HTTP 200, contenus/métadonnées/liens identiques, six
  paires de captures à 375 et 1440 px identiques pixel par pixel avant/après.
- Les valeurs de configuration Supabase ne figurent pas dans les bundles
  navigateur. Aucun secret serveur n’est ajouté aux variables ni au code.
- Le contrôle réel en lecture seule vers Supabase échoue au proxy (403).

## Recette réelle encore nécessaire

Les tests unitaires des décisions de permission sont des tests de fonctions
pures, pas une simulation d’authentification utilisable dans l’application.
Aucun serveur Auth factice, compte partagé ou URL d’accès cachée n’existe.

À tester après les opérations manuelles, sur des comptes de développement :

- E-mail/mot de passe correct et incorrect auprès de Supabase Auth.
- Agent et admin actifs autorisés ; absence de membre et membre inactif refusés.
- Désactivation alors qu’un navigateur détient déjà une session.
- Expiration/renouvellement réels des access/refresh tokens, requêtes concurrentes,
  déconnexion et refus de réutilisation de l’ancienne session.
- Agent tentant une mutation de rôle par API **et directement par Data API** :
  refus RLS ; admin autorisé, sans modification de sa propre activité/rôle.
- Récupération réelle : délivrance, usage unique, expiration, nouveau mot de passe
  et absence de redirection externe. Vérifier la politique de mot de passe choisie.

Aucun résultat local ne doit être présenté comme une validation distante de ces
points. Le formulaire reste non monté jusqu’à cette validation ; la persistance
et les tables d’états des lieux restent hors périmètre.

## Fichiers créés ou modifiés

| État | Fichier |
| --- | --- |
| Créé | `.env.example` |
| Modifié | `README.md` |
| Créé | `app/equipe/(auth)/connexion/page.tsx` |
| Créé | `app/equipe/(auth)/recuperation/page.tsx` |
| Créé | `app/equipe/(prive)/layout.tsx` |
| Créé | `app/equipe/(prive)/mot-de-passe/page.tsx` |
| Créé | `app/equipe/(prive)/page.tsx` |
| Modifié | `app/equipe/README.md` |
| Créé | `app/equipe/api/membres/[id]/route.ts` |
| Créé | `app/equipe/api/session/route.ts` |
| Créé | `app/equipe/auth-form.tsx` |
| Créé | `app/equipe/confirmation/route.ts` |
| Modifié | `app/equipe/layout.tsx` |
| Créé | `app/equipe/team.module.css` |
| Créé | `docs/ESPACE_EQUIPE_PHASE_3.md` |
| Créé | `lib/auth/actions.ts` |
| Créé | `lib/auth/authorization.ts` |
| Créé | `lib/auth/policy.ts` |
| Créé | `lib/auth/request-origin.ts` |
| Créé | `lib/supabase/config.ts` |
| Créé | `lib/supabase/database.types.ts` |
| Créé | `lib/supabase/server.ts` |
| Modifié | `package-lock.json` |
| Modifié | `package.json` |
| Créé | `proxy.ts` |
| Créé | `scripts/check-supabase-readiness.mjs` |
| Créé | `supabase/manual/bootstrap-admin.sql` |
| Créé | `supabase/migrations/20261105000100_team_members.sql` |
| Créé | `tests/auth/README.md` |
| Créé | `tests/auth/http.mjs` |
| Créé | `tests/auth/policy.test.mjs` |
