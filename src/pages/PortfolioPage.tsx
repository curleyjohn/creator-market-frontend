import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { Transition } from "@headlessui/react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import PriceHistoryGraph from "../components/PriceHistoryGraph";

interface PortfolioItem {
  id: string;
  creatorId: string;
  name: string;
  platform: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  value: number;
}

const PortfolioPage = () => {
  const { user } = useAuth();
  const [portfolioDocs, setPortfolioDocs] = useState<any[]>([]);
  const [creatorsDocs, setCreatorsDocs] = useState<{ [id: string]: any }>({});
  const [portfolioReady, setPortfolioReady] = useState(false);
  const [creatorsReady, setCreatorsReady] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const portfolioRef = collection(db, "users", user.uid, "portfolio");
    const creatorsRef = collection(db, "creators");

    // 🔹 Listen portfolio
    const unsubPortfolio = onSnapshot(portfolioRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        creatorId: doc.id,
        ...doc.data(),
      }));
      setPortfolioDocs(items);
      setPortfolioReady(true);
    });

    // 🔹 Listen creators
    const unsubCreators = onSnapshot(creatorsRef, (snapshot) => {
      const items: { [id: string]: any } = {};
      snapshot.docs.forEach((doc) => {
        items[doc.id] = doc.data();
      });
      setCreatorsDocs(items);
      setCreatorsReady(true);
    });

    return () => {
      unsubPortfolio();
      unsubCreators();
    };
  }, [user?.uid]);

  const loading = !(portfolioReady && creatorsReady);

  const combinedPortfolio = portfolioDocs.map((item) => {
    const creator = creatorsDocs[item.creatorId];
    const currentPrice = creator?.price || 0;
    const value = currentPrice * item.quantity;

    return {
      ...item,
      currentPrice,
      value,
    };
  });

  const totalValue = combinedPortfolio.reduce((sum, item) => sum + item.value, 0);
  const totalGainLoss = combinedPortfolio.reduce((sum, item) => {
    const gainLoss = item.quantity * (item.currentPrice - item.averageBuyPrice);
    return sum + gainLoss;
  }, 0);
  const totalGainLossPercent = combinedPortfolio.reduce((sum, item) => {
    const gainLossPercent = ((item.currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100;
    return sum + gainLossPercent;
  }, 0) / (combinedPortfolio.length || 1);

  if (!user) return null;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Your Portfolio</h1>
          <p className="text-sm text-[var(--text)]/60">Track your creator investments</p>
        </div>
      </div>

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
          {combinedPortfolio.length === 0 ? (
            <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No Creators Yet</h3>
              <p className="text-sm text-[var(--text)]/60 mb-6">Start building your portfolio by investing in creators.</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-text font-medium hover:opacity-90 transition-opacity"
              >
                Explore Creators
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Portfolio Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-[var(--text)]/60" />
                    <h3 className="text-sm font-medium text-[var(--text)]/60">Total Value</h3>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text)]">
                    {totalValue.toLocaleString()} CC
                  </p>
                </div>

                <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-[var(--text)]/60" />
                    <h3 className="text-sm font-medium text-[var(--text)]/60">Total Gain/Loss</h3>
                  </div>
                  <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalGainLoss >= 0 ? "+" : ""}{totalGainLoss.toLocaleString()} CC
                  </p>
                </div>

                <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-[var(--text)]/60" />
                    <h3 className="text-sm font-medium text-[var(--text)]/60">Average Return</h3>
                  </div>
                  <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Portfolio Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinedPortfolio.map((item) => {
                  const gainLossPercent =
                    ((item.currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100;

                  return (
                    <div
                      key={item.creatorId}
                      className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-2xl p-4 hover:border-[var(--accent)]/40 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={`https://ui-avatars.com/api/?name=${item.name}&background=random`}
                              alt={item.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--accent)]/20"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--sidebar-bg)] bg-green-500"></div>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-[var(--text)]">{item.name}</h3>
                            <p className="text-xs text-[var(--text)]/60 capitalize">{item.platform}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {gainLossPercent > 0 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${gainLossPercent > 0 ? "text-green-500" : "text-red-500"}`}>
                            {gainLossPercent > 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 h-24">
                        <PriceHistoryGraph creatorId={item.creatorId} />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-[var(--bg)]/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <CurrencyDollarIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
                            <p className="text-xs text-[var(--text)]/60">Price</p>
                          </div>
                          <p className="text-sm font-bold text-[var(--text)]">${item.currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-[var(--bg)]/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <UserIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
                            <p className="text-xs text-[var(--text)]/60">Owned</p>
                          </div>
                          <p className="text-sm font-bold text-[var(--text)]">{item.quantity}</p>
                        </div>
                        <div className="bg-[var(--bg)]/50 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <ChartBarIcon className="w-3.5 h-3.5 text-[var(--text)]/60" />
                            <p className="text-xs text-[var(--text)]/60">Value</p>
                          </div>
                          <p className="text-sm font-bold text-[var(--text)]">${item.value.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Transition>

      <Transition
        show={loading}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="space-y-6">
          {/* Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4 animate-pulse">
                <div className="h-4 w-24 bg-[var(--accent)]/20 rounded mb-2"></div>
                <div className="h-8 w-32 bg-[var(--accent)]/20 rounded"></div>
              </div>
            ))}
          </div>

          {/* Loading Portfolio Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-2xl p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-[var(--accent)]/20 rounded"></div>
                    <div className="h-3 w-24 bg-[var(--accent)]/20 rounded"></div>
                  </div>
                </div>
                <div className="h-24 bg-[var(--accent)]/20 rounded mb-3"></div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="bg-[var(--bg)]/50 rounded-lg p-2">
                      <div className="h-3 w-16 bg-[var(--accent)]/20 rounded mb-1"></div>
                      <div className="h-4 w-12 bg-[var(--accent)]/20 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default PortfolioPage;
