import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const HUGGING_FACE_URL = env.NEXT_HUGGING_FACE_URL || 'http://0.0.0.0:8000';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { song_lyrics } = await request.json();

		if (!song_lyrics || typeof song_lyrics !== 'string') {
			return json({ error: 'Lyrics are required' }, { status: 400 });
		}

		const trimmedLyrics = song_lyrics.trim();
		if (trimmedLyrics.length === 0) {
			return json({ error: 'Lyrics cannot be empty' }, { status: 400 });
		}

		const response = await fetch(`${HUGGING_FACE_URL}/predict`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ song_lyrics: trimmedLyrics })
		});

		if (response.status === 503) {
			return json({ error: 'Model is unavailable right now.' }, { status: 503 });
		}

		if (!response.ok) {
			return json({ error: 'Prediction failed. Try again.' }, { status: 500 });
		}

		const data = await response.json();

		const validGenres = ['country', 'hip-hop', 'metal', 'pop', 'rock'];
		const genre = data.genre?.toLowerCase();

		if (!genre || !validGenres.includes(genre)) {
			return json({ error: 'Invalid prediction result.' }, { status: 500 });
		}

		const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);

		return json({ genre: formattedGenre });
	} catch (error) {
		console.error('Prediction API error:', error);
		return json({ error: 'Prediction failed. Try again.' }, { status: 500 });
	}
};
