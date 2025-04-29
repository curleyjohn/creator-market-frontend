import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transition } from '@headlessui/react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import PriceTickerRow from '../components/PriceTickerRow';

interface MarketStats {
  totalMarketCap: number;
  tradingVolume24h: number;
  activeTraders: number;
  priceChange24h: number;
}

interface Creator {
  id: string;
  name: string;
  platform: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

const MarketPage = () => {
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 0,
    tradingVolume24h: 0,
    activeTraders: 0,
    priceChange24h: 0
  });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const creatorsRef = collection(db, 'creators');
    const usersRef = collection(db, 'users');

    // Listen to creators for market cap and prices
    const unsubCreators = onSnapshot(creatorsRef, (snapshot) => {
      let totalCap = 0;
      let totalPriceChange = 0;
      const creatorsData: Creator[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const marketCap = (data.price || 0) * (data.ownerCount || 0);
        totalCap += marketCap;

        // Get price history for this creator
        const priceHistoryRef = collection(db, 'creators', doc.id, 'priceHistory');
        const priceHistoryQuery = query(
          priceHistoryRef,
          orderBy('timestamp', 'desc')
        );

        const unsubPriceHistory = onSnapshot(priceHistoryQuery, (priceHistorySnap) => {
          const now = new Date();
          const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          let priceChange24h = 0;
          const currentPrice = data.price || 0;

          // Find the price from 24 hours ago
          const oldPriceDoc = priceHistorySnap.docs.find(doc => {
            const timestamp = doc.data().timestamp;
            return timestamp && timestamp.toDate && timestamp.toDate() <= last24h;
          });

          if (oldPriceDoc) {
            const oldPrice = oldPriceDoc.data().price || 0;
            priceChange24h = ((currentPrice - oldPrice) / oldPrice) * 100;
          }

          // Update the creator's price change
          setCreators(prev => {
            const updated = prev.map(creator => {
              if (creator.id === doc.id) {
                return { ...creator, priceChange24h };
              }
              return creator;
            });

            // Update total price change
            setMarketStats(prev => {
              const newTotalChange = updated.reduce((sum: number, creator: Creator) => sum + creator.priceChange24h, 0);
              const avgChange = updated.length > 0 ? newTotalChange / updated.length : 0;
              return { ...prev, priceChange24h: avgChange };
            });

            return updated;
          });
        });

        creatorsData.push({
          id: doc.id,
          name: data.name,
          platform: data.platform,
          price: data.price || 0,
          priceChange24h: 0, // Will be updated by price history listener
          volume24h: data.volume24h || 0,
          marketCap
        });

        return unsubPriceHistory;
      });

      setCreators(creatorsData);
      setMarketStats(prev => ({
        ...prev,
        totalMarketCap: totalCap
      }));
    });

    // Listen to all users' transactions
    const unsubUsers = onSnapshot(usersRef, (usersSnapshot) => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let volume = 0;
      const traders = new Set<string>();
      const creatorVolumes: { [id: string]: number } = {};

      // Process each user's transactions
      usersSnapshot.forEach(userDoc => {
        const transactionsRef = collection(db, 'users', userDoc.id, 'transactions');
        const unsubTransactions = onSnapshot(
          query(transactionsRef, orderBy('timestamp', 'desc')),
          (transactionsSnapshot) => {
            let userHasTraded = false;

            transactionsSnapshot.forEach(doc => {
              const data = doc.data();
              const timestamp = data.timestamp;
              if (timestamp && timestamp.toDate && timestamp.toDate() > last24h) {
                const transactionAmount = data.quantity * data.price;
                volume += transactionAmount;
                userHasTraded = true;
                creatorVolumes[data.creatorId] = (creatorVolumes[data.creatorId] || 0) + transactionAmount;
              }
            });

            // Only add the user to traders set if they have traded in the last 24h
            if (userHasTraded) {
              traders.add(userDoc.id);
            }

            setMarketStats(prev => ({
              ...prev,
              tradingVolume24h: volume,
              activeTraders: traders.size
            }));

            // Update creator volumes
            setCreators(prev => prev.map(creator => ({
              ...creator,
              volume24h: creatorVolumes[creator.id] || 0
            })));
          }
        );

        return unsubTransactions;
      });
    });

    setLoading(false);

    return () => {
      unsubCreators();
      unsubUsers();
    };
  }, []);

  // Sort creators by price change for top gainers/losers
  const sortedByGain = [...creators].sort((a, b) => b.priceChange24h - a.priceChange24h);
  const topGainers = sortedByGain.slice(0, 5);
  const topLosers = sortedByGain.slice(-5).reverse();

  return (
    <div className="h-full overflow-auto p-6">
      <Transition
        show={!loading}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div>
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Market Cap */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-sm font-medium text-[var(--text)]/70">Market Cap</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">
                {marketStats.totalMarketCap.toLocaleString()} CC
              </p>
            </div>

            {/* 24h Volume */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-sm font-medium text-[var(--text)]/70">24h Volume</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">
                {marketStats.tradingVolume24h.toLocaleString()} CC
              </p>
            </div>

            {/* Active Traders */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-sm font-medium text-[var(--text)]/70">Active Traders</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">
                {marketStats.activeTraders.toLocaleString()}
              </p>
            </div>

            {/* 24h Change */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {marketStats.priceChange24h >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                )}
                <h3 className="text-sm font-medium text-[var(--text)]/70">24h Change</h3>
              </div>
              <p className={`text-2xl font-bold ${marketStats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketStats.priceChange24h >= 0 ? '+' : ''}{marketStats.priceChange24h.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Price Ticker */}
          <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4 mb-8">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Live Prices</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[var(--text)]/70">
                    <th className="p-2">Creator</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">24h Change</th>
                    <th className="p-2">24h Volume</th>
                    <th className="p-2">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map(creator => (
                    <PriceTickerRow key={creator.id} creator={creator} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Gainers */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Top Gainers</h2>
              <div className="space-y-2">
                {topGainers.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--accent)]/5">
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
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        +{creator.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Top Losers</h2>
              <div className="space-y-2">
                {topLosers.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--accent)]/5">
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
                    <div className="flex items-center gap-1">
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        {creator.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Transition>

      {/* Loading State */}
      <Transition
        show={loading}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-xl p-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default MarketPage; 