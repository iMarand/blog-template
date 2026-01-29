<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	let { data, children } = $props();
	const isAdmin = $derived($page.url.pathname.startsWith('/admin'));
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,900&family=Roboto:wght@400;700;900&display=swap"
		rel="stylesheet"
	/>
	<script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

{#if !isAdmin}
	<Header categories={data.commonCategories} blogName={data.blogName} />
{/if}

<div class="min-h-screen bg-white font-[Roboto] text-[#222]">
	<main>
		{@render children()}
	</main>

	{#if !isAdmin}
		<Footer
			categories={data.commonCategories}
			latestNews={data.latestPosts}
			footerPages={data.footerPages}
			blogName={data.blogName}
		/>
	{/if}
</div>

<style>
	:global(html),
	:global(body) {
		height: auto;
		min-height: 100vh;
	}
</style>
