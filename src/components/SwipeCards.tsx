import { motion, useMotionValue, useTransform } from "motion/react";
import { useState, type Dispatch, type SetStateAction } from "react";

const SwipeCards = ({ onSwipe }: { onSwipe: () => void }) => {
  const [cards, setCards] = useState<Card[]>(cardData);
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
          />
        );
      })}
    </div>
  );
};
const Card = ({
  id,
  url,
  cards,
  setCards,
  onSwipe,
}: {
  id: number;
  url: string;
  setCards: Dispatch<SetStateAction<Card[]>>;
  cards: Card[];
  onSwipe: () => void;
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
    <motion.img
      src={url}
      alt={`card ${id}`}
      className="h-96 w-72 object-cover rounded-lg hover:cursor-grab active:cursor-grabbing origin-bottom"
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
    />
  );
};

type Card = {
  id: number;
  url: string;
};

const cardData: Card[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=2235&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2224&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1570464197285-9949814674a7?q=80&w=2273&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1578608712688-36b5be8823dc?q=80&w=2187&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1505784045224-1247b2b29cf3?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default SwipeCards;
