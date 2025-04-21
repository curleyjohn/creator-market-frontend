export const calculatePrice = (subs: number, views: number): number => {
  const base = 10;
  const price =
    base + subs * 0.01 + views * 0.00001;
  return parseFloat(price.toFixed(2));
};
