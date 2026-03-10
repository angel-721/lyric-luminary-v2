<script lang="ts">
	interface Props {
		genre: string | null;
		error: string | null;
		geniusMetadata?: { title: string; artist: string; thumbnail: string } | null;
	}

	let { genre, error, geniusMetadata }: Props = $props();

	const genreConfig = {
		metal: { emoji: '🤘', color: '#b4befe' },
		'hip-hop': { emoji: '🎤', color: '#89dceb' },
		pop: { emoji: '🌸', color: '#f5c2e7' },
		rock: { emoji: '⚡', color: '#a6e3a1' },
		country: { emoji: '🤠', color: '#f9e2af' }
	};

	const config = $derived(genre ? genreConfig[genre.toLowerCase() as keyof typeof genreConfig] : null);
</script>

{#if error}
	<div class="result-container error">
		<p class="error-text">{error}</p>
	</div>
{:else}
	<div class="result-container">
		{#if geniusMetadata}
			<div class="metadata-row">
				{#if geniusMetadata.thumbnail}
					<img
						src={geniusMetadata.thumbnail}
						alt="{geniusMetadata.title} cover"
						loading="lazy"
						class="metadata-thumbnail"
					/>
				{/if}
				<div class="metadata-info">
					<div class="metadata-title">{geniusMetadata.title}</div>
					<div class="metadata-artist">{geniusMetadata.artist}</div>
				</div>
			</div>
		{/if}
		{#if genre && config}
			<p class="result-text" style="color: {config.color}">
				<span class="emoji">{config.emoji}</span>
				<span class="genre">{genre}</span>
			</p>
		{/if}
	</div>
{/if}

<style>
	.result-container {
		animation: fade-in 0.3s ease-in;
	}

	.metadata-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 1.5rem;
	}

	.metadata-thumbnail {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid var(--overlay);
		flex-shrink: 0;
	}

	.metadata-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.metadata-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--text);
	}

	.metadata-artist {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.75rem;
		color: var(--subtext);
	}

	.result-text {
		font-size: 2.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 700;
		text-align: center;
		margin: 0;
		padding: 2rem 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.emoji {
		font-size: 3rem;
	}

	.error-text {
		font-size: 1rem;
		text-align: center;
		color: var(--accent-dim);
		margin: 0;
		padding: 2rem 0;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
