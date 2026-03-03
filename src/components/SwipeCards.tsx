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
      className="h-96 w-72 relative inline-block antialiased transform-gpu overflow-hidden bg-[#FAF9F6] ring-2 ring-black rounded-lg hover:cursor-grab active:cursor-grabbing origin-bottom"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFrontCard
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb (0 0 0 / 0.5)"
          : undefined,
      }}
      animate={{
        scale: isFrontCard ? 1.005 : 1,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <h2 className=" text-3xl text-blue-800 font-extrabold absolute top-1/2 left-[15%] w-48 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-center">
        {letter} <span className="text-lg text-black">{question}</span>
      </h2>

      <img
        src="/src/assets/word_blitz_center.png"
        alt="word blitz"
        className="w-64 h-64 object-contain bg-transparent opacity-80 pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <h2 className="text-3xl text-blue-800 font-extrabold absolute top-1/2 right-[15%] w-48 translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-center">
        {letter} <span className="text-lg text-black">{question}</span>
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
