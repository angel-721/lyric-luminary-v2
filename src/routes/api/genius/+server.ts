import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

interface GeniusSearchResponse {
  response: {
    hits: Array<{
      result: {
        id: number;
        title: string;
        primary_artist: {
          name: string;
        };
        url: string;
        song_art_image_thumbnail_url: string;
        song_art_image_url: string;
        header_image_thumbnail_url: string;
      };
    }>;
  };
}

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const query = url.searchParams.get("q");

    if (!query) {
      return json({ error: "Search query is required" }, { status: 400 });
    }

    const accessToken = env.GENIUS_ACCESS_TOKEN;

    if (!accessToken) {
      return json({ error: "Genius API token not configured" }, { status: 500 });
    }

    const geniusApiUrl = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(geniusApiUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Genius API error:", response.status, response.statusText);
      return json({ error: "Failed to search Genius" }, { status: response.status });
    }

    const data = (await response.json()) as GeniusSearchResponse;

    if (!data.response?.hits || data.response.hits.length === 0) {
      return json({ results: [] });
    }

    const results = data.response.hits.slice(0, 5).map((hit) => ({
      id: hit.result.id.toString(),
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      thumbnail: hit.result.song_art_image_thumbnail_url || hit.result.header_image_thumbnail_url || "",
      url: hit.result.url,
    }));

    return json({ results });
  } catch (error) {
    console.error("Genius search error:", error);
    return json({ error: "Search failed. Try again." }, { status: 500 });
  }
};
