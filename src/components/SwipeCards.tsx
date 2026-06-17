import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import wordBlitzCenter from "../assets/word_blitz_center.png";

const VISIBLE_CARDS = 3;

const SwipeCards = ({
  onSwipe,
  letter,
  question,
  questionsCount,
  isLocked = false,
}: {
  onSwipe: () => void;
  letter: string;
  question: string;
  questionsCount: number;

  isLocked?: boolean;
}) => {
  const [cards, setCards] = useState<Card[]>(createCardData(questionsCount));

  useEffect(() => {
    setCards(createCardData(questionsCount));
  }, [questionsCount]);

  const visibleCards = cards.slice(-VISIBLE_CARDS);

  return (
    <div
      role="region"
      aria-label="Swipe cards"
      className="grid h-104 w-full place-items-center"
    >
      {visibleCards.map((card) => {
        return (
          <CardItem
            key={card.id}
            setCards={setCards}
            cards={cards}
            {...card}
            onSwipe={onSwipe}
            letter={letter}
            question={question}
            isLocked={isLocked}
          />
        );
      })}
    </div>
  );
};
const CardItem = ({
  id,
  cards,
  setCards,
  onSwipe,
  letter,
  question,
  isLocked,
}: {
  id: number;
  setCards: Dispatch<SetStateAction<Card[]>>;
  cards: Card[];
  onSwipe: () => void;
  letter: string;
  question: string;
  isLocked: boolean;
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
    if (isLocked) return;
    if (Math.abs(x.get()) > 50) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

      setCards((prevValue: Card[]) =>
        prevValue.filter((card) => card.id !== id),
      );
      onSwipe();
    }
  };
  return (
    <motion.div
      aria-label={`Card: ${letter} – ${question}`}
      aria-roledescription="swipeable card"
      className={`relative inline-block h-96 w-72 origin-bottom transform-gpu overflow-hidden rounded-xl border bg-card antialiased ${
        isLocked
          ? "cursor-not-allowed"
          : "hover:cursor-grab active:cursor-grabbing"
      }`}
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFrontCard
          ? "0 24px 60px -20px oklch(0.511 0.262 276.966 / 0.35)"
          : "none",
      }}
      animate={{
        scale: isFrontCard ? 1.02 : 0.98,
      }}
      drag={isLocked ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-card to-accent/20" />

      {isFrontCard && (
        <>
          <div className="absolute left-4 top-4 size-10 rounded-full bg-primary/20 blur-xl" />
          <div className="absolute bottom-6 right-6 size-14 rounded-full bg-accent/30 blur-2xl" />
        </>
      )}

      <h2 className="absolute top-1/2 left-[15%] w-64 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-center text-3xl font-black text-primary">
        {letter} <span className="text-lg text-foreground">{question}</span>
      </h2>

      <img
        src={wordBlitzCenter}
        alt="word blitz"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 object-contain opacity-80 ${
          isFrontCard ? "drop-shadow-xl" : ""
        }`}
      />

      <h2 className="absolute top-1/2 right-[15%] w-64 translate-x-1/2 -translate-y-1/2 rotate-90 text-center text-3xl font-black text-primary">
        {letter} <span className="text-lg text-foreground">{question}</span>
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
