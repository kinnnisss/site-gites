/** Contenu entièrement fictif : à remplacer après validation du client. */
export type DemoGite = {
  id: string;
  name: string;
  ambiance: string;
  description: string;
  guests: number;
  bedrooms: number;
  palette: "olive" | "clay" | "sage";
};

export const demoSite = {
  name: "La Parenthèse",
  label: "Nom de démonstration",
  notice: "Site de démonstration · Hébergements fictifs · Aucune réservation possible",
};

export const demoGites: readonly DemoGite[] = [
  { id: "oliviers", name: "La Maison des Oliviers", ambiance: "Un petit refuge à deux", description: "Une maison imaginée autour d’une terrasse ombragée, pour les petits-déjeuners qui prennent leur temps.", guests: 2, bedrooms: 1, palette: "olive" },
  { id: "grange", name: "La Grange aux Volets Bleus", ambiance: "Les retrouvailles en famille", description: "Un gîte fictif aux volumes généreux, pensé pour les grandes tablées et les moments partagés.", guests: 6, bedrooms: 3, palette: "clay" },
  { id: "jardin", name: "Le Cottage du Jardin", ambiance: "Une échappée au vert", description: "Un cocon imaginaire ouvert sur le jardin, pour lire, se retrouver et savourer les journées tranquilles.", guests: 4, bedrooms: 2, palette: "sage" },
];
