<script lang="ts">
	import LyricInput from '$lib/components/LyricInput.svelte';
	import GeniusInput from '$lib/components/GeniusInput.svelte';
	import Bulb from '$lib/components/Bulb.svelte';
	import Result from '$lib/components/Result.svelte';
	import { SendAlt, ArrowUpRight, Sun, Moon, Reset } from 'carbon-icons-svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';

	let activeTab = $state<'paste' | 'genius'>('genius');
	let lyrics = $state('');
	let isLoading = $state(false);
	let predictedGenre = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	let currentTheme = $state<'dark' | 'light'>('dark');
	let geniusMetadata = $state<{ title: string; artist: string; thumbnail: string } | null>(null);
	let blockedState = $state<{ message: string; geniusUrl: string } | null>(null);

	theme.subscribe((t) => (currentTheme = t));

	function handleToggleTheme() {
		toggleTheme();
	}

	async function handleSubmit() {
		errorMessage = null;

		if (!lyrics.trim()) {
			errorMessage = 'Lyrics cannot be empty';
			return;
		}

		isLoading = true;
		predictedGenre = null;

		try {
			const response = await fetch('/api/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ song_lyrics: lyrics })
			});

			const data = await response.json();

			if (data.error) {
				errorMessage = data.error;
			} else {
				predictedGenre = data.genre;
			}
		} catch (err) {
			errorMessage = 'Prediction failed. Try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleGeniusFetch(
		fetchedLyrics: string,
		song?: { title: string; artist: string; thumbnail: string },
		blocked?: { message: string; geniusUrl: string }
	) {
		if (blocked) {
			// Genius is blocking us, switch to paste tab and show the card
			blockedState = blocked;
			if (song) {
				geniusMetadata = { title: song.title, artist: song.artist, thumbnail: song.thumbnail };
			}
			lyrics = '';
		} else {
			// Normal fetch, set lyrics and clear blocked state
			lyrics = fetchedLyrics;
			blockedState = null;
			if (song) {
				geniusMetadata = { title: song.title, artist: song.artist, thumbnail: song.thumbnail };
			}
		}
		activeTab = 'paste';
	}

	function resetForm() {
		lyrics = '';
		predictedGenre = null;
		errorMessage = null;
		geniusMetadata = null;
		blockedState = null;
		activeTab = 'genius';
	}

	const isLocked = $derived(predictedGenre !== null);
</script>

<svelte:head>
	<title>Lyric Luminary</title>
	<meta name="description" content="Predict music genres from song lyrics" />
</svelte:head>

<div class="light-cone" class:predicting={isLoading} class:predicted={predictedGenre !== null}></div>

<div class="container">
	<div class="top-links">
		<button onclick={handleToggleTheme} class="theme-toggle" aria-label="Toggle theme">
			{#if currentTheme === 'dark'}
				<Sun size={20} />
			{:else}
				<Moon size={20} />
			{/if}
		</button>
	</div>
	<div class="container-inner">
	<header class="header">
		<Bulb state={isLoading ? 'predicting' : predictedGenre ? 'predicted' : 'idle'} />
		<h1>Lyric Luminary</h1>
		<p class="subtitle">Predict music genres from song lyrics</p>
	</header>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'paste'}
			onclick={() => (activeTab = 'paste')}
		>
			Paste Lyrics
		</button>
		<button
			class="tab"
			class:active={activeTab === 'genius'}
			onclick={() => (activeTab = 'genius')}
		>
			Genius Search
		</button>
	</div>

	<main class="main-content">
		{#if blockedState && activeTab === 'paste'}
			<div class="blocked-card">
				<button class="blocked-close" onclick={() => (blockedState = null)} aria-label="Close">
					✕
				</button>
				<p class="blocked-message">{blockedState.message}</p>
				<a href={blockedState.geniusUrl} target="_blank" rel="noopener noreferrer" class="blocked-link">
					<span>Get lyrics from Genius</span>
					<ArrowUpRight size={16} />
				</a>
			</div>
		{/if}

		{#if !isLocked}
			{#if activeTab === 'paste'}
				<LyricInput bind:lyrics error={errorMessage} />
			{:else}
				<GeniusInput onFetch={handleGeniusFetch} />
			{/if}
		{:else}
			<div class="locked-lyrics">
				{lyrics}
			</div>
		{/if}

		{#if !isLocked}
			{#if !isLoading}
				<div class="submit-container">
					<button
						onclick={handleSubmit}
						disabled={!lyrics.trim() || isLoading}
						class="submit-button"
					>
						<SendAlt size={24} />
						<span>Predict Genre</span>
					</button>
				</div>
			{/if}
		{/if}

		{#if predictedGenre || errorMessage}
			<Result genre={predictedGenre} error={errorMessage} {geniusMetadata} />
		{/if}

		{#if predictedGenre}
			<div class="reset-container">
				<button onclick={resetForm} class="reset-button">
					<Reset size={16} />
					<span>Predict Another Song</span>
				</button>
			</div>
		{/if}
	</main>
	</div>
</div>

<style>
	.light-cone {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		background: radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent) 0%, transparent 70%);
		opacity: 0;
		pointer-events: none;
		z-index: 0;
		transition: opacity 0.6s ease-in-out;
	}

	.light-cone.predicting {
		animation: pulse-cone 1.2s ease-in-out infinite;
	}

	.light-cone.predicted {
		opacity: 0.4;
	}

	@keyframes pulse-cone {
		0%, 100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}

	.container {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 580px;
		min-height: 100vh;
		display: block;
		margin: 0 auto;
	}

	.container-inner {
		width: 100%;
		max-width: 580px;
		min-height: 100vh;
		padding: 2rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
	}

	.top-links {
		position: absolute;
		top: 2rem;
		right: 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.theme-toggle {
		padding: 0.5rem;
		background-color: transparent;
		color: var(--subtext);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.theme-toggle:hover {
		color: var(--text);
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.header h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text);
	}

	.subtitle {
		font-size: 1.125rem;
		color: var(--subtext);
		margin: 0;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		background-color: var(--surface);
		padding: 0.25rem;
		border-radius: 8px;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background-color: transparent;
		color: var(--subtext);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.tab:hover {
		color: var(--text);
	}

	.tab.active {
		background-color: var(--accent);
		color: var(--bg);
		font-weight: 600;
	}

	.main-content {
		width: 100%;
		max-width: 580px;
	}

	.blocked-card {
		position: relative;
		padding: 1.25rem 1rem 1rem 1rem;
		margin-bottom: 1.5rem;
		background-color: var(--surface);
		border-radius: 8px;
		border-left: 3px solid var(--accent);
		animation: slide-in 0.3s ease-out;
	}

	.blocked-close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 24px;
		height: 24px;
		padding: 0;
		background-color: transparent;
		color: var(--subtext);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.blocked-close:hover {
		background-color: var(--overlay);
		color: var(--text);
	}

	.blocked-message {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		color: var(--text);
		margin: 0 0 0.75rem 0;
		line-height: 1.5;
	}

	.blocked-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: var(--accent);
		color: var(--bg);
		text-decoration: none;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		border-radius: 6px;
		transition: opacity 0.2s;
	}

	.blocked-link:hover {
		opacity: 0.9;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.submit-container {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}

	.submit-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background-color: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 8px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		opacity: 0.9;
	}

	.submit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.reset-container {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}

	.reset-button {
		padding: 0.75rem 1.5rem;
		background-color: transparent;
		color: var(--accent);
		border: 2px solid var(--accent);
		border-radius: 8px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}


	.locked-lyrics {
		width: 100%;
		padding: 1.5rem;
		background-color: var(--surface);
		color: var(--text);
		border-radius: 8px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		white-space: pre-wrap;
		overflow-y: auto;
		max-height: 400px;
	}
</style>
