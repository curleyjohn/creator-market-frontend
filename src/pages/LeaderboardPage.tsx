import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import Loading from "../components/Loading";

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);

      const usersSnap = await getDocs(collection(db, "users"));
      const users: any[] = [];

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const portfolioSnap = await getDocs(collection(db, "users", userDoc.id, "portfolio"));

        let portfolioValue = 0;

        for (const item of portfolioSnap.docs) {
          const itemData = item.data();

          const creatorId = itemData.creatorId;
          const quantity = itemData.quantity || 0;

          if (!creatorId) continue;

          // Fetch the creator document
          const creatorRef = doc(db, "creators", creatorId);
          const creatorSnap = await getDoc(creatorRef);

          let currentPrice = 0;
          if (creatorSnap.exists()) {
            const creatorData = creatorSnap.data();
            currentPrice = creatorData.price || 0;
          }

          portfolioValue += quantity * currentPrice;
        }

        const balance = userData.balance || 0;
        const netWorth = balance + portfolioValue;

        users.push({
          id: userDoc.id,
          displayName: userData.displayName || "Anonymous",
          photoURL: userData.photoURL || null,
          balance,
          portfolioValue,
          netWorth,
        });
      }

      // Sort by net worth descending
      users.sort((a, b) => b.netWorth - a.netWorth);

      setLeaders(users);
      setLoading(false);
    };

    fetchLeaders();
  }, []);



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
                // Define color based on rank
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
