import { calculatePrice } from "./price";

let cachedAccessToken: string | null = null;

export const getTwitchAccessToken = async () => {
  if (cachedAccessToken) return cachedAccessToken;

  const clientId = process.env.REACT_APP_TWITCH_CLIENT_ID!;
  const clientSecret = process.env.REACT_APP_TWITCH_CLIENT_SECRET!;

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );
  const data = await res.json();
  cachedAccessToken = data.access_token;
  return cachedAccessToken;

};

export const fetchTwitchCreators = async (usernames: string[]) => {
  try {
    const token = await getTwitchAccessToken();
    const clientId = process.env.REACT_APP_TWITCH_CLIENT_ID;

    const query = usernames.map((u) => `login=${u}`).join("&");

    const res = await fetch(`https://api.twitch.tv/helix/users?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-ID": clientId!,
      },
    });

    const data = await res.json();

    return data.data.map((user: any) => ({
      id: user.id,
      name: user.display_name,
      avatar: user.profile_image_url,
      platform: "twitch",
      subscribers: 0, // Twitch doesn't expose subs publicly
      views: Number(user.view_count),
      isLive: false, // We'll do this in another step
      price: calculatePrice(0, user.view_count),
    }));
  } catch (error) {
    console.log('Twitch error: ', error);
    return [];
  }
};
