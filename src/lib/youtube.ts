import { calculateFinalPrice } from "./price";
import { db } from "./firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";

export const fetchYouTubeCreators = async (channelIds: string[]) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const ids = channelIds.join(",");

  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) throw new Error("No creators found");

  const creators = await Promise.all(
    data.items.map(async (channel: any) => {
      const id = channel.id;
      const name = channel.snippet.title;
      const avatar = channel.snippet.thumbnails.default.url;
      const subscribers = Number(channel.statistics.subscriberCount);
      const views = Number(channel.statistics.viewCount);

      const creatorRef = doc(db, "creators", id);
      const creatorSnap = await getDoc(creatorRef);

      let totalBuys = 0;
      let totalSells = 0;

      if (creatorSnap.exists()) {
        const creatorData = creatorSnap.data();
        totalBuys = creatorData?.buys ?? 0;
        totalSells = creatorData?.sells ?? 0;
      }

      // ✅ Calculate price using latest YouTube data + stored market activity
      const price = calculateFinalPrice({
        subscribers,
        newSubscribers: 0,
        newViews: views,
        newComments: 0,
        postedThisWeek: false,
        totalBuys,
        totalSells,
      });

      // ✅ Save or update the creator with recalculated price
      await setDoc(creatorRef, {
        id,
        name,
        platform: "youtube",
        subscribers,
        views,
        price,
        buys: totalBuys,
        sells: totalSells,
        lastUpdated: new Date(),
      }, { merge: true });

      return {
        id,
        name,
        avatar,
        platform: "youtube",
        subscribers,
        views,
        isLive: false,
        price,
      };
    })
  );

  return creators;
};
