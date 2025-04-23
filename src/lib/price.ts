// Optionally: import helper for clamping
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

export const calculateFinalPrice = ({
  subscribers,
  newSubscribers,
  newViews,
  newComments = 0,
  postedThisWeek = false,
  totalBuys,
  totalSells,
}: {
  subscribers: number;
  newSubscribers: number;
  newViews: number;
  newComments?: number;
  postedThisWeek?: boolean;
  totalBuys: number;
  totalSells: number;
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

  return clamp(parseFloat(rawPrice.toFixed(2)), 50, 10_000);
};
