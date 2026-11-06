# Finalisation de l’Espace Équipe — recette et Preview

## Livraison et limites

Branche exclusive : `fix/recette-espace-equipe`. Départ local et distant vérifié :
`a5320058e5b19c3eb660ec318b01d8265c5f5aba`. `origin/main` récupéré reste au
commit `9035a2e0ed3ae641216d8045b10cccd400f97107` ; ni fusion ni modification.
Le commit final est celui qui contient ce rapport (`git log -1` après récupération).

Le propriétaire indique avoir corrigé manuellement Supabase. La migration
PT409 est donc **déclarée appliquée par le propriétaire**, et non appliquée ou
indépendamment vérifiée par l’agent. Aucun accès SQL administratif ou de lecture
des catalogues n’est disponible : seuls la clé publishable et les comptes
fictifs sont configurés. La santé Auth et les réglages publics accessibles ne
prouvent pas la conformité des fonctions distantes.

La nouvelle mission autorise l’ajout du footer et la préparation Preview sans
relancer toute la campagne Cloud. Elle remplace la précédente suspension de
l’intégration du footer. Aucune réussite Cloud PT409 ou recette complète n’est
déduite des contrôles locaux. **L’activation Preview des dossiers reste soumise
à la vérification PT409 ; aucune activation ou configuration distante effectuée.**

## Changements

- `components/site-footer.tsx` : ajout discret, dans la partie basse existante,
  de « Vous gérez le domaine ? » et du lien `next/link`
  « Accès à l'Espace Équipe » vers `/equipe/connexion`.
- `app/(public)/public.css` : une règle limitée à `.footer-team-access`, pour
  l’alignement et le retour à la ligne ; palette, liens, hover et focus existants.
- `app/equipe/(auth)/connexion/page.tsx` : vérification avec `requireTeamMember`
  avant redirection vers `/equipe` d’une session active. Auth `getUser`, fiche
  membre et permissions serveur restent utilisés ; absent/inactif/sans fiche
  ne déclenche pas cette redirection. `redirect` reste hors du `try/catch`.
- `tests/public/non-regression.mjs` : option `--allow-team-footer` n’excluant que
  le nouveau bloc, captures réelles conservées, six comparaisons strictes hors
  ajout, navigation clavier, contraste et destination testés. Position restaurée
  après capture du footer pour comparer correctement le header fixe.
- `tests/auth/session-navigation-manual.mjs` : test ciblé et explicitement activé
  des cinq connexions fictives via Next local, des rôles, cookies, redirection de
  session existante et déconnexion ; aucune écriture métier ni récupération.
- `supabase/manual/verify-inspection-pt409.sql` : vérification **en lecture seule**
  des trois corps de fonctions par empreinte et des protections RLS courantes.
  Ce fichier n’est pas une migration et n’est pas exécuté sur Cloud par l’agent.
- `tests/etats-des-lieux/rls-local.mjs` : contrôle du nouveau script sur l’ancien
  SQL et le SQL PT409 dans PostgreSQL local, en conservant les tests de données,
  privilèges et politiques.
- Documentation : présent rapport, guide de tests manuels, actualisation du
  rapport de recette, de l’intégration et des instructions de tests.

Le formulaire React, son CSS, le HTML original, les migrations, les politiques,
les droits, les rôles et le verrou de production ne changent pas. Aucune nouvelle
dépendance. Empreinte HTML conservée :
`9b368972d39ac663deb4ae88a9c29c767e956032b8603ac061dae875e30b10f0`.

Fichiers livrés dans cette finalisation (en plus des correctifs antérieurs de la branche) :

```text
app/(public)/public.css
app/equipe/(auth)/connexion/page.tsx
components/site-footer.tsx
supabase/manual/verify-inspection-pt409.sql
tests/auth/session-navigation-manual.mjs
tests/auth/README.md
tests/etats-des-lieux/rls-local.mjs
tests/etats-des-lieux/README.md
tests/public/non-regression.mjs
docs/FINALISATION_ESPACE_EQUIPE.md
docs/GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md
docs/INTEGRATION_ACCES_EQUIPE.md
docs/ESPACE_EQUIPE_RECETTE_FINALE.md
docs/recette/2026-11-06-finalisation-code.json
docs/recette/captures-finalisation/footer-mobile.png
docs/recette/captures-finalisation/footer-ordinateur.png
```

## PT409 : constat et vérification à terminer

La cause était l’emploi de `40001`, réessayable par PostgREST/Hasql, pour un
conflit métier permanent. Le correctif livré au commit `7540891` remplace ces
trois erreurs par `PT409` dans :

- `team_private.stamp_inspection_dossier()` ;
- `public.save_inspection_dossier(uuid,integer,jsonb)` ;
- `public.delete_inspection_dossier(uuid,integer,uuid)`.

Le mapper TypeScript reconnaît `PT409` → HTTP 409 et garde les saisies ; les
erreurs de transport restent distinctes. La condition atomique UUID/révision
est conservée. Les preuves Cloud historiques avant correction restent des
échecs de transport, pas des refus métier validés.

Dans le SQL Editor du projet **`jijjjgsfdbrkvqvhyjwr`**, exécuter uniquement
[verify-inspection-pt409.sql](../supabase/manual/verify-inspection-pt409.sql).
Attendre trois fonctions présentes, corps conformes, PT409 présent, 40001 absent,
mode invoker. Comparer toute différence avec le fichier versionné sans réappliquer
une migration. Une différence de mise en forme interne peut modifier l’empreinte
et demande une inspection, pas un remplacement automatique.

Les états et ACL courants ne permettent pas de prouver rétroactivement qu’aucun
changement n’a eu lieu pendant une opération manuelle non observée. Conserver la
preuve SQL nettoyée, puis vérifier le HTTP 409 et l’absence d’écrasement dans le
parcours synthétique manuel décrit dans le guide. Aucun RPC métier Cloud n’est
relancé pour cette finalisation.

## Résultats des tests

| Contrôle réellement exécuté | Résultat |
| --- | --- |
| `npm run lint`, `npx next typegen`, `npx tsc --noEmit` | Réussis sous Node 22.23.4 |
| `npm run build` | Réussi, Turbopack Next 16.4.5, aucune route temporaire |
| Tests purs Auth/persistance/corps/cible | **27 + 10 + 4 + 3** réussis |
| PostgreSQL/PGlite | **54** contrôles réussis, dont le script SQL de vérification avant/après migration locale |
| Sauvegarde/rechargement navigateur | Réussis avec transport intercepté ; conflit, Effacer, JSON et impression inclus |
| Fidélité au HTML | **46/46** comparaisons exactes, dont impression/A4 ; interactions et export JSON réussis |
| Public contre `main` | **6/6** comparaisons exactes hors seul bloc ajouté, neuf contrôles responsive ; clavier/menu/ancres réussis |
| Footer | Mobile/ordinateur, destination, clavier, focus, contraste normal 5,17:1 et hover observé 5,45:1 réussis |
| HTTP sur le build Next réel | **29 Auth + 17 dossiers**, contrôles anonymes/origine/exposition réussis |
| Auth réelle des cinq comptes fictifs via Next local | Réussie : trois actifs autorisés et redirigés depuis la connexion, deux refusés ; cookies et déconnexion vérifiés |
| Supabase en lecture seule | Santé et réglages publics HTTP 200 ; inscription publique désactivée, anonyme refusé HTTP 401 |
| PT409 et stockage métier Cloud après correction | **Non testés** ; définitions SQL distantes non accessibles |
| Preview HTTPS, expiration/renouvellement réel, récupération | **Non testés** ; restent à réaliser séparément |

Preuves livrées : [JSON de finalisation](recette/2026-11-06-finalisation-code.json),
[footer mobile](recette/captures-finalisation/footer-mobile.png),
[footer ordinateur](recette/captures-finalisation/footer-ordinateur.png).
Les durées et limites détaillées sont dans la section de finalisation du
[rapport de recette](ESPACE_EQUIPE_RECETTE_FINALE.md).
Les tests locaux n’attestent ni l’application SQL distante ni la réussite d’une
Preview Vercel. Les sessions courtes ne valident pas un renouvellement après
expiration réelle.

## Configuration Vercel Preview à effectuer

Aucun outil Vercel connecté ni jeton Vercel n’est disponible. Le dashboard et les
variables distantes n’ont pas été consultés ou modifiés. **Aucune URL de Preview
de cette livraison n’est connue ou vérifiée.** Ne pas utiliser comme preuve une
ancienne Preview d’une autre branche ou prédire une URL.

1. Dans le projet Vercel existant lié à `kinnnisss/site-gites`, conserver la
   branche Production `main`. Ne changer aucun réglage Production ni réglage
   global qui l’affecterait. Le dépôt demande déjà Node `22.x` dans `package.json`.
2. Dans Settings → Environment Variables, sélectionner **Preview uniquement** et
   cibler précisément la branche **`fix/recette-espace-equipe`**. Examiner les
   variables héritées pour éviter tout rattachement à une base de production.
   Saisir les valeurs en privé depuis le dashboard du projet Supabase dev.
3. Configurer les variables du tableau. Tant que la conformité PT409 n’est pas
   vérifiée, garder `TEAM_INSPECTIONS_ENABLED=false` ; la connexion peut être
   testée, et le module affiche son indisponibilité explicitement.
4. Après preuve PT409 et contrôles d’accès conformes, passer le seul drapeau de
   cette Preview à `true`. Déclencher/rejouer uniquement un déploiement **Preview**
   de cette branche pour prendre les variables en compte. Vérifier son SHA,
   son statut Ready et `VERCEL_ENV=preview` fourni par Vercel, sans le remplacer.
5. Copier l’URL HTTPS réellement attribuée depuis Deployments. Tester cette URL
   avec le guide ; une protection de Preview éventuelle ne remplace pas Auth/RLS.
   Aucune promotion, affectation du domaine de production ou fusion.

| Variable | Valeur ou source | Portée |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS du seul projet `jijjjgsfdbrkvqvhyjwr` | Preview, branche de recette |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé **publishable** du même projet, saisie en privé | Même portée |
| `TEAM_INSPECTIONS_ENABLED` | `false` avant contrôle PT409, puis `true` seulement pour la recette validée | Même portée |
| `TEAM_APP_ORIGIN` | Facultative : origine HTTPS exacte de recette, sans chemin/paramètre, si le flux de récupération est préparé séparément | Même portée |

Ne copier **aucun** `TEAM_TEST_*_EMAIL`, `TEAM_TEST_*_PASSWORD`, mot de passe DB,
`service_role`, jeton administrateur, secret SMTP ou proxy Codex dans Vercel.
Ne renseigner ni falsifier `VERCEL_ENV` ou `NODE_ENV`. Sans `TEAM_APP_ORIGIN`, la
récupération reste désactivée ; ne pas envoyer d’e-mail ou modifier les réglages
Auth dans le cadre de cette livraison. La connexion par mot de passe reste
indépendante de cette option.

## Tests manuels et conditions avant production

Suivre [GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md](GUIDE_TESTS_MANUELS_ESPACE_EQUIPE.md)
sur la Preview réellement créée : footer, Admin/Agents, refus, dossier fictif,
sauvegarde/rechargement, inter-agents, conflits et conservation, Effacer,
impression/JSON, suppression confirmée et nettoyage différé, déconnexion.
Documenter aussi cookies HTTPS et renouvellement réel de session.

La PR doit rester **en brouillon**, non fusionnée, tant que la recette et les
conditions de production ne sont pas validées. Le nouveau lien n’est donc pas
publié sur la vitrine de production. Préparer séparément une base de production
isolée, Auth/migrations/administrateur approuvés, origine HTTPS, récupération,
sauvegardes/restauration, conservation et validation client. Ne jamais utiliser
la base de développement pour des données de voyageurs.

Le verrou `VERCEL_ENV=production` reste actif, même si le drapeau est `true`.
L’ouverture réelle nécessitera une modification distincte revue et autorisée,
puis une décision de publication explicite. Un build, une PR ou une Preview
réussie n’autorise pas cette ouverture.

## Livraison GitHub

[Branche de correction](https://github.com/kinnnisss/site-gites/tree/fix/recette-espace-equipe).
Titre demandé pour la PR : **Finalisation Espace Équipe — accès footer et préparation Vercel**.
La description doit conserver les résultats locaux/Auth réels, les limites SQL
Cloud et Preview, les variables nécessaires et les tests manuels restants.

Si l’API GitHub refuse la création, utiliser la
[comparaison vers main](https://github.com/kinnnisss/site-gites/compare/main...fix/recette-espace-equipe?expand=1),
puis « Create draft pull request », sans fusion ni fusion automatique. Une URL
de comparaison n’est pas une preuve de PR créée.
