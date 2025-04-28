import React, { useState } from "react";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";

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

  const gainLossPercent =
    averageBuyPrice && averageBuyPrice > 0
      ? ((creator.price - averageBuyPrice) / averageBuyPrice) * 100
      : null;

  return (
    <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-2xl p-5 items-center shadow hover:shadow-lg transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex">
        <img
          src={creator.avatar}
          className="w-16 h-16 rounded-full border-2 border-[var(--accent)] object-cover mb-3"
          alt="creator avatar"
        />

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
              {gainLossPercent !== null && (
                <p
                  className={`text-sm font-semibold ${gainLossPercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                >
                  ROI: {gainLossPercent.toFixed(2)}%
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[var(--text)]">{creator.name}</h2>
      <p className="text-sm text-[var(--accent-text)] capitalize mb-1">{creator.platform}</p>

      <p className="text-sm text-gray-300 mb-1">
        Price: <span className="font-medium">{creator.price?.toFixed(2)} CC</span>
      </p>


      {/* Buy/Sell Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setShowBuyModal(true)}
          className="px-4 py-1 rounded-full w-full text-sm font-semibold bg-[var(--accent)] text-[var(--accent-text)] hover:opacity-90 transition"
        >
          Buy
        </button>

        {ownedQuantity > 0 && (
          <button
            onClick={() => setShowSellModal(true)}
            className="px-4 py-1 rounded-full w-full text-sm font-semibold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition"
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
  );
};

export default CreatorCard;
