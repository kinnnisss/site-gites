# Espace Équipe — Auth préparée, phase 3

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

`proxy.ts` renouvelle la session, mais chaque page/opération privée vérifie
elle-même l’accès. Le statut et le rôle viennent de `team_members`, jamais des
métadonnées saisissables par l’utilisateur. Les identités doivent être vérifiées
par Supabase Auth. Une configuration manquante ou un service inaccessible
refuse l’accès ; aucune authentification fictive n’existe.

Le formulaire reste non monté jusqu’à la recette réelle des accès. Aucune table,
route ou persistance de dossier n’est créée ici. Voir
`docs/ESPACE_EQUIPE_PHASE_3.md` pour les SQL à examiner, les variables, les étapes
manuelles dans Supabase et les tests restant à effectuer.
