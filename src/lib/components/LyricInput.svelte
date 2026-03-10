<script lang="ts">
	interface Props {
		lyrics: string;
		error: string;
	}

	let { lyrics = $bindable(''), error = $bindable('') }: Props = $props();

	function clearError() {
		error = '';
	}
</script>

<div class="lyric-input-container">
	<textarea
		bind:value={lyrics}
		oninput={clearError}
		placeholder="Paste your song lyrics here..."
		class="lyric-textarea"
		rows="12"
	></textarea>
	{#if error}
		<p class="error-message">{error}</p>
	{/if}
</div>

<style>
	.lyric-input-container {
		width: 100%;
	}

	.lyric-textarea {
		width: 100%;
		min-height: 200px;
		padding: 1rem;
		background-color: var(--bg);
		color: var(--text);
		border: 2px solid #333;
		border-radius: 8px;
		font-family: 'IBM Plex Sans', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.lyric-textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.lyric-textarea::placeholder {
		color: #666;
	}

	.error-message {
		margin-top: 0.5rem;
		color: #ef4444;
		font-size: 0.875rem;
	}
</style>
