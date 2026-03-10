import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import Genius from "genius-lyrics";

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const query = url.searchParams.get("q");

    if (!query) {
      return json({ error: "Search query is required" }, { status: 400 });
    }

    const geniusClient = new Genius.Client();
    const searches = await geniusClient.songs.search(query);

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
