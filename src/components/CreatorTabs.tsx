import { useEffect, useState } from "react";
import { YOUTUBE_CHANNEL_IDS } from "../constants/youtubeChannels";
import { TWITCH_USERNAMES } from "../constants/twitchUsernames";
import { fetchYouTubeCreators } from "../lib/youtube";
import { fetchTwitchCreators } from "../lib/twitch";
import CreatorCard from "./CreatorCard";

const TABS = ["YouTube", "Twitch"] as const;
type TabType = (typeof TABS)[number];

const CreatorTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("YouTube");
  const [loading, setLoading] = useState(false);

  const [youtubeCreators, setYouTubeCreators] = useState([]);
  const [twitchCreators, setTwitchCreators] = useState([]);

  const creators = activeTab === "YouTube" ? youtubeCreators : twitchCreators;

  const loadCreators = async (platform: TabType) => {
    setLoading(true);

    if (platform === "YouTube" && youtubeCreators.length === 0) {
      const yt = await fetchYouTubeCreators(YOUTUBE_CHANNEL_IDS);
      setYouTubeCreators(yt);
    } else if (platform === "Twitch" && twitchCreators.length === 0) {
      const tw = await fetchTwitchCreators(TWITCH_USERNAMES);
      setTwitchCreators(tw);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCreators("YouTube"); // Initial load
  }, []);

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
          {creators.map((creator: any) => (
            <CreatorCard key={`${creator.platform}-${creator.id}`} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorTabs;
