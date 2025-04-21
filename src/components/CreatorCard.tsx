import React from 'react';

interface Creator {
  id: string;
  name: string;
  platform: "youtube" | "twitch";
  avatar: string;
  subscribers: number;
  views: number;
  isLive: boolean;
  price: number;
}

const CreatorCard = ({ creator }: { creator: Creator }) => {
  return (
    <div className="bg-theme text-theme border border-accent rounded-lg p-4 flex flex-col items-center gap-3 shadow-md">
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-16 h-16 rounded-full border-2 border-accent"
      />
      <div className="text-center">
        <h2 className="font-semibold text-lg">{creator.name}</h2>
        <p className="text-sm text-theme/70 capitalize">{creator.platform}</p>
      </div>
      <div className="text-sm text-theme">
        <p>Subscribers: {creator.subscribers.toLocaleString()}</p>
        <p>Views: {creator.views.toLocaleString()}</p>
        {creator.isLive && (
          <span className="text-xs font-bold text-red-500">LIVE</span>
        )}
      </div>
      <div className="mt-2 px-3 py-1 bg-accent text-accent-text rounded-full text-sm font-medium">
        ${creator.price.toFixed(2)}
      </div>
    </div>
  );
};

export default CreatorCard;
