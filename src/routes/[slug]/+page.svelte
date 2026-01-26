<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.page.title} - Blog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-5 py-16">
	<article
		class="prose max-w-none prose-slate prose-h1:text-4xl prose-h1:font-black prose-p:text-lg prose-p:leading-relaxed"
	>
		<h1>{data.page.title}</h1>
		<div class="mt-10">
			{@html data.page.htmlContent}
		</div>
	</article>
</div>

<style>
	:global(.prose) {
		color: #334155;
	}
	:global(.prose h1) {
		font-family: 'Playfair Display', serif;
		margin-bottom: 2rem;
	}
</style>
