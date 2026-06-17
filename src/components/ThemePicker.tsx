import type { Theme } from "../game/themes";
import type { PlaySelection } from "../game/playSelection";
import { Button } from "@/components/ui/button";

type ThemePickerProps = {
  themes: Theme[];
  selection: PlaySelection;
  onSelectTheme: (themeId: string) => void;
  onClearTheme: () => void;
};

export default function ThemePicker({
  themes,
  selection,
  onSelectTheme,
  onClearTheme,
}: ThemePickerProps) {
  const isThemeActive = selection.mode === "theme";

  return (
    <section aria-labelledby="themes-heading">
      <div className="flex items-center justify-between">
        <h4
          id="themes-heading"
          className="text-sm font-semibold text-foreground"
        >
          Themes
        </h4>
        {isThemeActive && (
          <Button variant="ghost" size="sm" onClick={onClearTheme}>
            Clear theme
          </Button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        A theme is played without any other questions.
      </p>
      <div
        role="radiogroup"
        aria-label="Themes"
        className="mt-3 grid grid-cols-2 gap-2"
      >
        {themes.map((theme) => {
          const isActive =
            selection.mode === "theme" && selection.themeId === theme.id;
          return (
            <Button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              variant={isActive ? "default" : "secondary"}
              className="flex h-auto flex-col py-2"
              onClick={() =>
                isActive ? onClearTheme() : onSelectTheme(theme.id)
              }
            >
              {theme.name}
              <span className="text-[10px] font-normal opacity-70">
                {theme.questions.length} questions
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
