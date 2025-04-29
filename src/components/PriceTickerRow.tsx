import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface PriceTickerRowProps {
  creator: {
    id: string;
    name: string;
    platform: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
  };
}

const PriceTickerRow: React.FC<PriceTickerRowProps> = ({ creator }) => {
  const priceChangeColor = creator.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
  const priceChangeIcon = creator.priceChange24h >= 0 ? (
    <ArrowTrendingUpIcon className="w-4 h-4" />
  ) : (
    <ArrowTrendingDownIcon className="w-4 h-4" />
  );

  return (
    <tr className="border-t border-[var(--accent)]/20 hover:bg-[var(--accent)]/5 transition-colors">
      <td className="p-2">
        <div className="flex items-center gap-2">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${creator.name}`}
            alt={creator.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{creator.name}</p>
            <p className="text-xs text-[var(--text)]/70 capitalize">{creator.platform}</p>
          </div>
        </div>
      </td>
      <td className="p-2">
        <p className="text-sm font-medium text-[var(--text)]">
          {creator.price.toFixed(2)} CC
        </p>
      </td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          {priceChangeIcon}
          <span className={`text-sm font-medium ${priceChangeColor}`}>
            {creator.priceChange24h >= 0 ? '+' : ''}{creator.priceChange24h.toFixed(2)}%
          </span>
        </div>
      </td>
      <td className="p-2">
        <p className="text-sm text-[var(--text)]">
          {creator.volume24h.toLocaleString()} CC
        </p>
      </td>
      <td className="p-2">
        <p className="text-sm text-[var(--text)]">
          {creator.marketCap.toLocaleString()} CC
        </p>
      </td>
    </tr>
  );
};

export default PriceTickerRow; 