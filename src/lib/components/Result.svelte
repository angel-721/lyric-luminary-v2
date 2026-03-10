<script lang="ts">
	interface Props {
		genre: string | null;
		error: string | null;
	}

	let { genre, error }: Props = $props();

	const genreConfig = {
		metal: { emoji: '🤘', color: '#b4befe' },
		'hip-hop': { emoji: '🎤', color: '#89dceb' },
		pop: { emoji: '🌸', color: '#f5c2e7' },
		rock: { emoji: '⚡', color: '#a6e3a1' },
		country: { emoji: '🤠', color: '#f9e2af' }
	};

	$derived config = genre ? genreConfig[genre.toLowerCase() as keyof typeof genreConfig] : null;
</script>

{#if error}
	<div class="result-container error">
		<p class="error-text">{error}</p>
	</div>
{:else if genre && config}
	<div class="result-container">
		<p class="result-text" style="color: {config.color}">
			<span class="emoji">{config.emoji}</span>
			<span class="genre">{genre}</span>
		</p>
	</div>
{/if}

<style>
	.result-container {
		animation: fade-in 0.3s ease-in;
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
