import { type QuestionSource } from "../db/db.ts";

type QuestionSourceToggleProps = {
  questionSource: QuestionSource;
  onChange: (value: QuestionSource) => void;
};

type Option = {
  value: QuestionSource;
  label: string;
};

const OPTIONS: Option[] = [
  { value: "default", label: "Only default" },
  { value: "custom", label: "Only custom" },
  { value: "both", label: "Both" },
];

export default function QuestionSourceToggle({
  questionSource,
  onChange,
}: QuestionSourceToggleProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white px-4 py-3">
      <p className="text-sm font-semibold text-slate-700">Question source</p>
      <p className="mt-1 text-xs text-slate-500">
        Choose which prompts to play with.
      </p>
      <div
        role="radiogroup"
        aria-label="Question source"
        className="mt-3 grid grid-cols-3 gap-2"
      >
        {OPTIONS.map((option) => {
          const isActive = questionSource === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={
                isActive
                  ? "rounded-xl bg-green-300! text-slate-900! shadow-sm"
                  : "rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
