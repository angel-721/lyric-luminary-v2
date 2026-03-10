<script lang="ts">
	import { ArrowLeft } from 'carbon-icons-svelte';
</script>

<svelte:head>
	<title>Blog - Lyric Luminary</title>
	<meta name="description" content="Blog posts about Lyric Luminary and music genre prediction" />
</svelte:head>

<div class="container">
	<a href="/" class="back-link">
		<ArrowLeft size={20} />
		<span>Lyric Luminary</span>
	</a>

	<div class="blog-content">
		<p>To be completed soon.</p>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 2rem 1rem;
		max-width: 580px;
		margin: 0 auto;
	}

	.back-link {
		position: absolute;
		top: 2rem;
		left: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #999;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--text);
	}

	.blog-content {
		width: 100%;
		max-width: 580px;
		margin: 0 auto;
		text-align: center;
		margin-top: 4rem;
	}

	.blog-content p {
		font-size: 1.5rem;
		color: var(--text);
		margin: 0;
	}
</style>
