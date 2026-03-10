import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
	try {
		const urlParam = url.searchParams.get('url');

		if (!urlParam) {
			return json({ error: 'Song URL is required' }, { status: 400 });
		}

		// Fetch the Genius page HTML
		const response = await fetch(urlParam, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});

		if (!response.ok) {
			return json({ error: 'Failed to fetch song page' }, { status: response.status });
		}

		const html = await response.text();

		// Extract lyrics from the HTML
		// Genius stores lyrics in a div with data-lyrics-container attribute
		const lyricsMatch = html.match(/<div data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/);

		if (!lyricsMatch) {
			return json({ error: 'Could not extract lyrics from page' }, { status: 500 });
		}

		// Clean up the HTML to get plain text lyrics
		let lyrics = lyricsMatch[1];

		// Remove HTML tags but preserve line breaks
		lyrics = lyrics
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/div>/gi, '\n')
			.replace(/<[^>]*>/g, '') // Remove all other HTML tags
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#x27;/g, "'")
			.replace(/&#\d+;/g, '') // Remove other HTML entities
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.join('\n');

		if (!lyrics) {
			return json({ error: 'Could not extract lyrics from page' }, { status: 500 });
		}

		return json({ lyrics });
	} catch (error) {
		console.error('Genius lyrics fetch error:', error);
		return json({ error: 'Could not fetch lyrics. Try again.' }, { status: 500 });
	}
};
