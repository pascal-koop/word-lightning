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
  const [cards, setCards] = useState<Card[]>(
    createCardData(questionsCount),
  );

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
    const offSet = isFrontCard ? 0 : id % 2 ? 2 : -2;
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
      className="h-96 w-72 object-cover bg-gray-200 border-2 border-gray-300 rounded-lg hover:cursor-grab active:cursor-grabbing origin-bottom"
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
      <h2 className="text-2xl font-bold">{letter}</h2>
      <p className="text-sm text-gray-500">{question}</p>
    </motion.div>
  );
};

type Card = {
  id: number;
};

const createCardData = (count: number): Card[] =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1 }));

export default SwipeCards;
