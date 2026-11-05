# Domaine Lo Carmalhon — document de reprise

## 1. État et références

État au **5 novembre 2026** : code préparé pour la recette finale, module fermé,
aucune autorisation de production donnée. Les validations réelles seront faites
par le propriétaire. Ce document permet de les réaliser sans nouvelle intervention
de Codex ; il ne vaut pas autorisation d’écrire dans un service distant.

| Phase | Livraison | État et preuve |
| --- | --- | --- |
| 1 | Séparation vitrine/Équipe, HTML conservé | Réalisée ; `76ef6831854e49bcf6e3922289e5130a0bae3a5f` ; rapport de phase 1 |
| 2 | Formulaire React fidèle et JSON v1 | Réalisée ; commit `efd2f4ce8f53a5ed759f40cbe53bc908f903e84a` ; comparaisons locales exactes |
| 3 | Auth, cookies, membres actifs, rôles et RLS de membres | Code réalisé ; `ca9f386771dd54247604f6ba1291eb58ba906722` ; recette Auth réelle en attente |
| 4 | Persistance, révision atomique, dossiers et suppression admin | Code réalisé ; `1646189a0e8b1427337221728158950e10b0a602` ; recette distante en attente |
| 5 | Audit, correctifs de dépendances, tests complémentaires et procédures | Ce commit de livraison ; voir `git log -1` et `ESPACE_EQUIPE_PHASE_5.md` |

Dépôt : `kinnnisss/site-gites`. Développement : `feature/espace-equipe`.
Production : `main`, référence relevée au début de phase 5 :
`bfc7a5a7161b5a61312c9da2f3075ed129b4bac8`. La phase 5 ne la modifie pas.
La production Vercel et sa configuration n’ont pas été consultées ni modifiées.
Les documents officiels des fournisseurs ont été consultés, sans accès au projet.

Le propriétaire indique que les deux migrations ont été appliquées et contrôlées
manuellement sur **Supabase de développement**. Ne pas les rejouer dans cette base :

1. `supabase/migrations/20261105000100_team_members.sql`.
2. `supabase/migrations/20261105000200_inspection_dossiers.sql`.

Cette déclaration n’est pas une preuve de connexion/RLS avec un JWT utilisateur.
Une application manuelle dans SQL Editor ne renseigne pas nécessairement
l’historique du CLI Supabase. Établir le registre des fichiers/SHA appliqués avant
toute utilisation future du CLI ; ne pas lancer `supabase db push` à l’aveugle.
Aucune migration nouvelle n’est créée par la phase 5.

## 2. Architecture et décisions conservées

| Élément | Emplacement et rôle |
| --- | --- |
| Vitrine | `app/(public)` ; styles, composants et données publics indépendants |
| Connexion/récupération | `app/equipe/(auth)`, `confirmation`, actions dans `lib/auth/actions.ts` |
| Autorisation | `lib/auth/authorization.ts`, `policy.ts` ; Auth vérifié puis rôle actif relu |
| Session | `proxy.ts` renouvelle ; `lib/supabase/server.ts` crée un client par requête |
| Accès dossiers | `lib/inspections/server.ts` ; drapeau et contrôle de membre avant chaque opération |
| API | `app/equipe/api/etats-des-lieux`, `api/session`, `api/membres/[id]` |
| Formulaire | `modules/etats-des-lieux/inspection-form.tsx` et composants ; CSS/logo de référence |
| Transport | `dossier-storage.ts`, `persistence.ts`, `lib/inspections/http.ts`, `request-body.ts` |
| Tables | `team_members`, `inspection_templates`, `inspection_dossiers` |

Le formulaire combine l’entrée et la sortie dans un seul payload JSON version 1.
Les dix champs restent des chaînes, dont les dates locales ; les contrôles gardent
leurs 13 positions par phase et les procédures leurs 8/7/8 positions. Aucun statut
de finalisation ou nouveau champ métier. Métadonnées techniques séparées du JSON
exporté. PostgreSQL/serveur contrôlent auteurs, horodatages et révisions.

Tous les membres actifs partagent tous les dossiers. Seul l’admin actif peut gérer
les rôles/activités et supprimer un dossier. Un inactif, un compte sans fiche ou un
anonyme n’a aucun accès métier. L’API de membres modifie les fiches existantes ;
elle ne crée pas de compte Auth et n’envoie pas d’invitation.

La sauvegarde est manuelle. Effacer ne réinitialise que la mémoire, garde l’UUID
et la révision et n’écrit pas en base. La suppression définitive se trouve dans
la liste administrative et demande une confirmation séparée. Les conflits ne
proposent pas d’écrasement forcé. L’impression native et les signatures papier
restent présentes ; ni photo, signature électronique, autosauvegarde, dashboard,
réservation ni génération PDF serveur.

L’autorisation repose sur le serveur et les RLS, jamais sur un rôle navigateur.
Le client Supabase des opérations métier utilise la clé publishable et le JWT du
membre, sans privilège `service_role`. Les RPC sont `SECURITY INVOKER`. Le schéma
`team_private` ne doit pas être exposé par la Data API.

Le drapeau ferme les routes de l’application, **pas la Data API Supabase**. Les
tables et RPC déjà appliqués restent accessibles directement selon leurs RLS
aux membres actifs possédant une session valide. C’est ce qui permet la recette
Data API avant l’ouverture de l’interface ; un gel complet de base nécessite une
mesure distincte, décrite pour le retour arrière ci-dessous.

La référence est immuable :

```text
docs/references/Domaine_Lo_Carmalhon_Demo_Etat_des_lieux.html
9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0
```

## 3. Environnements et variables

| Variable | Rôle | Précaution |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Cloud ciblé | Développement/Preview exclusivement vers la base de développement ; production vers un projet distinct |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable du même projet | Aucun JWT/service_role/clé secrète à cet emplacement |
| `TEAM_APP_ORIGIN` | Origine de confiance de la récupération | Origine seule, HTTPS en Preview/Production ; HTTP accepté seulement sur loopback local |
| `TEAM_INSPECTIONS_ENABLED` | Disponibilité applicative | Absente ou `false` maintenant ; `true` uniquement lors d’une activation future autorisée |
| `VERCEL_ENV` | Contexte Vercel fourni par la plateforme | Ne pas le falsifier ; la valeur `production` ferme actuellement le module même avec le drapeau actif |
| `NODE_ENV` | Contexte Next/Node | Géré par les commandes Next ; conditionne notamment le cookie Secure |

Ne configurer aucun secret Supabase, mot de passe de base, SMTP ou `service_role`
dans l’application. SMTP se configure dans Supabase. Les variables privées et
identifiants de recette ne doivent apparaître ni dans Git ni dans le chat.

| Contexte | Supabase et données | Activation et origine |
| --- | --- | --- |
| Development local | Projet de développement, données synthétiques | Drapeau fermé jusqu’aux prérequis ; origine locale exacte |
| Preview Vercel de recette | Projet de développement ou projet de recette isolé, jamais production | Restreindre les variables à la branche de recette ; URL HTTPS stable, autorisée exactement |
| Production Vercel actuelle | Ne pas modifier pendant cette mission | Module fermé par le code ; aucune configuration à activer maintenant |
| Production future approuvée | Projet Supabase distinct, migrations et administrateur propres | Code d’ouverture revu séparément, premier déploiement fermé, puis activation explicite |

Vérifier les portées Development/Preview/Production dans les paramètres Vercel
**lors de la future opération autorisée**, pas dans cette mission. Les variables
d’un environnement ne prouvent pas celles des autres. Une modification de variable
s’applique à un nouveau déploiement ; un ancien déploiement garde sa configuration.
Ne pas promouvoir un build de recette en supposant que sa base sera remplacée
automatiquement. [Référence Vercel](https://vercel.com/docs/environment-variables).

## 4. Vérifications techniques reproductibles

Utiliser Node.js 22, puis installer depuis le lockfile :

```bash
nvm use 22
npm ci
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
npm audit
node tests/auth/policy.test.mjs
node tests/etats-des-lieux/persistence.test.mjs
node tests/etats-des-lieux/request-body.test.mjs
```

`nvm` est un exemple de sélection du runtime ; un Node 22 installé autrement
convient. `next typegen` régénère les types des routes sans assouplir TypeScript,
notamment après un changement de checkout. Ne jamais conserver une route temporaire
de test dans un build livré. Si le cache de développement référence une ancienne
route, arrêter le serveur concerné avant de retirer uniquement `.next/dev`.

Pour les tests navigateur, installer les outils hors des dépendances applicatives
ou utiliser ceux de l’environnement : Playwright, Chromium, Python/Pillow et
Poppler. La session de phase 5 utilise Playwright 1.62.1 et PGlite 0.5.15. Les
variables `PLAYWRIGHT_MODULE_PATH` et `CHROMIUM_PATH` sélectionnent les outils si
le chemin par défaut n’est pas disponible. PGlite est un PostgreSQL local en WASM,
pas une connexion Supabase.

Exemple d’installation d’outils de test à côté du dépôt :

```bash
npm install --prefix ../site-gites-test-tools @electric-sql/pglite@0.5.15 playwright@1.62.1
PGLITE_MODULE_PATH="$PWD/../site-gites-test-tools/node_modules/@electric-sql/pglite" node tests/etats-des-lieux/rls-local.mjs
export PLAYWRIGHT_MODULE_PATH="$PWD/../site-gites-test-tools/node_modules/playwright"
npm exec --prefix ../site-gites-test-tools -- playwright install chromium
export CHROMIUM_PATH="$(node -p 'require(process.env.PLAYWRIGHT_MODULE_PATH).chromium.executablePath()')"
```

Les chemins de module doivent être absolus, comme ci-dessus. Python/Pillow et
Poppler doivent aussi être installés sur la machine de recette ; installer les
bibliothèques système Chromium requises par le système. Les suites utilisent
les conventions POSIX : Linux/macOS ou WSL sous Windows. Aucun outil manquant
ne doit être remplacé par une réussite fictive.

Un environnement Python isolé peut fournir à la fois `python`, `python3` et Pillow
aux scripts, sans installer dans le dépôt :

```bash
python3 -m venv ../site-gites-python
../site-gites-python/bin/python -m pip install Pillow
export PATH="$PWD/../site-gites-python/bin:$PATH"
```

Installer également Poppler par le gestionnaire système (paquet `poppler-utils`
sur Debian/Ubuntu), et vérifier `pdftoppm -v` avant la comparaison A4.

Lancer les suites utilisant Next dev **successivement**, car elles partagent le
cache et son verrou :

```bash
node tests/etats-des-lieux/fidelity.mjs
node tests/etats-des-lieux/persistence-browser.mjs
```

Ces scripts créent une route locale temporaire puis l’enlèvent dans `finally`.
Ils utilisent des données synthétiques et ne simulent pas de session Auth dans
l’application. Le premier compare le composant au HTML ; le second intercepte
le transport HTTP uniquement dans le navigateur de test. Ils ne font aucune
écriture Supabase.

Pour la non-régression du site public, préparer un checkout de référence séparé
avec ses dépendances, puis comparer :

```bash
git worktree add --detach ../site-gites-phase4 1646189a0e8b1427337221728158950e10b0a602
npm ci --prefix ../site-gites-phase4
PUBLIC_BASELINE_ROOT=../site-gites-phase4 node tests/public/non-regression.mjs
```

Le script démarre deux serveurs locaux, compare les trois pages aux largeurs 375
et 1440 px et contrôle aussi responsive, clavier, menu et ancres. Les attributs
des métadonnées sont comparés indépendamment de l’ordre de leurs balises, que
Next peut réorganiser. La référence ancienne sert uniquement au test local ; ne
pas la déployer, elle précède les correctifs de dépendances.

Après les suites temporaires, refaire `next typegen`, TypeScript et le build.
Pour les contrôles HTTP, démarrer le **build final** dans un premier terminal,
puis les scripts dans un second :

```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

```bash
node tests/auth/http.mjs
node tests/etats-des-lieux/http.mjs
```

Si le port est différent, fournir `TEAM_TEST_BASE_URL` avec l’URL locale. Le test
Auth utilise également le port 3002. Ne pas utiliser une URL de production.
Avec configuration absente, le refus attendu est 503 ; avec configuration valide
et session absente, c’est 401. Une origine de mutation refusée produit 403 avant
toute écriture. Les tests locaux ne sont pas une validation d’authentification réelle.

Derrière le proxy Codex, garder TLS et la configuration injectée. Utiliser un
cache npm inscriptible si nécessaire et `NODE_USE_ENV_PROXY=1` pour les appels
réels au projet de développement autorisé. Autoriser son seul hostname dans la
politique réseau. Ne pas contourner un refus réseau.

## 5. Préparation de la recette réelle — propriétaire uniquement

Avant tout compte, e-mail ou écriture de test, le propriétaire doit autoriser
explicitement les opérations de recette sur le seul projet de développement.
Les cinq profils doivent être des comptes de test contrôlés, distincts :

| Profil | Fiche `team_members` | Attendu |
| --- | --- | --- |
| Administrateur | `admin`, actif | Tous les dossiers, gestion de membres et suppression confirmée |
| Agent A | `agent`, actif | Tous les dossiers, aucun droit administratif |
| Agent B | `agent`, actif | Mêmes droits, y compris sur les dossiers de A |
| Inactif | `agent`, inactif | Auth peut réussir mais aucune opération métier |
| Sans fiche | Aucune fiche pour ce compte Auth | Aucun accès métier |
| Anonyme | Aucun compte/session utilisé | Aucun accès métier |

L’admin de développement existe selon les informations du propriétaire. Ne pas
rejouer son bootstrap. Si un profil manque, le propriétaire le prépare lui-même
dans Authentication > Users, avec adresse confirmée et mot de passe fort ; ne
pas envoyer d’invitation non souhaitée. Renseigner ensuite la fiche correspondante
dans Table Editor selon le tableau. Ne jamais créer de fiche pour le profil
« Sans fiche ». Vérifier les UUID localement, sans les publier.

Contrôler dans Supabase : Email/Password activé, inscriptions publiques et
connexions anonymes désactivées, `team_private` non exposé. Lire les politiques
et grants, et le script en lecture seule `supabase/manual/phase4-security-review.sql`.
L’éditeur SQL et Table Editor peuvent agir avec des privilèges administratifs :
leur réussite **ne démontre pas** les permissions RLS d’un membre.

Garder le module fermé durant les premiers contrôles. Vérifier l’URL/Project
Reference de développement et la correspondance avec la clé publishable. Le
script `scripts/check-supabase-readiness.mjs` ne fait qu’une vérification de
disponibilité, pas une connexion utilisateur ni une recette RLS.

### A. Auth, déconnexion et comptes refusés — indispensable

1. Ouvrir un contexte navigateur privé sur `/equipe/connexion`.
2. Admin : saisir les identifiants uniquement dans le formulaire. Vérifier
   `/equipe`, le rôle affiché et un 200 pour `/equipe/api/session`.
3. Dans DevTools > Application/Storage, vérifier seulement les noms/attributs des
   cookies : chemin `/equipe`, HttpOnly, SameSite=Lax, Secure sur HTTPS. Ne pas
   copier leurs valeurs ni partager de capture qui les montre.
4. Se déconnecter, puis rouvrir `/equipe` et interroger l’API de session. Attendre
   redirection vers la connexion et 401 sur l’API. Vérifier la disparition des
   cookies de session de ce navigateur. Le retour arrière ne doit pas permettre
   une nouvelle opération serveur autorisée.
5. Refaire dans des contextes séparés pour A et B : accès équipe autorisé.
6. Inactif et sans fiche : connexion métier refusée, aucun formulaire/dossier
   servi ; le serveur doit refuser les API, même en ajoutant `x-team-role: admin`.
7. Anonyme : essayer directement les trois routes de dossiers et les API
   GET/POST/PATCH/DELETE. Aucun contenu de séjour, aucune écriture.
8. À partir d’un navigateur Agent déjà connecté, le propriétaire désactive **ce
   profil de test** après autorisation. À la requête suivante, lecture, sauvegarde,
   export et impression via les boutons doivent être refusés. Vérifier aussi
   le refus Data API avec son JWT encore valide, puis rétablir le profil pour
   la suite. Ne pas désactiver l’admin dont on dépend.

### B. RLS et persistance via Data API — indispensable

Le script `tests/etats-des-lieux/supabase-manual.mjs` se connecte réellement avec
les cinq profils et utilise leurs JWT pour les appels Supabase. Aucun secret
privilégié n’est utilisé. Il ne crée pas de membre et ne change pas les réglages
Auth ; il crée et supprime un seul dossier synthétique après autorisation.

Créer un fichier local privé `.env.phase4-test.local`, ignoré par Git, contenant
les deux variables Supabase et les noms suivants avec les valeurs saisies en privé :

```text
TEAM_TEST_EXPECTED_PROJECT_REF
TEAM_TEST_ADMIN_EMAIL
TEAM_TEST_ADMIN_PASSWORD
TEAM_TEST_AGENT_A_EMAIL
TEAM_TEST_AGENT_A_PASSWORD
TEAM_TEST_AGENT_B_EMAIL
TEAM_TEST_AGENT_B_PASSWORD
TEAM_TEST_INACTIVE_EMAIL
TEAM_TEST_INACTIVE_PASSWORD
TEAM_TEST_NO_MEMBER_EMAIL
TEAM_TEST_NO_MEMBER_PASSWORD
```

Épingler le Reference du **projet de développement**, vérifier le fichier du
script puis, après autorisation d’écritures synthétiques, exécuter :

```bash
node --env-file=.env.phase4-test.local tests/etats-des-lieux/supabase-manual.mjs --allow-development-writes
```

Résultats attendus : identités vérifiées, profils distincts, anonymes exclus,
création A, lecture et modification B, payload exact, auteurs A/B exacts,
révision obsolète refusée et une seule réussite parmi deux écritures concurrentes.
Les inactifs/sans fiche ne voient rien et ne peuvent écrire ; l’agent ne peut
supprimer ; le DELETE direct sans confirmation ne supprime rien, même pour l’admin.
L’admin peut sauvegarder et supprimer via le RPC confirmé. Chaque session se ferme.

Conserver la sortie de succès sans secrets. En cas d’erreur, arrêter la recette.
Vérifier le seul UUID synthétique signalé ; le script tente son nettoyage. Un reçu
de création perdu peut correspondre à un commit tardif : recontrôler cet UUID
ultérieurement. Ne pas relancer en boucle ni supprimer des dossiers réels.
Le script ne teste pas le renouvellement automatique, SMTP ou toute l’interface.

### C. Permissions de gestion des membres — indispensable

Dans un navigateur Agent connecté, relever son UUID via l’API de session, puis
utiliser DevTools pour une requête PATCH vers `/equipe/api/membres/<UUID-agent>`
avec JSON `{"role":"admin","active":true}`. Attendre 403, sans mutation. Une
tentative de DELETE de dossier avec confirmation doit également produire 403.

Exemple à exécuter uniquement depuis le navigateur du profil Agent de test :

```js
const s = await fetch('/equipe/api/session', {cache:'no-store'}).then(r=>r.json());
if(s.role !== 'agent') throw new Error('Utiliser le profil Agent de test');
const r = await fetch('/equipe/api/membres/'+s.user_id, {
  method:'PATCH', headers:{'Content-Type':'application/json'},
  body:JSON.stringify({role:'admin',active:true})
});
console.log(r.status); // 403 attendu ; ne pas afficher les cookies ou identifiants.
```

Pour vérifier indépendamment les RLS des rôles, le propriétaire peut exécuter
le test suivant dans le terminal du dépôt, avec le même fichier privé et après
autorisation des mutations sur **les profils de test seulement**. Aucune valeur
d’identifiant ou de jeton ne s’affiche :

```bash
node --env-file=.env.phase4-test.local --input-type=module <<'JS'
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const env=process.env;
assert.equal(new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname,
  env.TEAM_TEST_EXPECTED_PROJECT_REF+'.supabase.co');
assert.notEqual(env.VERCEL_ENV,'production');
const make=()=>createClient(env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {auth:{persistSession:false,autoRefreshToken:false}});
const admin=make(),agent=make();
try {
  for(const [c,n] of [[admin,'ADMIN'],[agent,'AGENT_A']]) {
    const r=await c.auth.signInWithPassword({
      email:env['TEAM_TEST_'+n+'_EMAIL'],password:env['TEAM_TEST_'+n+'_PASSWORD']});
    assert.ok(!r.error,'Connexion de test refusée');
  }
  const u=await agent.auth.getUser(); assert.ok(!u.error && u.data.user);
  const id=u.data.user.id;
  const before=await admin.from('team_members').select('role,active')
    .eq('user_id',id).single();
  assert.ok(!before.error && before.data.role==='agent' && before.data.active);
  const denied=await agent.from('team_members').update({role:'admin'})
    .eq('user_id',id).select('role');
  assert.ok(denied.error?.code==='42501' || (!denied.error && denied.data.length===0),
    'Élévation Agent possible : arrêter et restaurer le profil de test via le propriétaire');
  const after=await admin.from('team_members').select('role,active')
    .eq('user_id',id).single();
  assert.ok(!after.error); assert.deepEqual(after.data,before.data);
  const allowed=await admin.from('team_members').update({role:'agent',active:true})
    .eq('user_id',id).select('user_id');
  assert.ok(!allowed.error && allowed.data.length===1,'Gestion Admin refusée');
  console.log('Gestion des membres : refus Agent et autorisation Admin vérifiés.');
} finally {
  await admin.auth.signOut({scope:'local'});
  await agent.auth.signOut({scope:'local'});
}
JS
```

Si l’élévation réussit, c’est un échec de sécurité : le propriétaire remet le seul
profil de test en Agent dans son dashboard et garde le module fermé. Ce test ne
doit jamais être exécuté avec un compte de voyageur ou dans une base de production.

### D. Renouvellement et expiration — indispensables

1. Noter la durée JWT et les réglages de session effectivement choisis dans le
   projet de développement ; ne pas les modifier juste pour masquer un échec.
2. Se connecter, garder le navigateur puis attendre l’expiration du JWT selon cette
   durée. Interroger ensuite `/equipe/api/session` : pour un actif, le Proxy doit
   renouveler et la réponse doit rester 200. Vérifier les nouveaux `Set-Cookie`
   et attributs sans en copier les valeurs. Un second appel doit aussi réussir.
3. Répéter avec deux onglets simultanés au renouvellement, puis après une coupure
   réseau temporaire. Pas de boucle de redirection, de cookies perdus ni d’accès
   accordé depuis une simple valeur de cookie.
4. Vérifier que la déconnexion ferme la session locale et que les refresh tokens
   de cette session ne permettent plus de la renouveler. Les autres sessions
   restent séparées : le code emploie le scope local.

Pour contrôler explicitement le renouvellement/révocation Auth sans afficher de
token, le propriétaire peut aussi exécuter cette commande avec le fichier privé,
sur le seul projet de développement autorisé. Elle crée une session du compte
Agent A, la renouvelle puis la ferme, sans créer de dossier ou de membre :

```bash
node --env-file=.env.phase4-test.local --input-type=module <<'JS'
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const e=process.env;
assert.equal(new URL(e.NEXT_PUBLIC_SUPABASE_URL).hostname,
  e.TEAM_TEST_EXPECTED_PROJECT_REF+'.supabase.co');
assert.notEqual(e.VERCEL_ENV,'production');
const c=createClient(e.NEXT_PUBLIC_SUPABASE_URL,e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {auth:{persistSession:false,autoRefreshToken:false}});
try {
  const login=await c.auth.signInWithPassword({
    email:e.TEAM_TEST_AGENT_A_EMAIL,password:e.TEAM_TEST_AGENT_A_PASSWORD});
  assert.ok(!login.error && login.data.session,'Connexion refusée');
  const renewed=await c.auth.refreshSession();
  assert.ok(!renewed.error && renewed.data.session,'Renouvellement refusé');
  const token=renewed.data.session.refresh_token; // Mémoire privée, jamais journalisée.
  assert.ok(!(await c.auth.signOut({scope:'local'})).error,'Déconnexion refusée');
  const revoked=await c.auth.refreshSession({refresh_token:token});
  assert.ok(revoked.error && !revoked.data.session,'Refresh encore autorisé après déconnexion');
  console.log('Renouvellement Auth et refus après déconnexion vérifiés.');
} finally { await c.auth.signOut({scope:'local'}); }
JS
```

Ce contrôle SDK ne remplace pas le test navigateur après expiration réelle :
la rotation et la transmission des cookies doivent aussi être vérifiées dans Next.

La Data API valide des JWT signés : un access token déjà émis peut rester valable
jusqu’à son expiration après une déconnexion. Ne pas confondre suppression des
cookies et révocation instantanée de chaque token copié. La désactivation dans
`team_members`, elle, ferme l’accès RLS à la requête suivante. Si le propriétaire
exige une révocation immédiate par session pour toute la Data API, cette exigence
nécessite une revue de conception/RLS distincte avant production, pas une promesse
fondée sur les tests locaux. [Sessions Supabase](https://supabase.com/docs/guides/auth/sessions).

### E. Récupération de mot de passe — indispensable

Après autorisation d’envoi uniquement vers les comptes de test :

1. Choisir une origine stable de développement/recette. Aligner `TEAM_APP_ORIGIN`,
   Site URL dans Supabase et l’URL exacte autorisée `/equipe/confirmation`.
   Aucun `next` libre ni wildcard global de Preview. Configurer le moyen d’envoi
   approuvé dans Supabase ; vérifier la disponibilité, les quotas et la délivrance.
2. Pour le modèle Reset password du flux serveur, utiliser le lien fixe :

   ```html
   <a href="{{ .SiteURL }}/equipe/confirmation?token_hash={{ .TokenHash }}&type=recovery">Réinitialiser le mot de passe</a>
   ```

3. Sur `/equipe/recuperation`, demander le lien pour un profil actif. L’ouvrir dans
   un contexte privé neuf : arriver sur `/equipe/mot-de-passe`, définir deux mots
   de passe identiques d’au moins 12 caractères, puis vérifier la déconnexion.
4. Vérifier que le nouveau mot de passe fonctionne et l’ancien échoue. Un hash
   déjà utilisé ou expiré doit revenir à la connexion avec un échec de lien.
5. Tester une adresse sans compte : même réponse publique générique, sans fuite
   d’existence. Un compte inactif/sans fiche ne doit pas récupérer l’accès métier.
6. Un lien malformé ou comportant une destination externe ne doit jamais rediriger
   hors de l’origine prévue. Vérifier aussi `Referrer-Policy: no-referrer`.

Avant les premiers liens réels, masquer `token_hash`, cookies et corps sensibles
dans les logs d’accès, proxys, APM et captures. Le code ne les journalise pas,
mais le hash passe dans une URL GET. Ne pas partager un HAR non nettoyé. Vérifier
la délivrance SMTP réelle avant production ; une réponse générique réussie de
l’action ne prouve pas l’envoi. [Flux mot de passe](https://supabase.com/docs/guides/auth/passwords)
et [redirections Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

### F. Ouverture de la seule recette applicative — décision future

Après réussite documentée de A à C et autorisation du propriétaire, activer le
drapeau **uniquement en Development/Preview**, puis redémarrer/reconstruire le
déploiement de recette. Ce changement n’est pas réalisé pendant la phase 5.
La valeur `true` ne contourne ni Auth ni RLS ; en production le verrou demeure.

### G. Formulaire, stockage et concurrence — indispensables

1. Agent A : `/equipe/etats-des-lieux/nouveau`. Remplir un dossier synthétique,
   avec champs vides, accents, retours à la ligne, dates et heures locales,
   contrôles dans les deux onglets, checklists et règlement. Sauvegarder : attendre
   le reçu, relever seulement l’URL/UUID synthétique et la révision.
2. Agent B : retrouver ce dossier par référence et l’ouvrir. Vérifier chaque
   valeur, y compris celles de l’onglet masqué. Modifier et sauvegarder.
3. Agent A : garder sa vieille révision, modifier puis sauvegarder. Attendre 409,
   sans perte de saisie. Exporter les saisies à garder, annuler le rechargement et
   sauvegarder à nouveau : toujours 409. Confirmer ensuite le rechargement et
   retrouver B ; reporter les changements utiles puis sauvegarder normalement.
4. Tester les doubles clics et les saisies pendant une sauvegarde : un seul
   enregistrement déclenché, saisies nouvelles présentes avec indication qu’elles
   restent à sauvegarder. Couper le réseau : aucun succès avant reçu. En cas de
   reçu perdu, recharger après vérification avant une nouvelle décision.
5. Effacer annulé ne change rien. Effacer confirmé rétablit les valeurs initiales
   en mémoire, sans requête POST/PATCH/DELETE et sans suppression dans l’autre
   navigateur. Une sauvegarde explicite ultérieure conserve l’UUID et applique
   le contrôle normal de révision. Aucun brouillon inventé sur un dossier neuf.
6. Exporter le JSON : version 1, dix champs chaînes, tableaux 13/13 et 8/7/8,
   booléens et ordre conservés, aucune métadonnée d’UUID/auteur/révision ajoutée.
   Vérifier accents, sauts de ligne, chaînes vides et absence de conversion UTC
   des dates saisies. Le nombre de voyageurs reste une chaîne.
7. Imprimer depuis chaque onglet : entrée et sortie présentes, CSS d’origine,
   sept règles et lignes de signature papier. Vérifier 320/375/768/1440 px,
   progression, alertes de sécurité et tous les contrôles/checklists.
8. Avec une session active, soumettre un payload dont `accepted` est une chaîne
   plutôt qu’un booléen via l’API : attendre 400, aucune nouvelle révision. Le
   script Data API vérifie séparément le rejet PostgreSQL d’un payload invalide.
9. Déconnexion/désactivation : de nouvelles sauvegardes et les boutons d’export/
   impression doivent être refusés. Une donnée déjà vue/copiée reste connue de
   son utilisateur ; aucune révocation ne peut l’effacer de sa mémoire ou papier.

### H. Suppression administrative — indispensable

Agent : pas de bouton de suppression et DELETE API direct refusé 403, même avec
confirmation. Admin : depuis la liste, annuler puis confirmer la suppression de
ce seul dossier synthétique. Seule la confirmation explicite supprime. Si un autre
agent l’a modifié entre l’affichage et le clic, attendre un conflit, actualiser
et confirmer à nouveau. Recharger l’ancienne URL doit indiquer l’absence du dossier.
Ne pas utiliser Effacer pour tester cette opération.

## 6. Preuves et décision de recette

Consigner chaque ligne avec date/heure, commit testé, environnement, profil,
résultat, anomalie et preuve nettoyée. Utiliser les noms de profils, sans e-mail,
mot de passe, JWT, cookies ou données réelles de voyageur. Le propriétaire signe
la décision d’ouverture ; les cases ci-dessous restent à compléter.

| Indispensable avant production | État actuel |
| --- | --- |
| Auth de tous les profils, anonyme, déconnexion et désactivation | À réaliser |
| RLS Data API et gestion des rôles avec JWT de membres | À réaliser |
| Renouvellement, expiration et comportement après déconnexion documenté | À réaliser |
| SMTP/récupération, usage unique et liens expirés | À réaliser |
| Création, lecture/modification partagée, conflits et rechargement | À réaliser |
| Effacer sans suppression ; suppression admin confirmée uniquement | À réaliser |
| Impression/JSON, validation visuelle et fonctionnelle client | À valider avec le client |
| Base de production isolée, sauvegarde/restauration et premier admin | À préparer sous autorisation distincte |
| Mentions légales, confidentialité, accès, conservation et suppression des dossiers | Décisions/validation propriétaire requises |
| Build, dépendances et en-têtes sur la Preview qui sera validée | À confirmer sur l’hébergement réel |

Les tests complémentaires comprennent les navigateurs supplémentaires, appareils
physiques, très longues sessions, volumes représentatifs de dossiers et essai
de restauration sur un autre projet isolé. Ils ne remplacent aucun des tests
indispensables ; une anomalie de sécurité ou de conservation détectée devient
bloquante. Les objectifs de volume, durée de conservation, RPO/RTO et disponibilité
restent à décider, sans inventer de règle métier ni de garantie contractuelle.

## 7. Préparation Vercel — aucune action de production maintenant

Le code requiert le runtime serveur Node/Next, des Route Handlers et des cookies.
Pas d’export statique. Sélectionner **Node 22.x**, testé ici, dans le futur projet
de recette et les réglages approuvés de production ; ne pas dépendre du runtime
par défaut du fournisseur. Aucun paramètre Vercel n’a été modifié par cette mission.
[Versions Node Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Vérifier HTTPS, origine exacte, portée des variables, cookies Secure/HttpOnly,
`private, no-store` sur tout `/equipe`, transmission de `Set-Cookie` et absence de
cache CDN/ISR sur les pages privées et réponses de session. Le Proxy doit rester
limité à `/equipe` ; les pages publiques gardent leur comportement statique.
Les protections Vercel de Preview ne remplacent jamais les contrôles de l’application.
[SSR et cache Supabase](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

Les appels Supabase sont bornés à 10 s par requête côté serveur, les requêtes du
formulaire à 30 s côté navigateur. Plusieurs contrôles successifs, renouvellements
et la latence peuvent cumuler ces délais. Vérifier les durées de fonctions et du
Proxy réellement offertes par le plan et les régions ; un dépassement doit rester
une indisponibilité, jamais un succès inventé. La limite Vercel de corps est
actuellement 4,5 Mo, au-dessus de notre limite de 1 Mio. Lister seulement 25 dossiers
par page limite la réponse ; ne pas augmenter ces bornes sans mesure.
[Limites des fonctions](https://vercel.com/docs/functions/limitations).

Le plan, les quotas, une éventuelle pause de Supabase, les limites Auth/SMTP et
les indisponibilités des fournisseurs peuvent affecter les sessions et les
écritures. Aucune mesure de disponibilité sur l’hébergement réel n’a été faite.
Vérifier les capacités de sauvegarde/PITR et les procédures de restauration
disponibles dans l’offre retenue ; aucun stockage local d’une fonction Vercel ne
doit servir de sauvegarde durable. Choisir une région cohérente avec la base.

## 8. Publication future en douze étapes — à autoriser séparément

1. **Recette de développement complète** : réussir A à H et conserver les preuves
   du commit testé ; aucune anomalie bloquante ouverte.
2. **Validation client** : signer la fidélité visuelle et les parcours métier,
   mobile, impression et export. Aucun ajout de champ ou redesign implicite.
3. **Données et cadre légal** : finaliser mentions/confidentialité, personnes
   autorisées, conservation, effacement, sauvegardes et procédure d’incident.
4. **Projet Supabase de production distinct** : vérifier le Reference ciblé,
   accès administratifs, réseau et sauvegarde ; ne pas copier les données de test.
5. **Variables Vercel Production** : préparer URL et clé de ce seul projet,
   origine HTTPS exacte et drapeau fermé. Ne rien changer à la portée Preview.
6. **Migrations contrôlées** : sauvegarder/consigner l’état initial, examiner puis
   autoriser chaque migration existante avant application sur la base de production.
   Vérifier grants, RLS, fonctions, template et registre d’application. Ne pas
   réappliquer un SQL déjà présent ni lancer une migration destructive automatique.
7. **Premier admin** : créer manuellement le compte de production confirmé,
   remplacer le UUID placeholder d’une copie privée de `bootstrap-admin.sql`,
   examiner puis exécuter une seule fois après autorisation. Le script refuse un
   second bootstrap si un admin existe. Garder inscriptions publiques désactivées.
8. **Décision d’activation** : le verrou actuel rend l’ouverture de production
   impossible avec la seule variable. Préparer une modification distincte, revue
   et testée, qui permet le déploiement de production tout en gardant le drapeau
   fermé par défaut. **Ne pas retirer le verrou dans la phase 5.** Le premier
   déploiement prévu reste fermé ; l’activation nécessite une décision ultérieure.
9. **Pull Request vers `main`** : préparer alors seulement la PR, avec preuve de
   recette, diff sans routes temporaires, audit, tests, revue et plan de retour.
   La fusion est une décision distincte ; aucune PR/fusion de ce type dans cette mission.
10. **Vercel** : après fusion autorisée, vérifier le déploiement fermé, le commit,
    la base, HTTPS, Auth et cookies. Puis, après décision explicite d’ouverture,
    activer le drapeau et créer le nouveau déploiement qui reçoit cette variable.
11. **Contrôle après ouverture** : avec profils de contrôle autorisés, vérifier
    accès admin/agent, refus anonyme/inactif, cycles de session, RLS, sauvegarde,
    conflit, impression, export et suppression d’un dossier synthétique. Nettoyer
    seulement les fixtures identifiées ; vérifier vitrine et logs sans secrets.
12. **Acceptation ou retour arrière** : consigner la décision et le déploiement
    de référence. Si une condition échoue, fermer le module et suivre la procédure
    ci-dessous. Aucune réparation de base improvisée depuis l’application.

## 9. Retour arrière : code et base séparés

Préparer avant publication un déploiement fermé de secours, incluant les correctifs
de sécurité, ainsi que l’identification de la sauvegarde/restauration autorisée
de la base. Ne pas choisir mécaniquement une version ancienne vulnérable.

1. En incident, bloquer les nouvelles écritures **de l’application** via un
   déploiement dont le drapeau est fermé ou le verrou maintenu. Modifier la seule
   variable d’un projet ne modifie pas un déploiement déjà servi. La Data API
   n’est pas coupée par ce drapeau : pour un gel complet, le propriétaire doit
   aussi appliquer la mesure Supabase préautorisée et vérifier la fin des écritures
   déjà engagées. Avec le modèle actuel, une option est de conserver un inventaire
   privé des fiches actives puis de les désactiver dans Table Editor avec les droits
   du propriétaire. Les nouvelles requêtes métier/RLS sont alors refusées, y compris
   celles des admins applicatifs ; garder l’accès propriétaire au dashboard pour
   restaurer les activités exactes après validation. Cette opération d’incident
   demande un accord distinct et n’est pas automatisée par l’application.
2. Dans Vercel, sélectionner le déploiement approuvé de secours, vérifier commit,
   domaines et ancienne configuration, puis confirmer le rollback. Vérifier les
   accès fermés, la vitrine et le comportement des cookies. Un Instant Rollback
   restaure le build et sa configuration historique ; les variables modifiées
   ensuite ne sont pas automatiquement reprises. Vérifier également l’état de
   réaffectation automatique des domaines avant une future remise en service.
3. **Le rollback Vercel ne restaure pas la base Supabase**, n’annule pas les
   migrations et ne récupère pas un dossier supprimé. Les écritures validées
   avant l’incident restent présentes tant qu’une opération distincte ne les change.
4. Examiner la compatibilité de l’ancien code avec le schéma et les payloads.
   Les deux migrations actuelles sont additives par rapport à la vitrine ; il
   n’y a aucun script `DROP` ou migration inverse à lancer automatiquement.
5. Si une restauration de données est nécessaire, garder les écritures arrêtées,
   mesurer les données légitimes qui seraient perdues, obtenir l’autorisation du
   propriétaire et restaurer d’abord vers une base isolée. Valider contenu, RLS,
   comptes et périodes avant toute bascule approuvée. Ne pas restaurer toute une
   base pour « corriger » le code sans cette analyse.
6. Préparer un correctif vers l’avant, refaire la recette, rétablir exactement les
   activités de membres éventuellement gelées et ouvrir seulement après une nouvelle
   décision consignée. Ne jamais désactiver les RLS pour dépanner.

[Procédure Vercel de rollback](https://vercel.com/docs/instant-rollback).

## 10. Transmission et limites restantes

Les résultats locaux détaillés et la liste des fichiers sont dans le rapport de
phase 5. Les documents de phases 1 à 4 restent consultables pour l’historique.
La phase 5 a réussi les vérifications lint/TypeScript/build, 40 tests unitaires,
48 contrôles PostgreSQL locaux, 45 contrôles HTTP, la persistance navigateur,
46 comparaisons exactes du formulaire et six comparaisons publiques. L’audit npm
ne signale plus de vulnérabilité à la date du rapport.
Les tests Supabase authentifiés, les validations de session/SMTP, les réglages
d’hébergement réel, la validation client et la politique de données restent à
réaliser. Rien ne permet de cocher ces points à partir d’un mock, d’un test PGlite,
d’une capture de maquette ou de la seule réussite d’un build.

La reprise doit commencer par vérifier la branche, les nouveaux commits éventuels,
les variables présentes sans les afficher, les migrations déjà appliquées et les
preuves disponibles. Ne pas recommencer les phases terminées et ne pas ouvrir
la production tant que les conditions précédentes ne sont pas satisfaites.
