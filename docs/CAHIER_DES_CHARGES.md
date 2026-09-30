# Cahier des charges — Site internet de location de gîtes

Statut : document de travail.
Les fonctionnalités générales sont définies. Les informations de
l’entreprise et certaines règles métier seront complétées avec le client.

## 1. Présentation du projet

Créer un site internet professionnel permettant de présenter les gîtes
d’une entreprise et de faciliter les demandes de réservation.

Le site devra inspirer confiance, mettre en valeur les hébergements et
être simple à utiliser sur téléphone, tablette et ordinateur.

Il pourra s’inspirer de l’organisation de sites spécialisés comme
Gîtes de France, tout en conservant une identité visuelle propre.

## 2. Technologies retenues

- Next.js avec App Router
- TypeScript
- Tailwind CSS
- PostgreSQL hébergé par Supabase
- Vercel pour le déploiement
- Node.js 22 pour le développement local

Respecter la version installée des outils et les instructions de
AGENTS.md.

## 3. Gestion des informations en attente

Les valeurs entre doubles crochets sont des informations à compléter :

Exemple : [[NOM_ENTREPRISE]]

Ces placeholders servent à la documentation et à la configuration.
Ils ne doivent pas apparaître tels quels dans les pages du site.

Pendant le développement :
- utiliser des données fictives dans des fichiers séparés ;
- afficher une mention discrète et claire indiquant que le site présente
  des données de démonstration ;
- distinguer les données de démonstration des informations réelles ;
- éviter de répéter les informations de l’entreprise dans les composants ;
- permettre leur remplacement sans reconstruire l’interface ;
- masquer les éléments facultatifs dont les données manquent ;
- ne pas créer de faux avis, de faux labels ou de faux classements ;
- ne pas inventer de conditions commerciales ou juridiques.

Les coordonnées fictives ne doivent déclencher aucun envoi réel.
Un formulaire simulé doit indiquer clairement qu’aucune demande n’a
été transmise.

## 4. Informations de l’entreprise

À compléter par le client :

- Nom : [[NOM_ENTREPRISE]]
- Présentation courte : [[PRESENTATION_COURTE]]
- Présentation détaillée : [[PRESENTATION_ENTREPRISE]]
- Logo : [[LOGO]]
- Couleurs : [[COULEURS_MARQUE]]
- Adresse ou zone géographique : [[LOCALISATION_ENTREPRISE]]
- Téléphone : [[TELEPHONE]]
- WhatsApp : [[WHATSAPP]]
- E-mail : [[EMAIL]]
- Réseaux sociaux : [[RESEAUX_SOCIAUX]]

En attendant, utiliser une identité de démonstration neutre et facilement
remplaçable.

## 5. Pages prévues

### Accueil

Présenter :
- l’univers de l’entreprise ;
- une grande image ;
- une courte présentation ;
- une sélection de gîtes ;
- les accès à la recherche et aux hébergements ;
- les points forts validés par le client ;
- les moyens de contact disponibles.

### Liste des gîtes

Présenter les hébergements avec :
- photo principale ;
- nom ;
- localisation ;
- capacité ;
- courte description ;
- accès à la page détaillée.

Le prix ne sera affiché comme un tarif réel qu’après validation.

### Page détaillée d’un gîte

Présenter :
- galerie de photos avec affichage en grand ;
- description ;
- localisation ;
- capacité ;
- chambres et couchages ;
- équipements et services ;
- tarifs, lorsqu’ils sont disponibles ;
- informations pratiques ;
- règles de séjour ;
- accès aux disponibilités et à la demande de réservation.

### Informations pratiques

Présenter les informations fournies par le client :
- accès aux hébergements ;
- horaires ;
- règlement ;
- services ;
- activités à proximité ;
- questions fréquentes.

### Contact

Prévoir :
- formulaire ;
- téléphone ;
- e-mail ;
- WhatsApp.

Afficher uniquement les coordonnées renseignées et vérifiées.

### Administration

Prévoir un espace privé permettant de gérer :
- les gîtes ;
- les textes ;
- les photos ;
- les équipements ;
- les tarifs ;
- les disponibilités ;
- les demandes de réservation ;
- les informations de l’entreprise.

Son accès devra être protégé avant toute utilisation avec des données réelles.

## 6. Informations à fournir pour chaque gîte

- Nom : [[NOM_GITE]]
- Identifiant et URL : [[SLUG_GITE]]
- Localisation : [[LOCALISATION_GITE]]
- Adresse : [[ADRESSE_GITE]]
- Description courte : [[DESCRIPTION_COURTE_GITE]]
- Description détaillée : [[DESCRIPTION_GITE]]
- Capacité maximale : [[CAPACITE_GITE]]
- Nombre de chambres : [[NOMBRE_CHAMBRES]]
- Nombre et types de couchages : [[COUCHAGES]]
- Équipements : [[EQUIPEMENTS]]
- Services inclus : [[SERVICES_INCLUS]]
- Services payants : [[SERVICES_PAYANTS]]
- Photos et descriptions des photos : [[PHOTOS_GITE]]
- Tarifs et périodes tarifaires : [[TARIFS_GITE]]
- Frais supplémentaires : [[FRAIS_SUPPLEMENTAIRES]]
- Heure d’arrivée : [[HEURE_ARRIVEE]]
- Heure de départ : [[HEURE_DEPART]]
- Durée minimale de séjour : [[DUREE_MINIMALE]]
- Animaux acceptés : [[REGLE_ANIMAUX]]
- Autres règles : [[REGLES_GITE]]
- Activités à proximité : [[ACTIVITES_PROXIMITE]]
- Classement éventuel et justificatif : [[CLASSEMENT_VERIFIE]]

Ne pas afficher un classement en étoiles avant confirmation du client.

## 7. Recherche et disponibilités

Prévoir une recherche par :
- date d’arrivée ;
- date de départ ;
- nombre de personnes.

Vérifier :
- que la date de départ est postérieure à la date d’arrivée ;
- que le nombre de personnes est valide ;
- que la capacité du gîte est respectée.

Pendant la démonstration, les disponibilités peuvent être simulées,
à condition que leur caractère fictif soit explicite.

Avant une réservation réelle, les disponibilités devront être vérifiées
côté serveur et les chevauchements empêchés dans la base de données.

À définir avec le client :
- source des disponibilités : [[SOURCE_DISPONIBILITES]]
- présence sur d’autres plateformes : [[PLATEFORMES_EXTERNES]]
- besoin de synchronisation : [[SYNCHRONISATION_CALENDRIERS]]
- règles de blocage manuel : [[REGLES_BLOCAGE_DATES]]

## 8. Demande de réservation

Prévoir un formulaire comprenant :
- gîte choisi ;
- date d’arrivée ;
- date de départ ;
- nombre de personnes ;
- nom du visiteur ;
- e-mail ;
- téléphone ;
- demandes particulières.

Présenter un récapitulatif avant l’envoi.

Une demande de réservation et une réservation confirmée doivent être
clairement distinguées dans l’interface.

Pendant la démonstration :
- ne transmettre aucune demande réelle ;
- ne confirmer aucune réservation ;
- afficher explicitement le caractère simulé du formulaire.

À définir avec le client :
- mode de réservation : [[DEMANDE_OU_CONFIRMATION_IMMEDIATE]]
- responsable du traitement : [[RESPONSABLE_RESERVATIONS]]
- moyen de notification : [[NOTIFICATION_RESERVATIONS]]
- règles de confirmation : [[REGLES_CONFIRMATION]]
- durée éventuelle de blocage des dates : [[DUREE_BLOCAGE_TEMPORAIRE]]

## 9. Paiement et avance à la réservation

Le paiement en ligne reste une décision à valider.

À compléter :
- paiement en ligne souhaité : [[PAIEMENT_EN_LIGNE]]
- prestataire retenu : [[PRESTATAIRE_PAIEMENT]]
- paiement intégral ou partiel : [[MODE_PAIEMENT]]
- nature de l’avance, acompte ou arrhes : [[NATURE_AVANCE]]
- montant ou pourcentage : [[MONTANT_AVANCE]]
- échéance du solde : [[ECHEANCE_SOLDE]]
- modalités de paiement du solde : [[PAIEMENT_SOLDE]]
- conditions d’annulation : [[CONDITIONS_ANNULATION]]
- conditions de remboursement : [[CONDITIONS_REMBOURSEMENT]]
- dépôt de garantie éventuel : [[DEPOT_GARANTIE]]

Ne pas implémenter de paiement réel, de débit automatique ou de règles
de remboursement avant validation de ces éléments.

Prévoir une structure permettant d’ajouter cette fonctionnalité plus tard,
sans construire une intégration inutilisée dès maintenant.

## 10. Apparence et expérience utilisateur

Le site devra être :
- professionnel ;
- chaleureux ;
- moderne ;
- rassurant ;
- simple à parcourir.

Prévoir :
- navigation adaptée au téléphone ;
- textes lisibles ;
- boutons clairement identifiés ;
- formulaires avec libellés et messages d’erreur utiles ;
- navigation au clavier ;
- galerie accessible ;
- états de chargement et pages d’erreur.

La direction visuelle initiale est provisoire. Elle devra pouvoir évoluer
avec le logo, les couleurs et les photos du client.

## 11. Visibilité sur Internet

Prévoir :
- titres et descriptions des pages ;
- URLs lisibles ;
- informations structurées pour chaque gîte ;
- descriptions pertinentes des images ;
- sitemap et configuration d’indexation avant publication.

Ne pas faire indexer volontairement des pages présentant des informations
fictives comme une offre réelle.

## 12. Sécurité et données

Avant toute utilisation réelle :
- protéger l’administration ;
- contrôler les droits d’accès dans Supabase ;
- valider les données reçues côté serveur ;
- protéger les données personnelles des visiteurs ;
- conserver les secrets dans des variables d’environnement ;
- exclure les secrets de Git ;
- empêcher les réservations incompatibles sur les mêmes dates.

Les informations légales, la politique de confidentialité et les
conditions de réservation devront être fournies ou validées par le client.
Ne pas les inventer.

## 13. Ordre de réalisation

### Étape 1 — Interface de démonstration

Créer :
- accueil ;
- navigation ;
- liste des gîtes ;
- pages détaillées ;
- galerie ;
- pied de page ;
- données fictives séparées.

Le site doit fonctionner localement sans connexion à Supabase.

### Étape 2 — Parcours de démonstration

Ajouter :
- recherche avec données fictives ;
- affichage des disponibilités simulées ;
- formulaire de demande de réservation simulé ;
- récapitulatif ;
- validation des champs.

Aucune réservation ni transmission réelle à cette étape.

### Étape 3 — Données réelles et administration

Après clarification des règles métier :
- définir le schéma PostgreSQL ;
- connecter Supabase ;
- mettre en place l’authentification et les autorisations ;
- créer la gestion des gîtes, disponibilités et demandes ;
- remplacer les données de démonstration.

### Étape 4 — Paiement éventuel

Après validation explicite :
- intégrer le prestataire retenu ;
- gérer le paiement intégral ou l’avance ;
- suivre le solde ;
- traiter les événements de paiement et les remboursements ;
- tester les échecs et les doublons.

### Étape 5 — Publication

Avant publication :
- vérifier les contenus et coordonnées ;
- supprimer les simulations du parcours réel ;
- tester les parcours sur téléphone et ordinateur ;
- vérifier les droits d’accès ;
- valider les documents légaux ;
- configurer le domaine et le déploiement Vercel.

## 14. Critères de validation de la première version de démonstration

- Le projet démarre localement.
- Les pages prévues pour l’étape réalisée sont accessibles.
- La navigation fonctionne sur téléphone et ordinateur.
- Les données fictives sont centralisées et faciles à remplacer.
- Aucun placeholder brut n’apparaît dans l’interface.
- Aucun formulaire ne prétend envoyer une demande réelle.
- Les contrôles disponibles du projet sont exécutés.
- Les fonctionnalités réalisées et celles en attente sont documentées.

## 15. Validation par le client

- Responsable : [[RESPONSABLE_CLIENT]]
- Date de validation : [[DATE_VALIDATION]]
- Remarques : [[REMARQUES_CLIENT]]
- Statut : À compléter / À modifier / Validé