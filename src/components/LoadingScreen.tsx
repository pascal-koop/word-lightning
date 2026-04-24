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
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/80 px-8 py-10 shadow-xl backdrop-blur">
        <span
          aria-hidden="true"
          className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
        />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
