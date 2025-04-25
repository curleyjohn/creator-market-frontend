import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { calculateFinalPrice } from "./price";

export const buyCreator = async ({
  userId,
  creator,
  quantity,
}: {
  userId: string;
  creator: {
    id: string;
    name: string;
    platform: "youtube" | "twitch";
    subscribers: number;
    views: number;
  };
  quantity: number;
}) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error("User not found");

  const userData = userSnap.data();
  const currentBalance = userData.balance;

  const creatorRef = doc(db, "creators", creator.id);
  const creatorSnap = await getDoc(creatorRef);

  if (!creatorSnap.exists()) {
    await setDoc(creatorRef, {
      id: creator.id,
      name: creator.name,
      platform: creator.platform,
      subscribers: creator.subscribers,
      views: creator.views,
      buys: 0,
      sells: 0,
      price: 0,
      lastUpdated: serverTimestamp(),
    });
  }

  const buys = creatorSnap.exists() ? creatorSnap.data().buys || 0 : 0;
  const sells = creatorSnap.exists() ? creatorSnap.data().sells || 0 : 0;

  // Calculate live price
  const price = calculateFinalPrice({
    subscribers: creator.subscribers,
    newSubscribers: 0,
    newViews: creator.views,
    postedThisWeek: false,
    totalBuys: buys,
    totalSells: sells,
  });

  const totalCost = price * quantity;

  if (currentBalance < totalCost) throw new Error("Insufficient balance");

  // 1. Deduct user balance
  await updateDoc(userRef, {
    balance: currentBalance - totalCost,
  });

  // 2. Update portfolio (average buy price logic here)
  const portfolioRef = doc(db, "users", userId, "portfolio", creator.id);
  const portfolioSnap = await getDoc(portfolioRef);

  if (portfolioSnap.exists()) {
    const existing = portfolioSnap.data();
    const oldQuantity = existing.quantity || 0;
    const oldAverage = existing.averageBuyPrice || 0;

    const newQuantity = oldQuantity + quantity;
    const newAverageBuyPrice = ((oldAverage * oldQuantity) + (price * quantity)) / newQuantity;

    await updateDoc(portfolioRef, {
      quantity: newQuantity,
      averageBuyPrice: parseFloat(newAverageBuyPrice.toFixed(2)),
    });
  } else {
    await setDoc(portfolioRef, {
      creatorId: creator.id,
      name: creator.name,
      platform: creator.platform,
      quantity,
      averageBuyPrice: parseFloat(price.toFixed(2)),
    });
  }

  // 3. Log transaction
  await addDoc(collection(db, "users", userId, "transactions"), {
    type: "buy",
    creatorId: creator.id,
    platform: creator.platform,
    quantity,
    price,
    total: totalCost,
    timestamp: serverTimestamp(),
  });

  // 4. Update creator stats
  await setDoc(
    creatorRef,
    {
      buys: increment(quantity),
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
};

export const sellCreator = async ({
  userId,
  creator,
  quantity,
}: {
  userId: string;
  creator: {
    id: string;
    name: string;
    platform: "youtube" | "twitch";
    subscribers: number;
    views: number;
  };
  quantity: number;
}) => {
  const userRef = doc(db, "users", userId);
  const portfolioRef = doc(db, "users", userId, "portfolio", creator.id);
  const creatorRef = doc(db, "creators", creator.id);

  const [userSnap, portfolioSnap, creatorSnap] = await Promise.all([
    getDoc(userRef),
    getDoc(portfolioRef),
    getDoc(creatorRef),
  ]);

  if (!userSnap.exists()) throw new Error("User not found");
  if (!portfolioSnap.exists()) throw new Error("You don't own this creator");

  const userData = userSnap.data();
  const portfolioData = portfolioSnap.data();
  const currentBalance = userData.balance;

  if (portfolioData.quantity < quantity) {
    throw new Error("Not enough to sell");
  }

  const buys = creatorSnap.exists() ? creatorSnap.data().buys || 0 : 0;
  const sells = creatorSnap.exists() ? creatorSnap.data().sells || 0 : 0;

  const price = calculateFinalPrice({
    subscribers: creator.subscribers,
    newSubscribers: 0,
    newViews: creator.views,
    postedThisWeek: false,
    totalBuys: buys,
    totalSells: sells,
  });

  const totalValue = price * quantity;

  // 1. Update user balance
  await updateDoc(userRef, {
    balance: currentBalance + totalValue,
  });

  // 2. Update or delete portfolio
  if (portfolioData.quantity === quantity) {
    await deleteDoc(portfolioRef);
  } else {
    await updateDoc(portfolioRef, {
      quantity: portfolioData.quantity - quantity,
    });
  }

  // 3. Log transaction
  await addDoc(collection(db, "users", userId, "transactions"), {
    type: "sell",
    creatorId: creator.id,
    platform: creator.platform,
    quantity,
    price,
    total: totalValue,
    timestamp: serverTimestamp(),
  });

  // 4. Update creator stats
  await setDoc(
    creatorRef,
    {
      sells: increment(quantity),
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
};
