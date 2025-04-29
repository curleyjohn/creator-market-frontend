import { useCallback, useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_IDS } from "../constants/youtubeChannels";
import { TWITCH_USERNAMES } from "../constants/twitchUsernames";
import { fetchYouTubeCreators } from "../lib/youtube";
import { fetchTwitchCreators } from "../lib/twitch";
import CreatorCard from "./CreatorCard";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Transition } from "@headlessui/react";
import { PlayIcon, VideoCameraIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface Creator {
  id: string;
  name: string;
  platform: "youtube" | "twitch";
  price: number;
  priceChange: number;
  priceHistory: number[];
  imageUrl?: string;
  subscribers: number;
  views: number;
}

const TABS = [
  { name: "YouTube", icon: PlayIcon, color: "bg-red-500" },
  { name: "Twitch", icon: VideoCameraIcon, color: "bg-purple-500" }
] as const;
type TabType = (typeof TABS)[number]["name"];

const CreatorTabs = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("YouTube");
  const [loading, setLoading] = useState(false);
  const [portfolioById, setPortfolioById] = useState<{ [creatorId: string]: { quantity: number; averageBuyPrice: number | null } }>({});
  const userId = user?.uid;

  const [youtubeCreators, setYouTubeCreators] = useState<Creator[]>([]);
  const [twitchCreators, setTwitchCreators] = useState<Creator[]>([]);

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

      const missingUsernames = TWITCH_USERNAMES.filter(u => {
        return !Array.from(existingIds).some(id => id.includes(u));
      });

      if (missingUsernames.length > 0) {
        await fetchTwitchCreators(missingUsernames);
      }

      setLoading(false);
    };

    loadTwitchCreators();
  }, [user?.uid]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "creators"), (snapshot) => {
      const allCreators = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          platform: data.platform,
          price: data.price,
          priceChange: data.priceChange || 0,
          priceHistory: data.priceHistory || [],
          imageUrl: data.avatar,
          subscribers: data.subscribers || 0,
          views: data.views || 0,
        } as Creator;
      });

      const youtube = allCreators.filter((c) => c.platform === "youtube");
      const twitch = allCreators.filter((c) => c.platform === "twitch");

      setYouTubeCreators(youtube);
      setTwitchCreators(twitch);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    loadCreators("YouTube");
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

    return () => unsub();
  }, [user?.uid]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    loadCreators(tab);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChartBarIcon className="w-8 h-8 text-[var(--accent)]" />
            <div>
              <h2 className="text-2xl font-bold text-[var(--text)]">Creator Marketplace</h2>
              <p className="text-sm text-[var(--text)]/60">Trade and invest in your favorite creators</p>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-[var(--sidebar-bg)] rounded-xl border border-[var(--accent)]/20">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <Transition
                  key={tab.name}
                  show={true}
                  enter="transition ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
                      ? `${tab.color} text-white shadow-lg`
                      : "text-[var(--text)] hover:bg-[var(--accent)]/10"
                      }`}
                    onClick={() => handleTabClick(tab.name)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                </Transition>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userId && creators.map((creator: any) => (
            <CreatorCard
              key={`${creator.platform}-${creator.id}`}
              creator={creator}
              userId={user?.uid}
              ownedQuantity={portfolioById[creator.id]?.quantity || 0}
              averageBuyPrice={portfolioById[creator.id]?.averageBuyPrice || undefined}
            />
          ))}
        </div>

        <Transition
          show={loading}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-2xl p-5 animate-pulse"
              >
                <div className="flex">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 mb-3"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-4 w-20 bg-[var(--accent)]/20 rounded"></div>
                    <div className="h-4 w-16 bg-[var(--accent)]/20 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-32 bg-[var(--accent)]/20 rounded mt-2"></div>
                <div className="h-4 w-24 bg-[var(--accent)]/20 rounded mt-2"></div>
                <div className="h-10 w-full bg-[var(--accent)]/20 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default CreatorTabs;
