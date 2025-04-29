import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon, UserIcon } from "@heroicons/react/24/outline";
import PriceHistoryGraph from "./PriceHistoryGraph";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";

interface CreatorCardProps {
  creator: any;
  userId: string | undefined;
  ownedQuantity: number;
  averageBuyPrice: number | null;
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  userId,
  ownedQuantity,
  averageBuyPrice,
}) => {
  const { user } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [price, setPrice] = useState(creator.price || 0);
  const [priceChange, setPriceChange] = useState(creator.priceChange || 0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const creatorRef = doc(db, "creators", creator.id);
    const unsubscribe = onSnapshot(creatorRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPrice(data.price || 0);
        setPriceChange(data.priceChange || 0);
        setKey(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [creator.id]);

  const calculateROI = () => {
    if (!averageBuyPrice) return 0;
    return ((price - averageBuyPrice) / averageBuyPrice) * 100;
  };

  const roi = calculateROI();
  const isPositiveROI = roi > 0;

  return (
    <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-2xl p-4 hover:border-[var(--accent)]/40 transition-all duration-300 group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={creator.profileImage || `https://ui-avatars.com/api/?name=${creator.name}&background=random`}
              alt={creator.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--accent)]/20 group-hover:ring-[var(--accent)]/40 transition-all duration-300"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--sidebar-bg)] bg-green-500"></div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">{creator.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[var(--text)]/60 capitalize">{creator.platform}</p>
              <span className="text-xs text-[var(--text)]/40">•</span>
              <p className="text-xs text-[var(--text)]/60">
                {creator.ownerCount || 0} owner{(creator.ownerCount || 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {priceChange > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${priceChange > 0 ? "text-green-500" : "text-red-500"}`}>
            {priceChange > 0 ? "+" : ""}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="mb-3 h-24">
        <PriceHistoryGraph key={key} creatorId={creator.id} />
      </div>

      <div className="flex-grow flex flex-col justify-end gap-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[var(--bg)]/50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <CurrencyDollarIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
              <p className="text-xs text-[var(--text)]/60">Price</p>
            </div>
            <p className="text-sm font-bold text-[var(--text)]">${price.toFixed(2)}</p>
          </div>
          <div className="bg-[var(--bg)]/50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <UserIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
              <p className="text-xs text-[var(--text)]/60">Owned</p>
            </div>
            <p className="text-sm font-bold text-[var(--text)]">{ownedQuantity}</p>
          </div>
          <div className="bg-[var(--bg)]/50 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <UserIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
              <p className="text-xs text-[var(--text)]/60">Owners</p>
            </div>
            <p className="text-sm font-bold text-[var(--text)]">{creator.ownerCount || 0}</p>
          </div>
        </div>

        {averageBuyPrice !== null && (
          <div className="bg-[var(--bg)]/50 rounded-lg p-2">
            <p className="text-xs text-[var(--text)]/60 mb-0.5">ROI</p>
            <p className={`text-sm font-bold ${isPositiveROI ? "text-green-500" : "text-red-500"}`}>
              {isPositiveROI ? "+" : ""}{roi.toFixed(2)}%
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex-1 bg-[var(--accent)] text-[var(--accent-text)] py-1.5 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Buy
          </button>
          <button
            onClick={() => setShowSellModal(true)}
            className="flex-1 bg-[var(--accent)]/10 text-[var(--accent)] py-1.5 px-4 rounded-lg text-sm font-medium hover:bg-[var(--accent)]/20 transition-colors"
            disabled={ownedQuantity === 0}
          >
            Sell
          </button>
        </div>
      </div>

      {showBuyModal && (
        <BuyModal
          userId={userId}
          creator={creator}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {showSellModal && (
        <SellModal
          userId={userId}
          creator={creator}
          ownedQuantity={ownedQuantity}
          onClose={() => setShowSellModal(false)}
        />
      )}
    </div>
  );
};

export default CreatorCard;
