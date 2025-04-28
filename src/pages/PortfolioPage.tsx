import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import Loading from "../components/Loading";

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
        ...doc.data(),
      }));
      setPortfolioDocs(items);
      setPortfolioReady(true); // ✅ Portfolio is ready
    });

    // 🔹 Listen creators
    const unsubCreators = onSnapshot(creatorsRef, (snapshot) => {
      const items: { [id: string]: any } = {};
      snapshot.docs.forEach((doc) => {
        items[doc.id] = doc.data();
      });
      setCreatorsDocs(items);
      setCreatorsReady(true); // ✅ Creators are ready
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

  if (!user) return null;

  return (
    <div className="h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>

      {loading ? (
        <Loading />
      ) : combinedPortfolio.length === 0 ? (
        <p className="text-sm text-gray-400">You don't own any creators yet.</p>
      ) : (
        <>
          <div className="mb-6 text-lg font-semibold text-[var(--accent)]">
            Total Portfolio Value: {totalValue.toLocaleString()} CC
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combinedPortfolio.map((item) => {
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
