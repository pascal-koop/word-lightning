import { Card, CardContent } from "@/components/ui/card";

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({
  message = "Loading your questions…",
}: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-8 py-10">
          <span
            aria-hidden="true"
            className="inline-block size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"
          />
          <p className="text-sm font-semibold text-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
