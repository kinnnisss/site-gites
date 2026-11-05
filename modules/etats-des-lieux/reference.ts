// Exact content from the immutable client HTML; keep order and punctuation.
export const checks = [
  [
    "Chambres & literie",
    "Trois chambres propres et aérées ; lits et linge en bon état",
    false
  ],
  [
    "Chambres & literie",
    "Serviettes, tapis de bain et torchons disponibles",
    false
  ],
  [
    "Salles de bain",
    "Douches, lavabos, WC et sanitaires propres et fonctionnels",
    false
  ],
  [
    "Cuisine",
    "Cuisine, vaisselle et plans de travail en bon état",
    false
  ],
  [
    "Cuisine",
    "Réfrigérateur, four, micro-ondes et lave-vaisselle fonctionnels",
    false
  ],
  [
    "Salon & équipements",
    "Mobilier, télévision, Wi-Fi et climatisation en état",
    false
  ],
  [
    "Salon & équipements",
    "Portes, fenêtres, serrures et éclairage fonctionnels",
    false
  ],
  [
    "Extérieurs",
    "Terrasse, mobilier et espaces de jardin autorisés en bon état",
    false
  ],
  [
    "Extérieurs",
    "Équipements de pétanque et de volley vérifiés",
    false
  ],
  [
    "Sécurité",
    "Détecteur de fumée et équipements de sécurité vérifiés",
    true
  ],
  [
    "Sécurité",
    "Piscine en travaux inaccessible aux voyageurs",
    true
  ],
  [
    "Sécurité",
    "Chantier physiquement sécurisé, accès dangereux impossibles",
    true
  ],
  [
    "Clés",
    "Jeu de clés remis à l’entrée / restitué au départ",
    false
  ]
] as const;

export const stepsList = {
  "entree": [
    "Vérifier le nom du titulaire de la réservation.",
    "Faire visiter le gîte avec les vacanciers.",
    "Présenter les principaux équipements et leur fonctionnement.",
    "Expliquer la sécurité et l'interdiction d'accès à la piscine en travaux.",
    "Vérifier ensemble l'état général du logement.",
    "Signaler et noter les éventuelles dégradations déjà présentes.",
    "Remettre un jeu de clés aux vacanciers.",
    "Rappeler les horaires, les contacts utiles et les consignes de départ."
  ],
  "sortie": [
    "Récupérer les clés en main propre avant 10 h.",
    "Vérifier rapidement l'état général des pièces.",
    "Contrôler les meubles et les équipements principaux.",
    "Signaler toute dégradation constatée.",
    "Vérifier les huit consignes de départ.",
    "Remercier les vacanciers pour leur séjour.",
    "Inviter les vacanciers à laisser un avis sur le gîte."
  ],
  "consignes": [
    "Faire la vaisselle et vider le lave-vaisselle.",
    "Vider les poubelles en respectant le tri sélectif.",
    "Retirer les aliments personnels du réfrigérateur.",
    "Regrouper les serviettes utilisées dans les salles de bain.",
    "Laisser les draps sur les lits.",
    "Remettre les meubles et objets à leur place.",
    "Fermer les fenêtres et éteindre les lumières.",
    "Restituer les clés en main propre."
  ]
} as const;

export const rules = [
  [
    "Capacité",
    "Le gîte est prévu pour un maximum de 6 voyageurs. Toute modification du nombre d’occupants doit être confirmée avec le responsable."
  ],
  [
    "Arrivée et départ",
    "Accueil en personne entre 16 h et 19 h ; départ au plus tard à 10 h. Remise et restitution des clés en main propre."
  ],
  [
    "Piscine et chantier",
    "La piscine est en travaux, indisponible et strictement interdite d’accès. Les zones de chantier sont interdites aux voyageurs."
  ],
  [
    "Sécurité",
    "Les enfants restent sous la surveillance d’un adulte responsable. Ne franchissez jamais les protections des zones de travaux."
  ],
  [
    "Respect des lieux",
    "Prenez soin du mobilier et des équipements ; signalez dès que possible toute panne, fuite ou dégradation constatée."
  ],
  [
    "Tri et fin de séjour",
    "Respectez le tri des déchets et les huit consignes de départ indiquées dans cette page."
  ],
  [
    "Assistance",
    "Assistance habituelle de 8 h à 22 h au 07 83 58 63 12. Pour un danger immédiat, appelez d’abord le 112."
  ]
] as const;
