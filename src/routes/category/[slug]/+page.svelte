<script>
	let { data } = $props();
	const category = $derived(data.category);
	const posts = $derived(data.posts || []);
</script>

<svelte:head>
	<title>{category.name} - NewsWeek PRO</title>
	<meta
		name="description"
		content={category.description || `Browse all stories in ${category.name}`}
	/>
</svelte:head>

<div class="bg-white font-[Roboto] text-[#222]">
	<!-- Category Header -->
	<header class="relative overflow-hidden border-b border-gray-100 py-16 sm:py-24">
		<!-- Blurred Background Image -->
		{#if posts.length > 0}
			<div class="absolute inset-0 z-0">
				<img
					src={posts[0].featuredImage || `https://picsum.photos/seed/${posts[0].slug}/1200/600`}
					alt=""
					class="h-full w-full scale-125 object-cover opacity-90 blur-[10px]"
				/>
				<div class="absolute inset-0 bg-white/0 backdrop-blur-[20px]"></div>
			</div>
		{:else}
			<div class="absolute inset-0 z-0 bg-[#f9f9f9]"></div>
		{/if}

		<div class="relative z-10 mx-auto max-w-[1300px] px-5 text-center">
			<span
				class="mb-4 inline-block bg-[#e31e24] px-4 py-1 text-xs font-black tracking-widest text-white uppercase shadow-sm"
				>Category</span
			>
			<h1
				class="my-6 bg-white/90 rounded-lg py-4 font-['Playfair_Display'] text-5xl font-black tracking-tighter text-[#222] italic drop-shadow-sm sm:text-7xl"
			>
				{category.name}
			</h1>
			<!-- {#if category.description}
				<p class="mx-auto max-w-2xl text-lg leading-relaxed font-light text-gray-700 sm:text-xl">
					{category.description}
				</p>
			{/if} -->
		</div>
	</header>

	<!-- Posts Grid -->
	<main class="mx-auto max-w-[1300px] px-5 py-16 sm:py-24">
		{#if posts.length > 0}
			<div class="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
				{#each posts as post}
					<article class="group flex flex-col">
						<a
							href="/blog/{post.slug}"
							class="relative mb-6 block aspect-[4/3] overflow-hidden rounded-xl"
						>
							<img
								src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/600/450`}
								alt={post.title}
								class="h-full w-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
							/>
							<div
								class="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent"
							></div>
						</a>

						<div class="flex flex-1 flex-col">
							<div class="mb-3 flex items-center gap-3">
								<span class="text-[10px] font-black tracking-wider text-[#e31e24] uppercase"
									>{category.name}</span
								>
								<div class="h-1 w-1 rounded-full bg-gray-300"></div>
								<span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
									{post.publishedAt
										? new Date(post.publishedAt).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})
										: ''}
								</span>
							</div>

							<a href="/blog/{post.slug}" class="mb-4 text-black no-underline">
								<h2
									class="font-['Playfair_Display'] text-2xl leading-tight font-black italic transition-colors group-hover:text-[#e31e24] sm:text-3xl"
								>
									{post.title}
								</h2>
							</a>

							<p class="mb-6 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
								{post.excerpt || ''}
							</p>

							<div class="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 rounded-full bg-gray-200"></div>
									<span class="text-[10px] font-black tracking-wider text-gray-600 uppercase"
										>Dan Bush</span
									>
								</div>
								<a
									href="/blog/{post.slug}"
									class="text-[10px] font-black text-[#e31e24] uppercase hover:underline"
									>Read More →</a
								>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="py-24 text-center">
				<div class="mb-6 text-5xl opacity-20 grayscale">📰</div>
				<h2 class="text-2xl font-black tracking-tighter text-gray-400 uppercase">
					No stories found in this category yet.
				</h2>
				<p class="mt-4 text-gray-500">Check back soon for more updates!</p>
				<a
					href="/"
					class="mt-10 inline-block bg-black px-8 py-3 text-xs font-black text-white uppercase transition-colors hover:bg-[#e31e24]"
					>Return Home</a
				>
			</div>
		{/if}
	</main>
</div>
