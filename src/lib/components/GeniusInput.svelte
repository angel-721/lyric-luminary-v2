<script lang="ts">
	import { Search, ChevronRight, InProgress } from 'carbon-icons-svelte';

	interface Props {
		onFetch: (lyrics: string) => void;
	}

	let { onFetch }: Props = $props();

	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchResults = $state<Array<{ id: string; title: string; artist: string; thumbnail: string; url: string }>>([]);
	let selectedSongId = $state<string | null>(null);
	let errorMessage = $state('');

	async function handleSearch() {
		if (!searchQuery.trim()) {
			return;
		}

		isSearching = true;
		errorMessage = '';
		searchResults = [];
		selectedSongId = null;

		try {
			const response = await fetch(`/api/genius?q=${encodeURIComponent(searchQuery.trim())}`);
			const data = await response.json();

			if (data.error) {
				errorMessage = data.error;
			} else {
				searchResults = data.results || [];
			}
		} catch (err) {
			errorMessage = 'Search failed. Try again.';
		} finally {
			isSearching = false;
		}
	}

	async function handleSongClick(songUrl: string, songId: string) {
		selectedSongId = songId;
		errorMessage = '';

		try {
			const response = await fetch(`/api/genius/lyrics?url=${encodeURIComponent(songUrl)}`);
			const data = await response.json();

			if (data.error) {
				errorMessage = data.error;
				selectedSongId = null;
			} else {
				// Success! Switch to paste lyrics tab and populate
				onFetch(data.lyrics);
				// Clear search state
				searchQuery = '';
				searchResults = [];
			}
		} catch (err) {
			errorMessage = 'Could not fetch lyrics.';
			selectedSongId = null;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		}
	}
</script>

<div class="genius-search-container">
	<div class="search-bar">
		<input
			bind:value={searchQuery}
			type="text"
			placeholder="Search by song name..."
			class="search-input"
			disabled={isSearching}
			onkeydown={handleKeydown}
		/>
		<button
			onclick={handleSearch}
			disabled={isSearching || !searchQuery.trim()}
			class="search-button"
			aria-label="Search"
		>
			{#if isSearching}
				<InProgress size={20} class="spinning" />
			{:else}
				<Search size={20} />
			{/if}
		</button>
	</div>

	{#if errorMessage && !selectedSongId}
		<p class="error-message">{errorMessage}</p>
	{/if}

	{#if searchResults.length > 0}
		<div class="results-list">
			{#each searchResults as song (song.id)}
				<div
					class="result-row"
					class:loading={selectedSongId === song.id}
					onclick={() => handleSongClick(song.url, song.id)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleSongClick(song.url, song.id)}
				>
					{#if song.thumbnail}
						<img src={song.thumbnail} alt="" class="thumbnail" />
					{:else}
						<div class="thumbnail-placeholder"></div>
					{/if}

					<div class="song-info">
						<div class="song-title">{song.title}</div>
						<div class="song-artist">{song.artist}</div>
					</div>

					{#if selectedSongId === song.id}
						<InProgress size={20} class="loading-icon" />
					{:else}
						<ChevronRight size={20} class="chevron-icon" />
					{/if}
				</div>

				{#if selectedSongId === song.id && errorMessage}
					<p class="row-error">{errorMessage}</p>
				{/if}
			{/each}
		</div>
	{:else if !isSearching && searchQuery.trim() && searchResults.length === 0 && !errorMessage}
		<p class="no-results">No results found</p>
	{/if}
</div>

<style>
	.genius-search-container {
		width: 100%;
	}

	.search-bar {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.search-input {
		flex: 1;
		padding: 0.75rem 3rem 0.75rem 1rem;
		background-color: var(--bg);
		color: var(--text);
		border: 2px solid #333;
		border-radius: 8px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.search-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.search-input::placeholder {
		color: #666;
	}

	.search-button {
		position: absolute;
		right: 0.5rem;
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

	.search-button:hover:not(:disabled) {
		color: var(--text);
	}

	.search-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.search-bar {
		position: relative;
	}

	.search-button {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		padding: 0.5rem;
		background-color: transparent;
		color: #999;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.search-button:hover:not(:disabled) {
		background-color: rgba(245, 166, 35, 0.1);
		color: var(--accent);
	}

	.spinning {
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-message {
		margin-top: 0.75rem;
		color: #ef4444;
		font-size: 0.875rem;
	}

	.results-list {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background-color: transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.result-row:hover:not(.loading) {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.result-row:active:not(.loading) {
		background-color: rgba(255, 255, 255, 0.08);
	}

	.result-row.loading {
		opacity: 0.7;
		pointer-events: none;
	}

	.thumbnail {
		width: 48px;
		height: 48px;
		object-fit: cover;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.thumbnail-placeholder {
		width: 48px;
		height: 48px;
		background-color: #1a1a1a;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.song-info {
		flex: 1;
		min-width: 0;
	}

	.song-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.song-artist {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.75rem;
		color: rgba(240, 237, 232, 0.5);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-top: 0.125rem;
	}

	.chevron-icon {
		color: #666;
		flex-shrink: 0;
	}

	.loading-icon {
		color: var(--accent);
		flex-shrink: 0;
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.row-error {
		margin-left: 3.25rem;
		margin-top: 0.25rem;
		color: #ef4444;
		font-size: 0.75rem;
	}

	.no-results {
		margin-top: 1rem;
		text-align: center;
		color: #999;
		font-size: 0.875rem;
	}
</style>
