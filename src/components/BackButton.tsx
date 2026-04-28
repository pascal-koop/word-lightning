export default function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
      onClick={onBack}
    >
      Back
    </button>
  );
}
