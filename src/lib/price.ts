import { db } from "./firebase";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";

// Helper for clamping values
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const calculateBasePrice = (subs: number) => {
  if (subs < 10_000) return 100;
  if (subs < 100_000) return 300;
  if (subs < 1_000_000) return 600;
  return 1000;
};

export const calculatePerformanceAdjustment = ({
  newSubscribers,
  newViews,
  newComments = 0,
  postedThisWeek = false,
}: {
  newSubscribers: number;
  newViews: number;
  newComments?: number;
  postedThisWeek?: boolean;
}) => {
  const subBonus = (newSubscribers / 100) * 0.5;
  const viewBonus = (newViews / 1000) * 0.1;
  const commentBonus = (newComments / 100) * 0.3;
  const postBonus = postedThisWeek ? 0.5 : 0;

  return subBonus + viewBonus + commentBonus + postBonus;
};

export const calculateTradingAdjustment = (
  totalBuys: number,
  totalSells: number
) => {
  return (totalBuys - totalSells) * 0.25;
};

export const calculateFinalPrice = async ({
  subscribers,
  newSubscribers,
  newViews,
  newComments = 0,
  postedThisWeek = false,
  totalBuys,
  totalSells,
  creatorId,
}: {
  subscribers: number;
  newSubscribers: number;
  newViews: number;
  newComments?: number;
  postedThisWeek?: boolean;
  totalBuys: number;
  totalSells: number;
  creatorId?: string;
}) => {
  const base = calculateBasePrice(subscribers);
  const perf = calculatePerformanceAdjustment({
    newSubscribers,
    newViews,
    newComments,
    postedThisWeek,
  });
  const market = calculateTradingAdjustment(totalBuys, totalSells);
  const rawPrice = base + perf + market;
  const finalPrice = clamp(parseFloat(rawPrice.toFixed(2)), 50, 10_000);

  // Save price history if creatorId is provided
  if (creatorId) {
    const historyRef = doc(collection(db, "creators", creatorId, "priceHistory"));
    await setDoc(historyRef, {
      price: finalPrice,
      timestamp: serverTimestamp(),
    });
  }

  return finalPrice;
};

export const savePriceHistory = async (creatorId: string, price: number) => {
  const historyRef = doc(collection(db, "creators", creatorId, "priceHistory"));
  await setDoc(historyRef, {
    price,
    timestamp: serverTimestamp(),
  });
};
