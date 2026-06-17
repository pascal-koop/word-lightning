import { type QuestionSource } from "../db/db.ts";
import { Button } from "@/components/ui/button";

type QuestionSourceToggleProps = {
  questionSource: QuestionSource;
  onChange: (value: QuestionSource) => void;
  withBorder?: boolean;
};

type Option = {
  value: QuestionSource;
  label: string;
};

const OPTIONS: Option[] = [
  { value: "default", label: "Default" },
  { value: "custom", label: "Custom" },
  { value: "both", label: "Both" },
];

export default function QuestionSourceToggle({
  questionSource,
  onChange,
}: QuestionSourceToggleProps) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-sm font-semibold text-foreground">Question source</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose which prompts to play with.
      </p>
      <div
        role="radiogroup"
        aria-label="Question source"
        className="mt-3 flex items-center justify-center gap-2 md:gap-4"
      >
        {OPTIONS.map((option) => {
          const isActive = questionSource === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
