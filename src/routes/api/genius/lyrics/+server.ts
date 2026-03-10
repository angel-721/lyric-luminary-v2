import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { JSDOM } from "jsdom";

async function scrapeLyrics(songUrl: string): Promise<string> {
  const response = await fetch(songUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch song page: ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const containers = Array.from(
    document.querySelectorAll("[data-lyrics-container='true']")
  );

  if (containers.length === 0) {
    throw new Error("No lyrics found on page.");
  }

  const lyrics = containers
    .map((container) => {
      container.querySelectorAll("br").forEach((br) => {
        br.replaceWith(dom.window.document.createTextNode("\n"));
      });
      container.querySelectorAll("div").forEach((div) => {
        div.insertAdjacentText("afterend", "\n");
      });
      return container.textContent ?? "";
    })
    .join("\n")
    .trim();

  if (!lyrics.length) {
    throw new Error("Lyrics container was empty.");
  }

  // Filter out non-lyric content that Genius includes
  const lines = lyrics.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();

    if (!trimmed) return true;

    if (trimmed.match(/^\[.*?\]$/)) return false;

    if (trimmed.match(/^\d+\s+(Contributors|contributor)/i)) return false;
    if (trimmed.match(/Contributors/i)) return false;

    if (trimmed.includes("This song is about")) return false;
    if (trimmed.includes("Read More")) return false;
    if (trimmed.includes("…")) return false;
    if (trimmed.includes("Read more on Genius")) return false;

    if (trimmed.match(/^(This song|The song|It's about|They're about)/i)) return false;
    if (trimmed.match(/(written|produced|performed|recorded)/i)) return false;

    const titleMatch = containers[0]?.textContent?.trim().split("\n")[0];
    if (titleMatch && trimmed === titleMatch && lines.indexOf(line) < 5) return false;

    if (trimmed.length > 200) return false;

    if (trimmed.includes("http") || trimmed.includes("©") || trimmed.includes("©")) return false;

    return true;
  });

  const cleanedLyrics = filteredLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // Remove excessive blank lines
    .trim();

  if (!cleanedLyrics || cleanedLyrics.length < 50) {
    throw new Error("Could not extract meaningful lyrics from page.");
  }

  return cleanedLyrics;
}

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  const songUrl = url.searchParams.get("url");

  if (!songUrl || !songUrl.startsWith("https://genius.com/")) {
    return json({ error: "Invalid or missing Genius URL." }, { status: 400 });
  }

  try {
    const lyrics = await scrapeLyrics(songUrl);
    return json({ lyrics });
  } catch (e) {
    console.error("Genius lyrics fetch error:", e);
    return json({ error: e instanceof Error ? e.message : "Could not fetch lyrics. Try again." }, { status: 500 });
  }
};
