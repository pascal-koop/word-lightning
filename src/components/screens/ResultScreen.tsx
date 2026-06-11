import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import type { Player } from "../../game/initialState";
import { rankPlayers } from "../../game/players";

type ResultScreenProps = {
  players: Player[];
  onRestart: () => void;
};

function fireConfetti() {
  const end = Date.now() + 2_500;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}

const WINNER_SPLASH_DURATION_MS = 2_200;

export default function ResultScreen({
  players,
  onRestart,
}: ResultScreenProps) {
  const ranked = rankPlayers(players);
  const topScore = ranked[0]?.score ?? 0;
  const hasAnyScore = topScore > 0;

  const winners = hasAnyScore
    ? ranked.filter((p) => p.score === topScore)
    : [];

  const winnerLabel =
    winners.length === 1
      ? winners[0].name
      : winners.map((w) => w.name).join(" & ");

  const [showSplash, setShowSplash] = useState(hasAnyScore);

  useEffect(() => {
    if (!hasAnyScore) return;

    fireConfetti();

    const timer = setTimeout(
      () => setShowSplash(false),
      WINNER_SPLASH_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [hasAnyScore]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {/* ── Winner splash overlay ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.span
              className="text-6xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              🏆
            </motion.span>

            <motion.h1
              className="px-4 text-center text-5xl font-black tracking-tight text-indigo-600 drop-shadow-lg sm:text-6xl"
              initial={{ scale: 0.3, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.15,
              }}
            >
              {winnerLabel}
            </motion.h1>

            <motion.p
              className="text-lg font-semibold text-indigo-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {winners.length > 1 ? "Winners!" : "Winner!"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Score card ── */}
      <motion.div
        className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur"
        initial={hasAnyScore ? { opacity: 0, y: 20 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={
          hasAnyScore
            ? { delay: WINNER_SPLASH_DURATION_MS / 1000 - 0.3, duration: 0.4 }
            : undefined
        }
      >
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Round over
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Final scores
          </h2>
          {!hasAnyScore && (
            <p className="mt-2 text-sm text-slate-600">
              No points were awarded this round.
            </p>
          )}
        </div>

        {ranked.length > 0 ? (
          <ol
            aria-label="Scoreboard"
            className="mb-6 flex flex-col gap-2"
          >
            {ranked.map((player, index) => {
              const isWinner = hasAnyScore && player.score === topScore;
              return (
                <li
                  key={player.id}
                  className={
                    isWinner
                      ? "flex items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-md"
                      : "flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 text-slate-900"
                  }
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        isWinner
                          ? "text-lg font-black"
                          : "text-sm font-semibold text-slate-500"
                      }
                    >
                      #{index + 1}
                    </span>
                    <span className="font-semibold">{player.name}</span>
                  </span>
                  <span
                    className={
                      isWinner
                        ? "text-2xl font-black"
                        : "text-xl font-bold text-indigo-700"
                    }
                  >
                    {player.score}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mb-6 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
            No players were registered for this round.
          </p>
        )}

        <button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onRestart}
        >
          Play again
        </button>
      </motion.div>
    </div>
  );
}
