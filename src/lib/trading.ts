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

  // Fetch creator from Firestore or use fallback
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

  // Calculate price
  const price = calculateFinalPrice({
    subscribers: creator.subscribers,
    newSubscribers: 0, // optional for now
    newViews: creator.views, // or just 0 for static pricing
    postedThisWeek: false,
    totalBuys: buys,
    totalSells: sells,
  });

  const totalCost = price * quantity;

  if (currentBalance < totalCost) throw new Error("Insufficient balance");

  // 1. Deduct balance
  await updateDoc(userRef, {
    balance: currentBalance - totalCost,
  });

  // 2. Update portfolio
  const portfolioRef = doc(db, "users", userId, "portfolio", creator.id);
  const portfolioSnap = await getDoc(portfolioRef);

  if (portfolioSnap.exists()) {
    const existing = portfolioSnap.data();
    const newQuantity = existing.quantity + quantity;
    const newAvg = ((existing.averageBuyPrice * existing.quantity) + totalCost) / newQuantity;

    await updateDoc(portfolioRef, {
      quantity: newQuantity,
      averageBuyPrice: parseFloat(newAvg.toFixed(2)),
    });
  } else {
    await setDoc(portfolioRef, {
      creatorId: creator.id,
      name: creator.name,
      platform: creator.platform,
      quantity,
      averageBuyPrice: price,
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

  // 4. Update creator market data
  await setDoc(
    creatorRef,
    {
      id: creator.id,
      name: creator.name,
      platform: creator.platform,
      subscribers: creator.subscribers,
      views: creator.views,
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