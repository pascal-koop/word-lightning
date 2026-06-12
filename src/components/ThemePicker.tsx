import type { Theme } from "../game/themes";
import type { PlaySelection } from "../game/playSelection";

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
          className="text-sm font-semibold text-slate-700"
        >
          Themes
        </h4>
        {isThemeActive && (
          <button
            type="button"
            onClick={onClearTheme}
            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Clear theme
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
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
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() =>
                isActive ? onClearTheme() : onSelectTheme(theme.id)
              }
              className={
                isActive
                  ? "rounded-xl bg-green-300! text-slate-900! shadow-sm"
                  : "rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              }
            >
              {theme.name}
              <span className="block text-[10px] font-normal opacity-70">
                {theme.questions.length} questions
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
