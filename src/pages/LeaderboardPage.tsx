import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, collectionGroup } from "firebase/firestore";
import Loading from "../components/Loading";

const LeaderboardPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<{ [userId: string]: any[] }>({});
  const [creators, setCreators] = useState<{ [creatorId: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen to users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    });

    // 2. Listen to portfolios
    const unsubPortfolios = onSnapshot(collectionGroup(db, "portfolio"), (snapshot) => {
      const grouped: { [userId: string]: any[] } = {};
      snapshot.docs.forEach((doc) => {
        const pathParts = doc.ref.path.split("/");
        const userId = pathParts[1]; // users/{userId}/portfolio/{docId}
        if (!grouped[userId]) grouped[userId] = [];
        grouped[userId].push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setPortfolios(grouped);
    });

    // 3. Listen to creators
    const unsubCreators = onSnapshot(collection(db, "creators"), (snapshot) => {
      const creatorsData: { [id: string]: any } = {};
      snapshot.docs.forEach((doc) => {
        creatorsData[doc.id] = doc.data();
      });
      setCreators(creatorsData);
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubPortfolios();
      unsubCreators();
    };
  }, []);

  // 🔥 Compute Leaderboard
  const leaders = users.map((user) => {
    const userPortfolio = portfolios[user.id] || [];
    let portfolioValue = 0;

    userPortfolio.forEach((item) => {
      const creator = creators[item.creatorId];
      if (creator) {
        portfolioValue += (creator.price || 0) * (item.quantity || 0);
      }
    });

    const balance = user.balance || 0;
    const netWorth = balance + portfolioValue;

    return {
      id: user.id,
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      balance,
      portfolioValue,
      netWorth,
    };
  }).sort((a, b) => b.netWorth - a.netWorth); // Sort by net worth

  return (
    <div className="h-full flex-shrink flex-1 overflow-auto">
      <h1 className="text-2xl font-bold mb-6 text-[var(--accent)]">Leaderboard</h1>

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-2 border-b border-[var(--accent)] text-sm md:text-base">Rank</th>
                <th className="py-2 px-2 border-b border-[var(--accent)] text-sm md:text-base">User</th>
                <th className="py-2 px-2 border-b border-[var(--accent)] text-sm md:text-base">Balance</th>
                <th className="py-2 px-2 border-b border-[var(--accent)] text-sm md:text-base">Portfolio</th>
                <th className="py-2 px-2 border-b border-[var(--accent)] text-sm md:text-base">Net Worth</th>
              </tr>
            </thead>

            <tbody>
              {leaders.map((user, index) => {
                let nameColor = "text-white";
                if (index === 0) nameColor = "text-yellow-400"; // Gold
                else if (index === 1) nameColor = "text-gray-300"; // Silver
                else if (index === 2) nameColor = "text-orange-500"; // Bronze

                return (
                  <tr key={user.id} className="border-b border-[var(--accent)] hover:bg-[var(--sidebar-bg)] transition">
                    <td className="p-2 font-semibold text-center text-xs md:text-sm">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td className="p-2 flex items-center gap-3 text-xs md:text-sm">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                          {user.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={`font-semibold ${nameColor}`}>{user.displayName}</span>
                    </td>
                    <td className="p-2 text-xs md:text-sm">{user.balance.toFixed(2)} CC</td>
                    <td className="p-2 text-xs md:text-sm">{user.portfolioValue.toFixed(2)} CC</td>
                    <td className="p-2 font-bold text-xs md:text-sm">{user.netWorth.toFixed(2)} CC</td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
