import React, { useState, useEffect } from "react";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";
import { Transition } from "@headlessui/react";

const CreatorCard = ({
  creator,
  userId,
  ownedQuantity = 0,
  averageBuyPrice,
}: {
  creator: any;
  userId: string;
  ownedQuantity?: number;
  averageBuyPrice: number | null;
}) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState(creator.price);

  const gainLossPercent =
    averageBuyPrice && averageBuyPrice > 0
      ? ((creator.price - averageBuyPrice) / averageBuyPrice) * 100
      : 0;

  useEffect(() => {
    if (creator.price !== prevPrice) {
      setPriceChange(creator.price - prevPrice);
      setPrevPrice(creator.price);

      // Reset price change animation after 2 seconds
      const timer = setTimeout(() => {
        setPriceChange(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [creator.price, prevPrice]);

  return (
    <Transition
      show={true}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-2xl p-5 items-center shadow hover:shadow-lg transition-all duration-300">
        <div className="flex">
          <div className="relative">
            <img
              src={creator.avatar}
              className="w-16 h-16 rounded-full border-2 border-[var(--accent)] object-cover mb-3"
              alt="creator avatar"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[var(--sidebar-bg)] bg-green-500"></div>
          </div>

          <div className="flex flex-col ml-4">
            {creator.ownerCount > 0 && (
              <p className="text-xs text-gray-400 mb-1">
                Owned by {creator.ownerCount} user{creator.ownerCount !== 1 ? "s" : ""}
              </p>
            )}
            {ownedQuantity > 0 && (
              <>
                <p className="text-sm text-[var(--accent)] font-medium mb-1">
                  Owned: {ownedQuantity}
                </p>
                <Transition
                  show={gainLossPercent !== null}
                  enter="transition ease-out duration-300"
                  enterFrom="opacity-0 -translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-1"
                >
                  <p
                    className={`text-sm font-semibold ${gainLossPercent >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                  >
                    ROI: {gainLossPercent?.toFixed(2)}%
                  </p>
                </Transition>
              </>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[var(--text)]">{creator.name}</h2>
        <p className="text-sm text-[var(--accent-text)] capitalize mb-1">{creator.platform}</p>

        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-300">
            Price: <span className="font-medium">{creator.price?.toFixed(2)} CC</span>
          </p>
          {priceChange !== null && (
            <Transition
              show={true}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <span className={`text-xs font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
              </span>
            </Transition>
          )}
        </div>

        {/* Buy/Sell Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowBuyModal(true)}
            className="px-4 py-1 rounded-full w-full text-sm font-semibold bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90 transition-all duration-300"
          >
            Buy
          </button>

          {ownedQuantity > 0 && (
            <button
              onClick={() => setShowSellModal(true)}
              className="px-4 py-1 rounded-full w-full text-sm font-semibold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-all duration-300"
            >
              Sell
            </button>
          )}
        </div>

        {/* Modals */}
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
    </Transition>
  );
};

export default CreatorCard;
