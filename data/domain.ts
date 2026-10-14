/** Informations validées par le client. Les valeurs absentes restent vides. */
export type DomainPhoto = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

export type ContactDetails = {
  phone: string;
  whatsapp: string;
  email: string;
};

const house = { area: 100, bedrooms: 3, bathrooms: 2, toilets: 2 };
const gardenArea = 10000;
const number = (value: number): string => value.toLocaleString("fr-FR");
const name = "Domaine Lo Carmalhon";
const town = "Saint-Aulaye-Puymangou";

export const domain = {
  name,
  location: `${town} · Dordogne`,
  tagline: "Une parenthèse de calme au cœur de la Dordogne",
  // À renseigner après confirmation du domaine de production (ex. https://…).
  siteUrl: "",
  logoAlt: `Blason rouge et or du ${name}`,
  address: {
    street: "8 rue Jean Jaurès",
    postalCode: "24410",
    town,
    country: "France",
  },
  description: `À ${town}, le ${name} vous accueille dans une maison de ${number(house.area)} m² entièrement rénovée. Une grande pièce de vie et une cuisine entièrement équipée composent les espaces du quotidien, prolongés à l’extérieur par une terrasse et un jardin de ${number(gardenArea)} m².`,
  house,
  gardenArea,
  highlights: [
    {
      value: `${number(house.area)} m²`,
      label: "Maison entièrement rénovée",
      title: "La maison",
      description:
        "Un intérieur rénové avec une grande pièce de vie et une cuisine équipée.",
    },
    {
      value: String(house.bedrooms),
      label: "Chambres",
      title: "Les espaces de repos",
      description: "Trois chambres composent la partie nuit de la maison.",
    },
    {
      value: String(house.bathrooms),
      label: "Salles de bain",
      title: "Au quotidien",
      description:
        "Deux salles de bain et deux toilettes complètent les espaces intérieurs.",
    },
    {
      value: `${number(gardenArea)} m²`,
      label: "De jardin",
      title: "Jardin & piscine",
      description:
        "Les extérieurs accueillent une piscine, une terrasse et des espaces de loisirs.",
    },
  ],
  houseFeatures: [
    `${house.bedrooms} chambres`,
    `${house.bathrooms} salles de bain`,
    `${house.toilets} toilettes`,
    "Grande pièce de vie",
  ],
  houseDetails: [
    {
      title: "Grande pièce de vie",
      description: "Un espace commun au cœur de la maison.",
    },
    {
      title: "Cuisine entièrement équipée",
      description:
        "Réfrigérateur, congélateur, lave-vaisselle, four et micro-ondes.",
    },
    {
      title: `${house.bedrooms} chambres`,
      description: "Les espaces de repos de la maison.",
    },
    {
      title: `${house.bathrooms} salles de bain & ${house.toilets} toilettes`,
      description: "Les équipements sanitaires de la maison.",
    },
  ],
  amenities: [
    {
      title: "Une cuisine entièrement équipée",
      description:
        "Les équipements pour préparer et partager vos repas sur place.",
      note: "La cuisine réunit les appareils nécessaires à la préparation et à la conservation des repas.",
      items: [
        "Réfrigérateur",
        "Congélateur",
        "Lave-vaisselle",
        "Four",
        "Micro-ondes",
      ],
    },
    {
      title: "Le confort au quotidien",
      description:
        "Des équipements pratiques pour le linge et le confort intérieur.",
      note: "Des moustiquaires équipent toutes les fenêtres et portes-fenêtres.",
      items: [
        "Lave-linge",
        "Sèche-linge",
        "Climatisation réversible",
        "Moustiquaires à toutes les fenêtres et portes-fenêtres",
      ],
    },
  ],
  outdoors: [
    {
      title: "Au grand air",
      items: [`Jardin de ${number(gardenArea)} m²`, "Piscine"],
    },
    {
      title: "Autour de la table",
      items: [
        "Terrasse extérieure",
        "Salon de jardin",
        "Espace repas",
        "Barbecue / plancha",
      ],
    },
    {
      title: "Le temps des loisirs",
      items: ["Espace loisirs", "Terrain de pétanque", "Terrain de volley"],
    },
  ],
  equestrian: ["Écurie", "2 boxes", "Carrière", "Paddock"],
  schedule: {
    arrival: "Samedi à partir de 16 h",
    departure: "Samedi avant 10 h",
  },
  contact: { phone: "", whatsapp: "", email: "" } satisfies ContactDetails,
  seo: {
    title: `${name} | Gîte à ${town}`,
    description: `Découvrez le ${name}, une maison entièrement rénovée avec piscine et grand jardin à ${town}, en Dordogne.`,
  },
};

/** Ajouter un chemin /images/… et un alt décrivant la vraie photo pour l’afficher. */
export const photos = {
  hero: { id: "hero", label: "Le domaine", src: "", alt: "" },
  house: { id: "house", label: "La maison", src: "", alt: "" },
  bedrooms: { id: "bedrooms", label: "Les chambres", src: "", alt: "" },
  living: { id: "living", label: "Les pièces de vie", src: "", alt: "" },
  kitchen: { id: "kitchen", label: "La cuisine", src: "", alt: "" },
  terrace: { id: "terrace", label: "La terrasse", src: "", alt: "" },
  garden: { id: "garden", label: "Le jardin", src: "", alt: "" },
  pool: { id: "pool", label: "La piscine", src: "", alt: "" },
  equestrian: {
    id: "equestrian",
    label: "Les installations équestres",
    src: "",
    alt: "",
  },
} satisfies Record<string, DomainPhoto>;

export const gallery: readonly DomainPhoto[] = [
  photos.house,
  photos.bedrooms,
  photos.living,
  photos.kitchen,
  photos.terrace,
  photos.garden,
  photos.pool,
  photos.equestrian,
];

export const navigation = [
  { id: "accueil", label: "Accueil" },
  { id: "domaine", label: "Le domaine" },
  { id: "maison", label: "La maison" },
  { id: "equipements", label: "Équipements" },
  { id: "exterieurs", label: "Extérieurs" },
  { id: "galerie", label: "Galerie" },
  { id: "informations", label: "Informations pratiques" },
  { id: "contact", label: "Contact" },
] as const;

export const addressText = `${domain.address.street}, ${domain.address.postalCode} ${domain.address.town}, ${domain.address.country}`;
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
