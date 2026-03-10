import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Genius from "genius-lyrics";
import { request } from "undici";

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const query = url.searchParams.get("q");

    if (!query) {
      return json({ error: "Search query is required" }, { status: 400 });
    }

    const client = new Genius.Client();
    client.request.get = async (url: string): Promise<string> => {
      const res = await request(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });
      return await res.body.text();
    };

    const searches = await client.songs.search(query);

    if (!searches || searches.length === 0) {
      return json({ results: [] });
    }

    const results = searches.slice(0, 5).map((song: any) => ({
      id: song.id?.toString() || "",
      title: song.title || "Unknown",
      artist: song.artist?.name || "Unknown",
      thumbnail: song.thumbnail || song.image || "",
      url: song.url || "",
    }));

    return json({ results });
  } catch (error) {
    console.error("Genius search error:", error);
    return json({ error: "Search failed. Try again." }, { status: 500 });
  }
};
