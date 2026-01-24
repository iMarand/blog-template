<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,900&family=Roboto:wght@400;700;900&display=swap"
		rel="stylesheet"
	/>
	<script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<Header categories={data.commonCategories} />

<div class="min-h-screen bg-white font-[Roboto] text-[#222]">
	<main>
		{@render children()}
	</main>

	<Footer categories={data.commonCategories} latestNews={data.latestPosts} />
</div>

<style>
	:global(html),
	:global(body) {
		overflow-x: hidden;
		height: auto;
		min-height: 100vh;
	}
</style>
