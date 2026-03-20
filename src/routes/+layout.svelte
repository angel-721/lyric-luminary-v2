<script lang="ts">
	import './layout.css';
	import { LogoGithub, MachineLearning, DataBase, User } from 'carbon-icons-svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	let { children } = $props();
	injectAnalytics({ mode: dev ? 'development' : 'production' });

</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="icon" href="/favicon.ico" sizes="any" />

	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
	<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
	<link rel="manifest" href="/site.webmanifest" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<footer class="footer">
	<a
		href="https://github.com/angel-721/lyric-luminary-v2"
		target="_blank"
		rel="noopener noreferrer"
		class="footer-link"
		aria-label="View source on GitHub"
	>
		<LogoGithub size={16} />
		<span>Source</span>
	</a>
	<span class="footer-divider">·</span>
	<a
		href="https://huggingface.co/spaces/angel-721/song-genre-classifier"
		target="_blank"
		rel="noopener noreferrer"
		class="footer-link"
		aria-label="View HuggingFace Space"
	>
		<MachineLearning size={16} />
		<span>HuggingFace Space</span>
	</a>
	<span class="footer-divider">·</span>
	<a
		href="https://www.kaggle.com/datasets/mateibejan/multilingual-lyrics-for-genre-classification"
		target="_blank"
		rel="noopener noreferrer"
		class="footer-link"
		aria-label="View dataset on Kaggle"
	>
		<DataBase size={16} />
		<span>Dataset</span>
	</a>
	<span class="footer-divider">·</span>
	<a
		href="https://angelv.dev"
		target="_blank"
		rel="noopener noreferrer"
		class="footer-link"
		aria-label="Visit personal website"
	>
		<User size={16} />
		<span>Personal Website</span>
	</a>
</footer>
