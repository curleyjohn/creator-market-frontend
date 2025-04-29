import { calculateFinalPrice } from "./price";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collectionGroup,
  getDocs
} from "firebase/firestore";

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

    // 🔹 STEP 1: Fetch all user portfolio items to compute owner counts
    const portfolioSnap = await getDocs(collectionGroup(db, "portfolio"));
    const ownerMap: { [creatorId: string]: number } = {};

    portfolioSnap.forEach((doc) => {
      const d = doc.data();
      if (d.creatorId && d.quantity > 0) {
        ownerMap[d.creatorId] = (ownerMap[d.creatorId] || 0) + 1;
      }
    });

    const creators = await Promise.all(
      data.data.map(async (user: any) => {
        const id = user.id;
        const name = user.display_name;
        const avatar = user.profile_image_url;
        const views = Number(user.view_count);

        const creatorRef = doc(db, "creators", id);
        const creatorSnap = await getDoc(creatorRef);

        let totalBuys = 0;
        let totalSells = 0;

        if (creatorSnap.exists()) {
          const existing = creatorSnap.data();
          totalBuys = existing?.buys ?? 0;
          totalSells = existing?.sells ?? 0;
        }

        const price = await calculateFinalPrice({
          subscribers: 0,
          newSubscribers: 0,
          newViews: views,
          newComments: 0,
          postedThisWeek: false,
          totalBuys,
          totalSells,
          creatorId: id,
        });

        const ownerCount = ownerMap[id] || 0;

        await setDoc(
          creatorRef,
          {
            id,
            name,
            platform: "twitch",
            subscribers: 0,
            views,
            price,
            buys: totalBuys,
            sells: totalSells,
            ownerCount,
            lastUpdated: new Date(),
          },
          { merge: true }
        );

        return {
          id,
          name,
          avatar,
          platform: "twitch",
          subscribers: 0,
          views,
          isLive: false,
          price,
          ownerCount,
        };
      })
    );

    return creators;
  } catch (error) {
    console.log("Twitch error: ", error);
    return [];
  }
};
