export type Theme = {
  id: string;
  name: string;
  questions: string[];
};

export const THEMES: Theme[] = [
  {
    id: "tiere",
    name: "Tiere",
    questions: [
      "Ist ein Säugetier",
      "Lebt im Wasser",
      "Kann fliegen",
      "Hat ein Fell",
      "Lebt im Wald",
      "Ist ein Haustier",
      "Ist ein Raubtier",
      "Legt Eier",
      "Hat vier Beine",
      "Lebt in Afrika",
    ],
  },
  {
    id: "ab18",
    name: "Ab 18",
    questions: [
      "Findet man im Nachtleben",
      "Gibt es nur für Erwachsene",
      "Steht auf einer Cocktailkarte",
      "Ist ein Tabuthema beim Familienessen",
      "Kostet Eintritt ab 18",
      "Macht man am Wochenende",
    ],
  },
];

export function findThemeById(themeId: string): Theme | undefined {
  return THEMES.find((theme) => theme.id === themeId);
}
