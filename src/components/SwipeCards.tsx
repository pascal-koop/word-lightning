import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const SwipeCards = ({
  onSwipe,
  letter,
  question,
  questionsCount,
}: {
  onSwipe: () => void;
  letter: string;
  question: string;
  questionsCount: number;
}) => {
  const [cards, setCards] = useState<Card[]>(createCardData(questionsCount));

  useEffect(() => {
    setCards(createCardData(questionsCount));
  }, [questionsCount]);
  return (
    <div className="grid place-items-center">
      {cards.map((card) => {
        return (
          <Card
            key={card.id}
            setCards={setCards}
            cards={cards}
            {...card}
            onSwipe={onSwipe}
            letter={letter}
            question={question}
          />
        );
      })}
    </div>
  );
};
const Card = ({
  id,
  cards,
  setCards,
  onSwipe,
  letter,
  question,
}: {
  id: number;
  setCards: Dispatch<SetStateAction<Card[]>>;
  cards: Card[];
  onSwipe: () => void;
  letter: string;
  question: string;
}) => {
  const x = useMotionValue(0);

  const opacity = useTransform(x, [-150, 0, 150], [0.9, 1, 0.9]);
  const rotateRaw = useTransform(x, [-100, 0, 100], [-10, 0, 10]);
  const isFrontCard = id === cards[cards.length - 1].id;
  const rotate = useTransform(() => {
    const offSet = isFrontCard ? 0 : id % 2 ? 1 : -1;
    return `${rotateRaw.get() + offSet}deg`;
  });
  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 50) {
      // get rid of current card
      setCards((prevValue: Card[]) =>
        prevValue.filter((card) => card.id !== id),
      );
      onSwipe();
    }
  };
  return (
    <motion.div
      className="relative inline-block h-96 w-72 origin-bottom transform-gpu overflow-hidden rounded-3xl border border-white/70 bg-white/80 antialiased hover:cursor-grab active:cursor-grabbing"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFrontCard
          ? "0 4px 18px -4px rgba(15, 23, 42, 0.13)"
          : "0 2px 8px -2px rgba(15, 23, 42, 0.10)",
      }}
      animate={{
        scale: isFrontCard ? 1.02 : 0.98,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50/70 via-white to-pink-50/70" />
      <div className="absolute left-4 top-4 h-10 w-10 rounded-full bg-indigo-500/20 blur-xl" />
      <div className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-pink-400/20 blur-2xl" />

      <h2 className="absolute top-1/2 left-[15%] w-48 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-center text-3xl font-black text-indigo-700">
        {letter} <span className="text-lg text-slate-800">{question}</span>
      </h2>

      <img
        src="/src/assets/word_blitz_center.png"
        alt="word blitz"
        className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 object-contain opacity-80 drop-shadow-xl"
      />

      <h2 className="absolute top-1/2 right-[15%] w-48 translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-center text-3xl font-black text-indigo-700">
        {letter} <span className="text-lg text-slate-800">{question}</span>
      </h2>
    </motion.div>
  );
};

type Card = {
  id: number;
};

const createCardData = (count: number): Card[] =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1 }));

export default SwipeCards;
