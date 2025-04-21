import { calculatePrice } from "./price";

export const fetchYouTubeCreators = async (channelIds: string[]) => {
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const ids = channelIds.join(",");

  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${ids}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) throw new Error("No creators found");

  return data.items.map((channel: any) => ({
    id: channel.id,
    name: channel.snippet.title,
    avatar: channel.snippet.thumbnails.default.url,
    platform: "youtube",
    subscribers: Number(channel.statistics.subscriberCount),
    views: Number(channel.statistics.viewCount),
    isLive: false, // YouTube API doesn't include live status here
    price: calculatePrice(Number(channel.statistics.subscriberCount), Number(channel.statistics.viewCount)),
  }));
};