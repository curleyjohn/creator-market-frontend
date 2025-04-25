import { useCallback, useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_IDS } from "../constants/youtubeChannels";
import { TWITCH_USERNAMES } from "../constants/twitchUsernames";
import { fetchYouTubeCreators } from "../lib/youtube";
import { fetchTwitchCreators } from "../lib/twitch";
import CreatorCard from "./CreatorCard";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const TABS = ["YouTube", "Twitch"] as const;
type TabType = (typeof TABS)[number];

const CreatorTabs = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("YouTube");
  const [loading, setLoading] = useState(false);
  const [portfolioById, setPortfolioById] = useState<{ [creatorId: string]: { quantity: number } }>({});
  const userId = user?.uid;

  const [youtubeCreators, setYouTubeCreators] = useState<any>([]);
  const [twitchCreators, setTwitchCreators] = useState<any>([]);

  const creators = activeTab === "YouTube" ? youtubeCreators : twitchCreators;

  const loadCreators = useCallback(async (platform: TabType) => {
    setLoading(true);

    if (platform === "YouTube" && youtubeCreators.length === 0) {
      const yt = await fetchYouTubeCreators(YOUTUBE_CHANNEL_IDS);
      setYouTubeCreators(yt);
    } else if (platform === "Twitch" && twitchCreators.length === 0) {
      const tw = await fetchTwitchCreators(TWITCH_USERNAMES);
      setTwitchCreators(tw);
    }

    setLoading(false);
  }, [youtubeCreators.length, twitchCreators.length]);

  useEffect(() => {
    loadCreators("YouTube"); // Initial load
  }, [loadCreators]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.uid) return;

      const ref = collection(db, "users", user.uid, "portfolio");
      const snap = await getDocs(ref);

      const result: { [creatorId: string]: { quantity: number } } = {};
      snap.forEach((doc) => {
        const data = doc.data();
        result[doc.id] = { quantity: data.quantity };
      });

      setPortfolioById(result);
    };

    fetchPortfolio();
  }, [user]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    loadCreators(tab); // Load if not already fetched
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTab === tab
              ? "bg-accent text-accent-text"
              : "border border-accent text-theme"
              }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-theme">Loading {activeTab} creators...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userId && creators.map((creator: any) => (
            <CreatorCard key={`${creator.platform}-${creator.id}`} creator={creator} userId={user?.uid} ownedQuantity={portfolioById[creator.id]?.quantity || 0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorTabs;
