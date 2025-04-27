import { useEffect, useState } from "react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import Loading from "../components/Loading";

const PortfolioPage = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.uid) return;

      const portfolioRef = collection(db, "users", user.uid, "portfolio");
      const snapshot = await getDocs(portfolioRef);

      const result = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const creatorRef = doc(db, "creators", data.creatorId);
          const creatorSnap = await getDoc(creatorRef);
          const creatorData = creatorSnap.data();

          const currentPrice = creatorData?.price || 0;
          const value = currentPrice * data.quantity;

          return {
            ...data,
            currentPrice,
            value,
          };
        })
      );

      const total = result.reduce((sum, item) => sum + item.value, 0);
      setPortfolio(result);
      setTotalValue(total);
      setLoading(false);
    };

    fetchPortfolio();
  }, [user]);

  if (!user) return null;

  return (
    <div className="h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>

      {loading ? (
        <Loading />
      ) : portfolio.length === 0 ? (
        <p className="text-sm text-gray-400">You don't own any creators yet.</p>
      ) : (
        <>
          <div className="mb-6 text-lg font-semibold text-[var(--accent)]">
            Total Portfolio Value: {totalValue.toLocaleString()} CC
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.map((item) => {
              const gainLossPercent =
                ((item.currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100;

              return (
                <div
                  key={item.creatorId}
                  className="bg-[var(--sidebar-bg)] border border-[var(--accent)] p-4 rounded-lg"
                >
                  <div className="text-xl font-bold">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.platform}</div>

                  <div className="mt-2 text-sm">
                    Owned: {item.quantity} ×{" "}
                    <span className="text-[var(--accent)]">
                      {item.currentPrice.toFixed(2)} CC
                    </span>
                  </div>

                  <div className="text-sm font-medium mt-1">
                    Value: {item.value.toFixed(2)} CC
                  </div>

                  {/* 🔥 Gain/Loss Section */}
                  <div className="text-sm font-semibold mt-2">
                    Return:{" "}
                    <span className={gainLossPercent >= 0 ? "text-green-500" : "text-red-500"}>
                      {gainLossPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioPage;
