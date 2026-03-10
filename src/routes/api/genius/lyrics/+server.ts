import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { JSDOM } from "jsdom";

async function scrapeLyrics(songUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  const response = await fetch(songUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://genius.com/",
      "DNT": "1",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

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

    // Check if this looks like a blocking error
    const isBlockedError = e instanceof Error && (
      e.message.includes('blocking') ||
      e.message.includes('403') ||
      e.message.includes('rate limit') ||
      e.message.includes('Failed to fetch') && !e.message.includes('timeout')
    );

    if (isBlockedError) {
      return json({
        blocked: true,
        message: "Genius is being a bit dramatic and won't let me grab those lyrics for you 😢",
        geniusUrl: songUrl
      }, { status: 202 }); // Using 202 Accepted to indicate "we acknowledge but can't fulfill"
    }

    let errorMessage = "Could not fetch lyrics. Try again.";
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        errorMessage = "Request timed out. The song page took too long to load.";
      } else {
        errorMessage = e.message;
      }
    }

    return json({ error: errorMessage }, { status: 500 });
  }
};
