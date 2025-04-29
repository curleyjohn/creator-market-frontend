import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, collectionGroup } from "firebase/firestore";
import { Transition } from "@headlessui/react";
import { TrophyIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  displayName: string;
  photoURL: string | null;
  balance: number;
  portfolioValue: number;
  netWorth: number;
}

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
        const userId = pathParts[1];
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

  // Calculate Leaderboard
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
  }).sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
          <TrophyIcon className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Leaderboard</h1>
          <p className="text-sm text-[var(--text)]/60">Top traders ranked by net worth</p>
        </div>
      </div>

      <div className="bg-[var(--sidebar-bg)] border border-[var(--accent)]/20 rounded-xl overflow-hidden">
        <Transition
          show={!loading}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--accent)]/10">
                  <th className="py-4 px-6 text-left text-sm font-medium text-[var(--text)]/70">Rank</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-[var(--text)]/70">Trader</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-[var(--text)]/70">Balance</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-[var(--text)]/70">Portfolio Value</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-[var(--text)]/70">Net Worth</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--accent)]/10">
                {leaders.map((user, index) => {
                  const rankColors = {
                    0: "bg-yellow-500/10 text-yellow-500",
                    1: "bg-gray-400/10 text-gray-400",
                    2: "bg-orange-500/10 text-orange-500"
                  };

                  return (
                    <tr key={user.id} className="hover:bg-[var(--accent)]/5 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${rankColors[index as keyof typeof rankColors] || "bg-[var(--accent)]/10 text-[var(--text)]"
                          }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                              <span className="text-lg font-medium text-[var(--accent)]">
                                {user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[var(--text)]">{user.displayName}</div>
                            <div className="text-sm text-[var(--text)]/60">
                              {index === 0 ? "🏆 Top Trader" : index === 1 ? "🥈 Runner Up" : index === 2 ? "🥉 Third Place" : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="text-[var(--text)]">${user.balance.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="text-[var(--text)]">${user.portfolioValue.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="font-medium text-[var(--text)]">${user.netWorth.toLocaleString()}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-[var(--accent)]/10 rounded mb-2" />
                    <div className="h-3 w-32 bg-[var(--accent)]/10 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-[var(--accent)]/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default LeaderboardPage;
