import { Button } from "@/components/ui/button";

export default function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button variant="outline" onClick={onBack}>
      Back
    </Button>
  );
}
