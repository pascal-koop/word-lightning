export type Theme = {
  id: string;
  name: string;
  questions: string[];
};

export const THEMES: Theme[] = [
  {
    id: "animals",
    name: "Animals",
    questions: [
      "Is a mammal",
      "Lives in water",
      "Can fly",
      "Has fur",
      "Lives in the forest",
      "Is a pet",
      "Is a predator",
      "Lays eggs",
      "Has four legs",
      "Lives in Africa",
    ],
  },
  {
    id: "+18",
    name: "+18",
    questions: [
      "Finds man in the night",
      "Is only for adults",
      "Is on a cocktail card",
      "Is a taboo theme at the family dinner",
      "Toys to play with together",
      "Is popular on weekends",
    ],
  },
];

export function findThemeById(themeId: string): Theme | undefined {
  return THEMES.find((theme) => theme.id === themeId);
}
