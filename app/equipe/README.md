# Espace Équipe — Auth et dossiers privés

Le layout racine d’équipe est neutre, dynamique et `noindex` ; ces métadonnées
ne constituent pas une protection d’accès. Les routes Auth ne reprennent pas
le cadre du site public et ne modifient pas le formulaire d’état des lieux.

- `(auth)/connexion` : connexion e-mail/mot de passe, sans inscription.
- `(auth)/recuperation`, `confirmation`, `(prive)/mot-de-passe` : récupération
  réelle à configurer manuellement, sans SMTP inventé ni e-mail envoyé en test.
- `(prive)` : layout et pages qui vérifient chacun l’identité et le membre actif.
- `api/session` : état minimal, après vérification serveur.
- `api/membres/[id]` : modification rôle/activité réservée à l’admin actif, avec
  contrôle d’origine et RLS indépendant. Pas de création Auth ni d’invitation.
- `(prive)/etats-des-lieux` : liste minimale, création et ouverture du formulaire.
- `api/etats-des-lieux` : persistance validée, révisions atomiques et suppression
  administrative confirmée ; toutes les opérations passent par le JWT du membre.

`proxy.ts` renouvelle la session, mais chaque page/opération privée vérifie
elle-même l’accès. Le statut et le rôle viennent de `team_members`, jamais des
métadonnées saisissables par l’utilisateur. Les identités doivent être vérifiées
par Supabase Auth. Une configuration manquante ou un service inaccessible
refuse l’accès ; aucune authentification fictive n’existe.

Les dossiers restent fermés par défaut avec `TEAM_INSPECTIONS_ENABLED=false`,
jusqu’à la recette réelle Auth/RLS sur Supabase de développement. Le code refuse
aussi les dossiers lorsque `VERCEL_ENV=production`. Aucune migration distante
n’a été appliquée. Voir `docs/ESPACE_EQUIPE_PHASE_3.md` pour Auth et
`docs/ESPACE_EQUIPE_PHASE_4.md` pour la migration préparée, le détail des permissions,
les tests locaux et la recette manuelle restante. Aucune authentification de test
ou route de démonstration n’est livrée.
