import { useAuth } from "../context/AuthContext";
import TransactionHistory from "../components/TransactionHistory";
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface TransactionStats {
  totalTransactions: number;
  buyVolume: number;
  sellVolume: number;
}

const TransactionsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    buyVolume: 0,
    sellVolume: 0
  });

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <BanknotesIcon className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Transaction History</h1>
          <p className="text-sm text-[var(--text)]/60">Track your creator trading activity</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Transactions */}
        <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-sm font-medium text-[var(--text)]/70">Total Transactions</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[var(--text)]">
              {stats.totalTransactions.toLocaleString()}
            </p>
            <span className="text-sm text-[var(--text)]/60">trades</span>
          </div>
        </div>

        {/* Buy Volume */}
        <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-[var(--text)]/70">Buy Volume</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[var(--text)]">
              {stats.buyVolume.toLocaleString()}
            </p>
            <span className="text-sm text-[var(--text)]/60">shares</span>
          </div>
        </div>

        {/* Sell Volume */}
        <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-medium text-[var(--text)]/70">Sell Volume</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[var(--text)]">
              {stats.sellVolume.toLocaleString()}
            </p>
            <span className="text-sm text-[var(--text)]/60">shares</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl overflow-hidden">
        {user?.uid && (
          <TransactionHistory
            userId={user.uid}
            onStatsUpdate={setStats}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
