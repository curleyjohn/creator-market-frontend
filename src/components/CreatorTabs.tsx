import { useCallback, useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_IDS } from "../constants/youtubeChannels";
import { TWITCH_USERNAMES } from "../constants/twitchUsernames";
import { fetchYouTubeCreators } from "../lib/youtube";
import { fetchTwitchCreators } from "../lib/twitch";
import CreatorCard from "./CreatorCard";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Loading from "./Loading";
import { Transition } from "@headlessui/react";

const TABS = ["YouTube", "Twitch"] as const;
type TabType = (typeof TABS)[number];

const CreatorTabs = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("YouTube");
  const [loading, setLoading] = useState(false);
  const [portfolioById, setPortfolioById] = useState<{ [creatorId: string]: { quantity: number; averageBuyPrice: number | null } }>({});
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
    if (!user?.uid) return;

    const loadTwitchCreators = async () => {
      setLoading(true);

      const twitchRef = collection(db, "creators");
      const snap = await getDocs(twitchRef);
      const existingIds = new Set(snap.docs.map(doc => doc.id));

      // Find which usernames are missing
      const missingUsernames = TWITCH_USERNAMES.filter(u => {
        return !Array.from(existingIds).some(id => id.includes(u));
      });

      if (missingUsernames.length > 0) {
        console.log("Missing Twitch users detected:", missingUsernames);
        await fetchTwitchCreators(missingUsernames);
      }

      setLoading(false);
    };

    loadTwitchCreators();
  }, [user?.uid]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "creators"), (snapshot) => {
      const allCreators = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Split by platform
      const youtube = allCreators.filter((c: any) => c.platform === "youtube");
      const twitch = allCreators.filter((c: any) => c.platform === "twitch");

      setYouTubeCreators(youtube);
      setTwitchCreators(twitch);
    });

    return () => unsub(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    loadCreators("YouTube"); // Initial load
  }, [loadCreators]);

  useEffect(() => {
    if (!user?.uid) return;

    const ref = collection(db, "users", user.uid, "portfolio");

    const unsub = onSnapshot(ref, (snap) => {
      const result: { [creatorId: string]: { quantity: number; averageBuyPrice: number | null } } = {};
      snap.forEach((doc) => {
        const data = doc.data();
        result[doc.id] = {
          quantity: data.quantity,
          averageBuyPrice: data.averageBuyPrice,
        };
      });
      setPortfolioById(result);
    });

    return () => unsub(); // Cleanup listener on unmount
  }, [user?.uid]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    loadCreators(tab); // Load if not already fetched
  };

  return (
    <div className="h-full overflow-auto">
      <div className="flex gap-4 mb-6">
        {TABS.map((tab) => (
          <Transition
            key={tab}
            show={true}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <button
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${activeTab === tab
                  ? "bg-accent text-accent-text shadow-lg"
                  : "border border-accent text-theme hover:bg-accent/10"
                }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          </Transition>
        ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userId && creators.map((creator: any) => (
            <CreatorCard
              key={`${creator.platform}-${creator.id}`}
              creator={creator}
              userId={user?.uid}
              ownedQuantity={portfolioById[creator.id]?.quantity || 0}
              averageBuyPrice={portfolioById[creator.id]?.averageBuyPrice || null}
            />
          ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-2xl p-5 animate-pulse"
            >
              <div className="flex">
                <div className="w-16 h-16 rounded-full bg-gray-300 mb-3"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-32 bg-gray-300 rounded mt-2"></div>
              <div className="h-4 w-24 bg-gray-300 rounded mt-2"></div>
              <div className="h-10 w-full bg-gray-300 rounded mt-4"></div>
            </div>
          ))}
        </div>
      </Transition>
    </div>
  );
};

export default CreatorTabs;
