# Espace Équipe — recette réelle Supabase après la phase 5

## Décision au 5 novembre 2026

**Recette distante bloquée par la configuration de l’environnement. Le module
n’est pas déclaré prêt pour la production.** Aucun test Auth, RLS ou de
persistance sur Supabase Cloud n’a pu être exécuté pendant cette session.

L’URL réelle, le Project Reference, la clé publishable et les identifiants des
comptes de recette ne sont pas disponibles dans l’environnement Codex courant.
Le diagnostic existant s’arrête avant toute requête réseau. Ce résultat ne
constitue ni un échec de Supabase, ni un refus RLS, ni une preuve de défaut du code.

Les deux migrations et le premier Administrateur existent selon le propriétaire.
Leur présence distante n’a pas été vérifiée ici. L’absence de variables locales
ne permet pas de conclure à l’absence des comptes sur Supabase.

## Reprise et preuves réellement obtenues

| Contrôle effectué | Résultat observé |
| --- | --- |
| Dépôt et branche | `kinnnisss/site-gites`, `feature/espace-equipe` ; arbre propre à la reprise |
| Dernier commit de la branche GitHub, après fetch et `git ls-remote` | `2ae8ea06783071da2e9a9952b450df56b72978de`, identique au commit local de départ |
| Référence distante de `main`, consultée en lecture seule | `bfc7a5a7161b5a61312c9da2f3075ed129b4bac8` ; aucune fusion |
| Instructions et documentation | `AGENTS.md`, rapport de phase 5, handoff, documentation Auth dans `app/equipe/README.md` et `tests/auth/README.md`, script de recette et diagnostic existants lus |
| Configuration de l’environnement géré | Environnement disponible ; aucune variable métier, aucun secret ni identité sortante configurés signalés par son état courant |
| Variables du processus | URL, clé publishable, Project Reference et les dix variables des cinq profils : toutes absentes ; seules leurs présences ont été contrôlées |
| Fichiers privés de configuration connus | `.env`, `.env.local`, `.env.development`, `.env.development.local`, `.env.phase4-test.local` absents du dépôt de travail |
| Diagnostic de préparation existant | Exécuté sous Node 22.23.4 avec `NODE_USE_ENV_PROXY=1` ; sortie `Required Supabase variables are absent.` ; code de sortie **2**, avant tout appel HTTP |
| Réseau déclaré | Politique restrictive active ; aucun domaine de projet Supabase dans les hôtes autorisés observés. Connectivité vers le projet réel non testée, sa référence étant inconnue |
| Accès alternatif | Aucun outil Supabase connecté disponible ; découverte d’une intégration non installée, sans accès au projet |
| Fermeture du module | `TEAM_INSPECTIONS_ENABLED` absent, donc fermé par le code ; `.env.example` conserve `false`. Aucun drapeau ni verrou de production modifié |

Commande de diagnostic exécutée depuis le dépôt, avec le runtime Node 22 de
travail sélectionné :

```bash
NODE_USE_ENV_PROXY=1 node scripts/check-supabase-readiness.mjs
```

L’avertissement expérimental Node relatif au proxy n’a pas empêché le diagnostic.
Aucune option de désactivation TLS, aucun contournement réseau et aucun appel
vers l’URL fictive de `.env.example` n’ont été utilisés.

Les suites locales et comparaisons de la phase 5 n’ont pas été recommencées.
Leurs résultats historiques ne sont pas comptés comme des tests Cloud réussis.

## Tests réussis, échoués et bloqués

Les contrôles de reprise Git, de présence de configuration et de fermeture par
défaut ont réussi. **Aucun test fonctionnel distant n’a réussi ou échoué : ils
sont tous bloqués.** Le seul diagnostic lancé signale une configuration absente.

| Test demandé | État de cette session | Condition manquante |
| --- | --- | --- |
| URL et Project Reference de développement | Bloqué | Valeurs réelles et confirmation qu’elles désignent le développement |
| Connectivité, disponibilité Auth, paramètres Auth publics | Bloqué | URL, clé publishable, référence épinglée et accès réseau autorisé |
| Tables `team_members`, `inspection_templates`, `inspection_dossiers` | Bloqué | Accès au projet ; un refus anonyme seul ne suffirait pas à démontrer leur présence ni leurs politiques |
| Inventaire des cinq comptes et de leurs rôles/activités | Bloqué | Accès privés de profils dédiés ; contrôle privilégié de préparation si nécessaire |
| Connexion valide/invalide, rôle Admin et rôles Agents | Bloqué | Comptes dédiés et accord préalable pour les sessions de test |
| Refus anonyme, inactif et utilisateur sans fiche | Bloqué | Projet réel ; profils distincts pour les deux derniers cas |
| Déconnexion, refresh, révocation et expiration dans Next | Bloqué | Sessions de test autorisées et application reliée au développement |
| Lecture et modification inter-agents via Data API | Bloqué | JWT des Agents A/B et dossier synthétique autorisé |
| Refus de modification des rôles par un Agent | Bloqué | Accord pour cette tentative sur un profil de test et vérification avant/après par l’Admin dédié |
| Refus de suppression Agent, suppression Admin confirmée | Bloqué | Accord d’écriture/suppression et fixture synthétique identifiée |
| Création, sauvegarde et rechargement | Bloqué | Même accord ; accès applicatif pour le parcours navigateur |
| Révision obsolète, concurrence et validation du payload | Bloqué | Même accord pour les tentatives, y compris celles censées être refusées |
| Réinitialisation sans suppression, impression, export JSON | Bloqué pour la recette réelle | Dossier réel synthétique et ouverture de la seule recette applicative après validation Auth/RLS |

Le script `tests/etats-des-lieux/supabase-manual.mjs` a été lu, **pas exécuté**.
Il ouvre cinq sessions et tente des écritures réelles ; son option
`--allow-development-writes` ne remplace pas l’autorisation explicite du
propriétaire. Aucun compte, rôle, dossier, paramètre Auth ou schéma distant n’a
été créé, modifié ou supprimé. Aucun e-mail n’a été envoyé.

## Préparer les accès sans communiquer de mot de passe dans le chat

Configurer les valeurs dans les variables/secrets privés de l’environnement
Codex. Autre possibilité : un fichier `.env.phase4-test.local` saisi en privé
dans le dépôt de travail, ignoré par Git et à accès limité. Ne pas déposer ces
valeurs dans un document, un ticket, une capture ou un commit.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
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

Depuis les réglages du **projet de développement**, relever le Project Reference
et son URL exacte `https://<reference>.supabase.co`, ainsi que la clé
`sb_publishable_…` de ce même projet. La référence doit correspondre exactement
au nom d’hôte. Aucune clé `service_role`, clé secrète, ni mot de passe de base
n’est nécessaire à cette recette par JWT de membres.

Dans la configuration réseau Codex, autoriser le seul domaine réel du projet si
nécessaire, puis reprendre les GET de diagnostic derrière le proxy avec
`NODE_USE_ENV_PROXY=1`. Un éventuel refus réseau/TLS doit être consigné et traité
par la configuration autorisée, sans tunnel de contournement ni désactivation
des vérifications de certificat.

Garder `TEAM_INSPECTIONS_ENABLED=false`. `TEAM_APP_ORIGIN` sera également nécessaire
pour la récupération de mot de passe ; choisir alors l’origine exacte du site de
recette. La clé et l’origine d’un déploiement existant ne sont pas accessibles ici
par le seul fait qu’il existe dans un autre environnement.

### Profils à vérifier ou à préparer par le propriétaire

| Profil privé | Compte Auth | Fiche `team_members` attendue |
| --- | --- | --- |
| `ADMIN` de recette | Confirmé, dédié aux tests | `role=admin`, `active=true` |
| `AGENT_A` | Confirmé, distinct | `role=agent`, `active=true` |
| `AGENT_B` | Confirmé, distinct | `role=agent`, `active=true` |
| `INACTIVE` | Confirmé, distinct | `role=agent`, `active=false` |
| `NO_MEMBER` | Confirmé, distinct | Aucune ligne pour son UUID |
| Anonyme | Aucun compte à créer | Aucune session ni fiche |

Ne jamais fournir le compte Administrateur personnel dans `TEAM_TEST_ADMIN_*`.
Le premier Administrateur déjà créé ne sera utilisé en automatisation que si le
propriétaire confirme qu’il s’agit d’un compte **dédié à la recette**, distinct de
son compte personnel. Ne pas rejouer le bootstrap du premier Administrateur.

Pour un profil manquant, le propriétaire peut le préparer dans le dashboard du
seul projet de développement : Authentication > Users, compte de test confirmé
avec mot de passe fort saisi en privé, puis Table Editor > `team_members` avec
l’UUID de ce compte dans `user_id` et le rôle/activité du tableau ; `created_at`
conserve sa valeur par défaut. Ne pas créer de fiche pour `NO_MEMBER`, ni
d’utilisateur pour le cas anonyme. Vérifier cinq UUID distincts sans les publier.
Ne pas envoyer d’invitation non souhaitée ni réutiliser un compte de voyageur.

Cette procédure explique la préparation ; elle n’a pas été exécutée. Si cette
préparation est confiée à l’agent, la création de comptes ou de fiches et les
attributions de rôles feront l’objet d’un accord explicite préalable sur le
projet et les seuls profils concernés. Ne pas donner de privilèges administratifs
à l’Agent simplement pour faire passer un test.

## Reprise des tests et accord d’écriture encore nécessaire

La demande de configuration privée a été transmise pendant la session. Aucun
Project Reference réel n’étant disponible, il serait prématuré de demander une
autorisation d’écriture sur une cible non identifiée.

1. Après fourniture des accès, vérifier en lecture seule la correspondance
   URL/référence de développement, `/auth/v1/health`, les paramètres Auth publics
   et les accès de lecture permis. Ne pas déduire la validité des RLS d’un simple
   HTTP 200, d’une liste vide ou d’une lecture par un compte privilégié.
2. Présenter ensuite au propriétaire la **référence réelle**, les profils privés
   `ADMIN`, `AGENT_A`, `AGENT_B`, `INACTIVE`, `NO_MEMBER`, les opérations exactes
   et le nettoyage ; obtenir son accord explicite avant les sessions et mutations.
3. Exécuter le script existant sur cette cible épinglée, puis les compléments
   Auth/permissions du handoff. Arrêter au premier échec pour en distinguer la
   cause : configuration, réseau, permissions ou code. Corriger seulement un
   défaut de code démontré et rejouer les contrôles concernés.
4. Après réussite des prérequis Auth/RLS et accord d’ouverture en développement,
   tester les parcours navigateur avec le vrai stockage : reset sans suppression,
   rechargement, conflit, impression et JSON. Consigner séparément les preuves
   Data API et celles des routes/pages Next.

Le périmètre concret prévu par le script est **un seul UUID synthétique aléatoire**,
référence `PHASE4-TEST` puis `PHASE4-TEST-B`, client `Donnée synthétique`, données
sans voyageur réel. Il crée le dossier par A, le modifie par B et l’Admin, tente
des révisions concurrentes/invalides et des opérations interdites, puis le
supprime par le RPC Admin avec UUID de confirmation et révision courante.
Les sessions sont fermées avec le scope local, sans déconnecter les autres
sessions du compte. Le script ne crée pas de membre et ne change aucun rôle.

Son bloc de nettoyage relit et supprime **uniquement cet UUID** avec l’Admin de
recette si une création a été tentée. En cas de reçu perdu, un commit tardif reste
possible : conserver l’UUID synthétique signalé et le revérifier ensuite. Si le
nettoyage échoue, le documenter et demander une intervention ciblée ; aucune
suppression par référence ou nettoyage global. Les fixtures supplémentaires
éventuellement nécessaires au navigateur seront annoncées avant leur création.

Les compléments de gestion des membres incluent une tentative d’élévation Agent
et une écriture Admin sur un profil de test : ils requièrent un périmètre d’accord
distinct ou explicitement inclus. Si une élévation interdite réussit, arrêter et
faire restaurer ce seul profil sous autorisation ; ne pas poursuivre la recette
avec un Agent devenu Admin. Aucune migration ou modification de RLS n’est incluse
dans l’accord de tests. Une correction de schéma imposerait une nouvelle
migration examinée puis autorisée avant exécution.

## Corrections et opérations restantes

**Aucune correction de code, dépendance, migration ou politique RLS.** Aucun
défaut de code n’a été démontré par cette session. Seul ce rapport est ajouté.
La documentation des phases terminées conserve ses résultats historiques.

Restent à réaliser : fournir la configuration privée, confirmer les profils
dédiés, permettre le réseau vers le développement, approuver les opérations
précises, exécuter les tests réels, vérifier le nettoyage puis actualiser ce
rapport avec leurs résultats et preuves sans secrets.

## Risques restants et conditions exactes d’activation

Les permissions et la persistance de la base Cloud restent **non vérifiées ici**.
L’existence déclarée des migrations et les tests locaux ne remplacent pas leur
recette avec les JWT des cinq profils. Le drapeau ferme l’application ; il ne
désactive pas la Data API, qui continue de dépendre des RLS du projet.

Après déconnexion, un access token signé déjà émis peut rester valide jusqu’à son
expiration ; vérifier séparément la révocation du refresh token, les cookies Next
et le refus après désactivation du membre. L’impression et l’export ne peuvent
pas révoquer des informations déjà téléchargées ou imprimées.

Pour ouvrir la **seule recette applicative de développement**, il faut la cible
confirmée, les profils dédiés, les contrôles Auth/anonyme/inactif/sans fiche et
RLS/gestion des membres réussis, puis une autorisation explicite d’activation du
drapeau sur cette seule instance. Les tests de formulaire avec stockage réel
doivent ensuite réussir ; l’ouverture de recette ne vaut pas acceptation finale.

Avant toute production, les conditions du handoff restent toutes exigées :

- Auth, permissions, persistance, concurrence, reset, suppression confirmée,
  impression/JSON, sessions et expiration réelles réussis et documentés sur le
  commit livré ; aucune anomalie bloquante ouverte.
- Récupération de mot de passe/SMTP, redirections, usage unique et liens expirés
  validés après autorisation des envois ; secrets et logs sensibles protégés.
- Validation métier/visuelle du propriétaire ; règles d’accès, conservation,
  suppression, confidentialité et procédure d’incident approuvées.
- Hébergement réel vérifié : HTTPS, origine exacte, cookies, absence de cache
  privé, Node 22, limites et configuration séparée du développement.
- Projet de production isolé, sauvegarde/restauration vérifiable, migrations et
  premier Admin de production préparés sous autorisations distinctes.
- Modification distincte, revue et testée du verrou `VERCEL_ENV=production`,
  actuellement maintenu : `TEAM_INSPECTIONS_ENABLED=true` seul ne peut pas ouvrir
  les dossiers en production. Premier déploiement fermé et plan de retour prêt.
- Autorisation explicite avant fusion, opérations de production, publication et
  ouverture effective. Aucune de ces opérations n’est réalisée par cette recette.

Références : [rapport de phase 5](ESPACE_EQUIPE_PHASE_5.md) et
[handoff, sections 5 à 9](ESPACE_EQUIPE_HANDOFF.md).
