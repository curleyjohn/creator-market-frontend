import { db } from "./firebase";
import {
  doc,
  increment,
  collection,
  serverTimestamp,
  runTransaction,
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
  const creatorRef = doc(db, "creators", creator.id);
  const portfolioRef = doc(db, "users", userId, "portfolio", creator.id);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const creatorSnap = await transaction.get(creatorRef);
    const portfolioSnap = await transaction.get(portfolioRef);

    if (!userSnap.exists()) throw new Error("User not found");

    const userData = userSnap.data();
    const currentBalance = userData.balance;

    let buys = 0;
    let sells = 0;

    if (creatorSnap.exists()) {
      const creatorData = creatorSnap.data();
      buys = creatorData.buys || 0;
      sells = creatorData.sells || 0;
    }

    const livePrice = calculateFinalPrice({
      subscribers: creator.subscribers,
      newSubscribers: 0,
      newViews: creator.views,
      postedThisWeek: false,
      totalBuys: buys,
      totalSells: sells,
    });

    const totalCost = livePrice * quantity;

    if (currentBalance < totalCost) {
      throw new Error("Insufficient balance");
    }

    // 1. Deduct user balance
    transaction.update(userRef, {
      balance: currentBalance - totalCost,
    });

    // 2. Update portfolio
    let oldQuantity = 0;
    if (portfolioSnap.exists()) {
      const portfolioData = portfolioSnap.data();
      oldQuantity = portfolioData.quantity || 0;
    }

    const newQuantity = oldQuantity + quantity;

    if (portfolioSnap.exists()) {
      const oldAverage = portfolioSnap.data().averageBuyPrice || 0;
      const newAverageBuyPrice =
        ((oldAverage * oldQuantity) + (livePrice * quantity)) / newQuantity;

      transaction.update(portfolioRef, {
        quantity: newQuantity,
        averageBuyPrice: parseFloat(newAverageBuyPrice.toFixed(2)),
      });
    } else {
      transaction.set(portfolioRef, {
        creatorId: creator.id,
        name: creator.name,
        platform: creator.platform,
        quantity,
        averageBuyPrice: parseFloat(livePrice.toFixed(2)),
      });
    }

    // 👉 ownerCount update if first time owning
    if (oldQuantity === 0 && newQuantity > 0) {
      transaction.update(creatorRef, {
        ownerCount: increment(1),
      });
    }

    // 3. Update creator buys and recalculate price
    transaction.update(creatorRef, {
      buys: increment(quantity),
      lastUpdated: serverTimestamp(),
      price: calculateFinalPrice({
        subscribers: creator.subscribers,
        newSubscribers: 0,
        newViews: creator.views,
        postedThisWeek: false,
        totalBuys: buys + quantity,
        totalSells: sells,
      }),
    });

    // 4. Log transaction
    transaction.set(doc(collection(db, "users", userId, "transactions")), {
      type: "buy",
      creatorId: creator.id,
      platform: creator.platform,
      quantity,
      price: livePrice,
      total: totalCost,
      timestamp: serverTimestamp(),
    });
  });
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

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const portfolioSnap = await transaction.get(portfolioRef);
    const creatorSnap = await transaction.get(creatorRef);

    if (!userSnap.exists()) throw new Error("User not found");
    if (!portfolioSnap.exists()) throw new Error("You don't own this creator");

    const userData = userSnap.data();
    const portfolioData = portfolioSnap.data();
    const currentBalance = userData.balance;

    if (portfolioData.quantity < quantity) {
      throw new Error("Not enough quantity to sell");
    }

    const buys = creatorSnap.exists() ? creatorSnap.data().buys || 0 : 0;
    const sells = creatorSnap.exists() ? creatorSnap.data().sells || 0 : 0;

    const livePrice = calculateFinalPrice({
      subscribers: creator.subscribers,
      newSubscribers: 0,
      newViews: creator.views,
      postedThisWeek: false,
      totalBuys: buys,
      totalSells: sells,
    });

    const totalValue = livePrice * quantity;

    // 1. Update user balance
    transaction.update(userRef, {
      balance: currentBalance + totalValue,
    });

    const oldQuantity = portfolioData.quantity || 0;
    const newQuantity = oldQuantity - quantity;

    // 2. Update or delete portfolio
    if (newQuantity <= 0) {
      transaction.delete(portfolioRef);
    } else {
      transaction.update(portfolioRef, {
        quantity: newQuantity,
      });
    }

    // 👉 ownerCount update if selling out fully
    if (oldQuantity > 0 && newQuantity === 0) {
      transaction.update(creatorRef, {
        ownerCount: increment(-1),
      });
    }

    // 3. Update creator sells and recalculate price
    transaction.update(creatorRef, {
      sells: increment(quantity),
      lastUpdated: serverTimestamp(),
      price: calculateFinalPrice({
        subscribers: creator.subscribers,
        newSubscribers: 0,
        newViews: creator.views,
        postedThisWeek: false,
        totalBuys: buys,
        totalSells: sells + quantity,
      }),
    });

    // 4. Log transaction
    transaction.set(doc(collection(db, "users", userId, "transactions")), {
      type: "sell",
      creatorId: creator.id,
      platform: creator.platform,
      quantity,
      price: livePrice,
      total: totalValue,
      timestamp: serverTimestamp(),
    });
  });
};