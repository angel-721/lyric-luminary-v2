<script lang="ts">
	import { Search, ChevronRight, InProgress } from 'carbon-icons-svelte';

	interface Props {
		onFetch: (lyrics: string, song?: { title: string; artist: string; thumbnail: string }) => void;
	}

	let { onFetch }: Props = $props();

	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchResults = $state<Array<{ id: string; title: string; artist: string; thumbnail: string; url: string }>>([]);
	let selectedSongId = $state<string | null>(null);
	let errorMessage = $state('');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	async function handleSearch() {
		if (!searchQuery.trim() || searchQuery.trim().length < 2) {
			searchResults = [];
			errorMessage = '';
			return;
		}

		isSearching = true;
		errorMessage = '';
		searchResults = [];

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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		if (!searchQuery.trim()) {
			searchResults = [];
			errorMessage = '';
			return;
		}

		if (searchQuery.trim().length >= 2) {
			debounceTimer = setTimeout(() => {
				handleSearch();
			}, 800);
		}
	}

	async function handleSongClick(song: { id: string; title: string; artist: string; thumbnail: string; url: string }) {
		selectedSongId = song.id;
		errorMessage = '';

		try {
			const response = await fetch(`/api/genius/lyrics?url=${encodeURIComponent(song.url)}`);
			const data = await response.json();

			if (data.error) {
				errorMessage = data.error;
				selectedSongId = null;
			} else {
				onFetch(data.lyrics, { title: song.title, artist: song.artist, thumbnail: song.thumbnail });
				searchQuery = '';
				searchResults = [];
			}
		} catch (err) {
			errorMessage = 'Could not fetch lyrics.';
			selectedSongId = null;
		}
	}
</script>

<div class="genius-search-container">
	<div class="search-bar">
		<input
			value={searchQuery}
			oninput={handleInput}
			type="text"
			placeholder="Search by song name..."
			class="search-input"
			disabled={isSearching}
		/>
			<span class="search-icon" class:spinning={isSearching}>
			{#if isSearching}
				<InProgress size={20} />
			{:else}
				<Search size={20} />
			{/if}
		</span>
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
					onclick={() => handleSongClick(song)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleSongClick(song)}
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

						<span class="chevron-icon" class:hidden={selectedSongId === song.id}>
						<ChevronRight size={20} />
					</span>
					<span class="loading-icon" class:hidden={selectedSongId !== song.id}>
						<InProgress size={20} />
					</span>
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
		position: relative;
	}

	.search-input {
		flex: 1;
		padding: 0.75rem 3rem 0.75rem 1rem;
		background-color: var(--bg);
		color: var(--text);
		border: 2px solid var(--overlay);
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
		color: var(--subtext);
	}

	.search-icon {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--subtext);
		pointer-events: none;
	}

	.hidden {
		display: none !important;
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
		color: var(--accent-dim);
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
		background-color: var(--surface);
	}

	.result-row:active:not(.loading) {
		background-color: var(--overlay);
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
		background-color: var(--surface);
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
		color: var(--subtext);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-top: 0.125rem;
	}

	.chevron-icon {
		color: var(--overlay);
		flex-shrink: 0;
	}

	.loading-icon {
		color: var(--accent);
		flex-shrink: 0;
		animation: pulse 1s ease-in-out infinite;
	}

	.row-error {
		margin-left: 3.25rem;
		margin-top: 0.25rem;
		color: var(--accent-dim);
		font-size: 0.75rem;
	}

	.no-results {
		margin-top: 1rem;
		text-align: center;
		color: var(--subtext);
		font-size: 0.875rem;
	}
</style>
