<script lang="ts">
	import LyricInput from '$lib/components/LyricInput.svelte';
	import GeniusInput from '$lib/components/GeniusInput.svelte';
	import Bulb from '$lib/components/Bulb.svelte';
	import Result from '$lib/components/Result.svelte';
	import { SendAlt, ArrowUpRight, Sun, Moon } from 'carbon-icons-svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';

	// State
	let activeTab = $state<'paste' | 'genius'>('genius');
	let lyrics = $state('');
	let isLoading = $state(false);
	let predictedGenre = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	let currentTheme = $state<'dark' | 'light'>('dark');

	// Subscribe to theme store
	theme.subscribe((t) => (currentTheme = t));

	function handleToggleTheme() {
		toggleTheme();
	}

	async function handleSubmit() {
		errorMessage = null;

		// Validate lyrics
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

	function handleGeniusFetch(fetchedLyrics: string) {
		lyrics = fetchedLyrics;
		activeTab = 'paste';
	}

	function resetForm() {
		lyrics = '';
		predictedGenre = null;
		errorMessage = null;
	}
</script>

<svelte:head>
	<title>Lyric Luminary</title>
	<meta name="description" content="Predict music genres from song lyrics" />
</svelte:head>

<div class="container">
	<div class="top-links">
		<button onclick={handleToggleTheme} class="theme-toggle" aria-label="Toggle theme">
			{#if currentTheme === 'dark'}
				<Sun size={20} />
			{:else}
				<Moon size={20} />
			{/if}
		</button>
		<a href="/blog" class="blog-link">
			<span>Blog</span>
			<ArrowUpRight size={20} />
		</a>
	</div>

	<header class="header">
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
		{#if activeTab === 'paste'}
			{@const lyricError = errorMessage ? 'Lyrics cannot be empty' : ''}
			<LyricInput bind:lyrics error={lyricError} />
		{:else}
			<GeniusInput onFetch={handleGeniusFetch} />
		{/if}

		{#if !isLoading && !predictedGenre}
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

		{#if isLoading}
			<Bulb />
		{/if}

		{#if predictedGenre || errorMessage}
			<Result genre={predictedGenre} error={errorMessage} />
		{/if}

		{#if predictedGenre}
			<div class="reset-container">
				<button onclick={resetForm} class="reset-button">
					Predict Another Song
				</button>
			</div>
		{/if}
	</main>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		position: relative;
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
		color: #999;
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

	.blog-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #999;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.blog-link:hover {
		color: var(--text);
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text);
	}

	.subtitle {
		font-size: 1.125rem;
		color: #999;
		margin: 0;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		background-color: #1a1a1a;
		padding: 0.25rem;
		border-radius: 8px;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background-color: transparent;
		color: #999;
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

	.reset-button:hover {
		background-color: var(--accent);
		color: var(--bg);
	}
</style>
