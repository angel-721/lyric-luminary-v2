<script lang="ts">
	interface Props {
		genre: string | null;
		error: string | null;
	}

	let { genre, error }: Props = $props();
</script>

{#if error}
	<div class="result-container error">
		<p class="error-text">{error}</p>
	</div>
{:else if genre}
	<div class="result-container">
		<p class="result-text">
			Predicted genre: <span class="genre">{genre}</span>
		</p>
	</div>
{/if}

<style>
	.result-container {
		animation: fade-in 0.5s ease-in;
	}

	.result-text {
		font-size: 1.5rem;
		text-align: center;
		color: var(--text);
		margin: 0;
		padding: 2rem 0;
	}

	.genre {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
	}

	.error-text {
		font-size: 1rem;
		text-align: center;
		color: #ef4444;
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
