import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import SparklineChart from "./SparklineChart";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";
import { formatNumber } from '../lib/utils';

interface PricePoint {
  price: number;
  timestamp: Date;
}

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    platform: "youtube" | "twitch";
    price: number;
    priceChange: number;
    imageUrl?: string;
    subscribers: number;
    views: number;
    ownerCount?: number;
  };
  userId?: string;
  ownedQuantity?: number;
  averageBuyPrice?: number;
}

export const CreatorCard = ({ creator, userId, ownedQuantity = 0, averageBuyPrice = 0 }: CreatorCardProps) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [creatorData, setCreatorData] = useState({
    price: creator.price,
    priceChange: creator.priceChange || 0,
    ownerCount: 0,
    subscribers: creator.subscribers || 0,
    views: creator.views || 0,
    lastUpdated: new Date(),
  });

  const roi = averageBuyPrice > 0 ? ((creatorData.price - averageBuyPrice) / averageBuyPrice) * 100 : 0;

  // Generate profile image from name if no imageUrl provided
  const profileImage = creator.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`;

  // Listen for real-time creator updates
  useEffect(() => {
    const creatorRef = doc(db, 'creators', creator.id);

    const unsubscribe = onSnapshot(creatorRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const ownerCount = typeof data.ownerCount === 'number' ? data.ownerCount : 0;

        setCreatorData(prevData => ({
          ...prevData,
          price: data.price || prevData.price,
          priceChange: data.priceChange || 0,
          ownerCount: ownerCount,
          subscribers: data.subscribers || prevData.subscribers,
          views: data.views || prevData.views,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        }));
      }
    }, (error) => {
      console.error('Error listening to creator updates:', error);
    });

    return () => unsubscribe();
  }, [creator.id]);

  // Fetch and listen for price history updates
  useEffect(() => {
    const priceHistoryRef = collection(db, 'creators', creator.id, 'priceHistory');
    const q = query(
      priceHistoryRef,
      orderBy('timestamp', 'desc'),
      limit(49) // Reduce limit by 1 to make room for current price
    );

    // Real-time listener for price history
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp;
          if (timestamp && typeof timestamp.toDate === 'function') {
            return {
              price: data.price,
              timestamp: timestamp.toDate()
            };
          }
          return null;
        })
        .filter((item): item is PricePoint => item !== null)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort descending first
        .slice(0, 49) // Keep only the most recent 49 points
        .reverse(); // Reverse to get ascending order

      // Always add the current price as the latest point
      history.push({
        price: creatorData.price,
        timestamp: creatorData.lastUpdated || new Date()
      });

      setPriceHistory(history);
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to price history:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [creator.id, creatorData.price, creatorData.lastUpdated]);

  const priceChangeColor = creatorData.priceChange >= 0 ? 'text-green-500' : 'text-red-500';
  const priceChangeIcon = creatorData.priceChange >= 0 ? (
    <ArrowUpIcon className="w-4 h-4" />
  ) : (
    <ArrowDownIcon className="w-4 h-4" />
  );

  return (
    <div className="relative rounded-xl bg-card border border-border hover:border-border-hover transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={profileImage}
            alt={creator.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-foreground">{creator.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground capitalize">{creator.platform}</span>
              {creatorData.ownerCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  · {formatNumber(creatorData.ownerCount)} owner{creatorData.ownerCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price and Chart */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">
              {creatorData.price.toFixed(2)} CC
            </span>
            <div className={`flex items-center gap-1 text-sm ${priceChangeColor}`}>
              {priceChangeIcon}
              <span className="font-medium">
                {Math.abs(creatorData.priceChange).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="h-[120px] -mx-4 -mb-4 relative">
            {isLoading ? (
              <div className="w-full h-full bg-gray-800/50 animate-pulse" />
            ) : (
              <SparklineChart
                data={priceHistory.map(p => p.price)}
                timestamps={priceHistory.map(p => p.timestamp)}
                width={300}
                height={120}
                color={creatorData.priceChange >= 0 ? '#10B981' : '#EF4444'}
                showArea={true}
              />
            )}
          </div>
        </div>

        {/* Holdings Info */}
        {userId && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-2 bg-muted rounded-lg text-sm">
            <div>
              <div className="text-muted-foreground">Owned</div>
              <div className="font-medium">{ownedQuantity}</div>
            </div>
            {ownedQuantity > 0 && (
              <div>
                <div className="text-muted-foreground">ROI</div>
                <div className={`font-medium ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {roi.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Buy
          </button>
          {ownedQuantity > 0 && (
            <button
              onClick={() => setShowSellModal(true)}
              className="flex-1 px-4 py-2 text-sm font-medium border border-border hover:bg-muted rounded-lg transition-colors"
            >
              Sell
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <BuyModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        creator={{
          ...creator,
          price: creatorData.price,
          subscribers: creatorData.subscribers,
          views: creatorData.views
        }}
        userId={userId}
      />
      <SellModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        creator={{
          ...creator,
          price: creatorData.price,
          subscribers: creatorData.subscribers,
          views: creatorData.views
        }}
        userId={userId}
        ownedQuantity={ownedQuantity}
      />
    </div>
  );
};

export default CreatorCard;
