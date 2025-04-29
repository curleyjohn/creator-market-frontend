import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowUpIcon, ArrowDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  creatorId: string;
  platform: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface TransactionStats {
  totalTransactions: number;
  buyVolume: number;
  sellVolume: number;
}

interface TransactionHistoryProps {
  userId: string;
  onStatsUpdate?: (stats: TransactionStats) => void;
}

const TransactionHistory = ({ userId, onStatsUpdate }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const calculateStats = (transactionData: Transaction[]) => {
    return transactionData.reduce((acc, transaction) => {
      if (transaction.type === 'buy') {
        acc.buyVolume += transaction.quantity;
      } else {
        acc.sellVolume += transaction.quantity;
      }
      return acc;
    }, {
      totalTransactions: transactionData.length,
      buyVolume: 0,
      sellVolume: 0
    });
  };

  // Fetch all transactions for accurate statistics
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        let q = query(transactionsRef);

        if (filterType !== 'all') {
          q = query(q, where('type', '==', filterType));
        }

        const snapshot = await getDocs(q);
        const fetchedTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as Transaction[];

        setAllTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching total count:', error);
      }
    };

    fetchTotalCount();
  }, [userId, filterType]);

  // Update stats whenever allTransactions changes
  useEffect(() => {
    const stats = calculateStats(allTransactions);
    onStatsUpdate?.(stats);
  }, [allTransactions, onStatsUpdate]);

  const fetchTransactions = async (loadMore = false) => {
    try {
      setLoading(true);
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      let q = query(
        transactionsRef,
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      if (filterType !== 'all') {
        q = query(q, where('type', '==', filterType));
      }

      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      if (docs.length < 10) {
        setHasMore(false);
      }

      if (docs.length > 0) {
        setLastDoc(docs[docs.length - 1]);
        const newTransactions = docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as Transaction[];

        setTransactions(prev => loadMore ? [...prev, ...newTransactions] : newTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId, filterType]);

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="divide-y divide-[var(--accent)]/10">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">Transactions</h2>
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-[var(--text)]/60" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
            className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-lg px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent [&>option]:bg-[var(--sidebar-bg)] [&>option]:text-[var(--text)]"
          >
            <option value="all" className="bg-[var(--sidebar-bg)] text-[var(--text)]">All Transactions</option>
            <option value="buy" className="bg-[var(--sidebar-bg)] text-[var(--text)]">Buy Orders</option>
            <option value="sell" className="bg-[var(--sidebar-bg)] text-[var(--text)]">Sell Orders</option>
          </select>
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="animate-pulse space-y-4 p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--accent)]/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-[var(--accent)]/10 rounded" />
                  <div className="h-3 w-32 bg-[var(--accent)]/10 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-[var(--accent)]/10 rounded" />
                <div className="h-3 w-16 bg-[var(--accent)]/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text)]/60">No transactions found</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--accent)]/10">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-6 hover:bg-[var(--accent)]/5 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                  {transaction.type === 'buy' ? (
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">
                    {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.quantity.toLocaleString()} shares
                  </p>
                  <p className="text-sm text-[var(--text)]/60">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-[var(--text)]">
                  ${transaction.total.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--text)]/60">
                  @ ${transaction.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="p-6 text-center">
              <button
                onClick={() => fetchTransactions(true)}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-[var(--text)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
