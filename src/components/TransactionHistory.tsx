import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import Loading from "./Loading";

const TransactionHistory = ({ userId }: { userId: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      if (!userId) return;

      const q = query(
        collection(db, "users", userId, "transactions"),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
      setLoading(false);
    };

    fetchTransactions();
  }, [userId]);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] p-2 overflow-auto">
      {loading ? <Loading /> :
        <>
          {
            transactions.length === 0 ? (
              <p className="text-sm text-gray-400">No transactions yet.</p>
            ) : (
              <ul className="space-y-2">
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className={`p-3 rounded border ${tx.type === "buy" ? "border-green-500" : "border-red-500"
                      }`}
                  >
                    <div className="text-sm font-medium">
                      {tx.type === "buy" ? "🟢 Bought" : "🔴 Sold"} {tx.quantity}x{" "}
                      {tx.creatorId}
                    </div>
                    <div className="text-xs text-gray-400">
                      Price: {tx.price?.toFixed(2)} CC • Total:{" "}
                      {(tx.price * tx.quantity).toFixed(2)} CC
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tx.timestamp?.toDate().toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </>
      }
    </div>
  );
};

export default TransactionHistory;
