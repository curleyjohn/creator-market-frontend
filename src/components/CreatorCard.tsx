import React from 'react';
import { useState } from 'react';
import BuyModal from './BuyModal';
import SellModal from './SellModal';

const CreatorCard = ({ creator, userId, ownedQuantity = 0 }: { creator: any; userId: string, ownedQuantity?: number }) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  return (
    <div className="bg-theme border border-accent p-4 rounded-lg flex flex-col items-center">
      <img src={creator.avatar} className="w-16 h-16 rounded-full border-accent border-2" alt="creator-avatar" />
      <h2 className="mt-2 font-semibold text-lg">{creator.name}</h2>
      <p className="text-sm text-theme/60 capitalize">{creator.platform}</p>
      <p className="text-sm">Price: {creator.price?.toFixed(2)} CC</p>
      {ownedQuantity > 0 && (
        <p className="text-sm text-[var(--accent)] font-medium mt-1">
          Owned: {ownedQuantity}
        </p>
      )}

      <div className='flex items-center mt-4 gap-3'>
        <button
          onClick={() => setShowBuyModal(true)}
          className="bg-accent text-accent-text px-4 py-1 rounded-full font-semibold"
        >
          Buy
        </button>

        {showBuyModal && (
          <BuyModal
            userId={userId}
            creator={creator}
            onClose={() => setShowBuyModal(false)}
          />
        )}

        {ownedQuantity > 0 && (
          <button
            onClick={() => setShowSellModal(true)}
            className="bg-transparent border border-accent text-accent px-4 py-1 rounded-full font-semibold"
          >
            Sell
          </button>
        )}
      </div>

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