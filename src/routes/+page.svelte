<script>
	let { data } = $props();

	// --- STATE & DATA ---
	let menuOpen = $state(false);

	const categories = $derived((data.categories || []).map((c) => c.name));
	const categoryList = $derived(data.categories || []);
	const popularPosts = $derived(data.popularPosts || []);
	const blogName = $derived(data.blogName || 'ExtraMele');

	const carouselPosts = $derived(
		(data.carouselPosts || []).map((p) => ({
			...p,
			date: p.publishedAt
				? new Date(p.publishedAt * 1000).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	const freshStories = $derived(
		(data.freshStories || []).map((p) => ({
			...p,
			category: p.categoryName || 'GENERAL',
			date: p.publishedAt
				? new Date(p.publishedAt * 1000).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	const heroFeatured = $derived(data.heroFeatured || {});

	const popularVisual = $derived(data.popularVisual || []);

	const popularList = $derived(
		(data.popularList || []).map((p) => ({
			...p,
			category: p.categoryName || 'GENERAL',
			date: p.publishedAt
				? new Date(p.publishedAt * 1000).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	// --- DATA FOR BREAKING NEWS ---
	const breakingGrid = $derived(
		(data.breakingGrid || []).map((p) => ({
			cat: p.categoryName || 'GENERAL',
			title: p.title,
			slug: p.slug,
			exclusive: p.isExclusive,
			img: p.featuredImage || `https://picsum.photos/seed/${p.slug}/400/500`
		}))
	);

	const breakingBottomList = $derived(
		(data.breakingBottomList || []).map((p) => ({
			cat: p.categoryName || 'GENERAL',
			title: p.title,
			slug: p.slug,
			exclusive: p.isExclusive,
			img: p.featuredImage || `https://picsum.photos/seed/${p.slug}/100/80`
		}))
	);

	// --- DATA FOR RECENT POSTS ---
	const recentFeatured = $derived(data.recentFeatured || {});

	const recentGrid = $derived(
		(data.recentGrid || []).map((p) => ({
			...p,
			date: p.publishedAt
				? new Date(p.publishedAt * 1000).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	const recentSidebarFeatured = $derived(data.recentSidebarFeatured || {});

	const recentSidebar = $derived(
		(data.recentSidebarList || []).map((p) => ({
			cat: p.categoryName || 'GENERAL',
			title: p.title,
			slug: p.slug,
			date: p.publishedAt
				? new Date(p.publishedAt * 1000).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	// --- FOOTER DATA ---
	const footerLinks = ['About', 'Contact us', 'Subscription Plans', 'My account'];

	const latestNews = $derived(
		(data.carouselPosts || []).slice(0, 3).map((p) => ({
			category: p.categoryName || 'GENERAL',
			title: p.title,
			slug: p.slug,
			date: p.publishedAt
				? new Date(p.publishedAt).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})
				: ''
		}))
	);

	const footerCategories = $derived(categories);
</script>

<svelte:head>
	<title>{blogName} - Your Source for extra articles and information</title>
</svelte:head>

{#snippet exclusiveBadge()}
	<span class="bg-red-600 px-1 text-[10px] font-extrabold text-white">EXCLUSIVE</span>
{/snippet}

<div class="bg-white">
	<!-- Featured News Scroller -->
	<div class="mx-auto mb-10 max-w-[1300px] border-b border-gray-200 py-3 sm:py-5">
		<div class="flex items-center px-2 sm:px-5">
			<button
				class="mx-1 hidden h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-gray-400 transition-colors hover:bg-gray-300 sm:mx-2 sm:flex"
				>‹</button
			>
			<div class="no-scrollbar flex-1 overflow-x-auto">
				<div class="flex gap-4 px-2 pb-2 sm:gap-8 sm:px-0 sm:pb-0">
					{#each carouselPosts as post}
						<div
							class="min-w-[240px] flex-shrink-0 border-r border-gray-100 pr-4 last:border-0 last:pr-0 sm:min-w-[280px]"
						>
							<a href="/blog/{post.slug}" class="group block text-inherit no-underline">
								{#if post.exclusive}{@render exclusiveBadge()}{/if}
								<strong
									class="line-clamp-2 text-[13px] leading-tight transition-colors group-hover:text-[#e31e24] sm:text-[15px]"
									>{post.title}</strong
								>
								<span
									class="mt-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase"
									>{post.date}</span
								>
							</a>
						</div>
					{/each}
				</div>
			</div>
			<button
				class="mx-1 hidden h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-gray-400 transition-colors hover:bg-gray-300 sm:mx-2 sm:flex"
				>›</button
			>
		</div>
	</div>

	<style>
		.no-scrollbar::-webkit-scrollbar {
			display: none;
		}
		.no-scrollbar {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
	</style>

	<!-- HERO SECTION - RESPONSIVE -->
	<main
		class="mx-auto mb-16 grid max-w-[1300px] grid-cols-1 gap-10 px-5 lg:grid-cols-[1fr_3fr_1fr_1fr] lg:gap-8"
	>
		<!-- CENTER COLUMN: Featured Image (Mobile First: Top) -->
		<section class="order-1 lg:order-2 lg:col-span-1">
			<a
				href="/blog/{heroFeatured.slug}"
				class="group relative block h-[400px] overflow-hidden rounded-lg sm:h-[500px] lg:h-full lg:min-h-[580px]"
			>
				<img
					src={heroFeatured.featuredImage ||
						`https://picsum.photos/seed/${heroFeatured.slug}/800/600`}
					alt={heroFeatured.title}
					class="h-full w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-105"
				/>
				<div
					class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-6 text-white sm:p-10"
				>
					<span class="bg-[#e31e24] px-2 py-1 text-[10px] font-extrabold uppercase"
						>{heroFeatured.categoryName || 'GENERAL'}</span
					>
					<h2
						class="my-3 font-['Playfair_Display'] text-2xl leading-tight font-black italic sm:my-4 sm:text-4xl lg:text-[2.8rem]"
					>
						{heroFeatured.title}
					</h2>
					<p class="hidden text-sm leading-relaxed opacity-90 sm:line-clamp-2 sm:text-base">
						{heroFeatured.excerpt || ''}
					</p>
				</div>
			</a>
		</section>

		<!-- LEFT COLUMN: Fresh stories -->
		<aside class="order-2 lg:order-1">
			<div class="mb-6 border-b-4 border-black pb-2">
				<h2 class="m-0 text-2xl font-black tracking-tighter uppercase">Fresh stories</h2>
				<p class="mt-1 text-[9px] leading-none font-black text-gray-400 uppercase">
					Browse our editor's hand picked articles!
				</p>
			</div>

			<div class="space-y-6">
				{#each freshStories as story}
					<div class="border-b border-gray-100 pb-4 last:border-0">
						<div class="mb-2 flex items-center gap-2">
							{#if story.exclusive}{@render exclusiveBadge()}{/if}
							<span class="text-[10px] font-black text-[#e31e24] uppercase">{story.category}</span>
							<span class="text-[10px] font-bold text-gray-400">{story.date}</span>
						</div>
						<a href="/blog/{story.slug}" class="group text-black no-underline"
							><h3
								class="m-0 text-base leading-tight font-black transition-colors group-hover:text-[#e31e24]"
							>
								{story.title}
							</h3></a
						>
					</div>
				{/each}
			</div>
			<div class="mt-6 flex gap-1">
				<button
					class="cursor-pointer border border-gray-200 bg-none px-3 py-1 text-gray-400 transition-colors hover:border-black hover:text-black"
					>←</button
				>
				<button
					class="cursor-pointer border border-gray-200 bg-none px-3 py-1 text-gray-400 transition-colors hover:border-black hover:text-black"
					>→</button
				>
			</div>
		</aside>

		<!-- RIGHT COLUMN: Popular -->
		<aside class="order-3 lg:order-3">
			<div class="mb-6 border-b-4 border-black pb-2">
				<h2 class="m-0 text-2xl font-black tracking-tighter uppercase">Popular</h2>
			</div>

			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
				{#each popularVisual as item}
					<div class="group">
						<a href="/blog/{item.slug}" class="relative mb-3 block overflow-hidden rounded-sm">
							<div class="aspect-[3/4] w-full">
								<img
									src={item.featuredImage || `https://picsum.photos/seed/${item.slug}/400/300`}
									alt={item.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							</div>
						</a>
						<div>
							<span class="mb-1 block text-[10px] font-bold text-[#e31e24] uppercase"
								>{item.categoryName || 'GENERAL'}</span
							>
							<a href="/blog/{item.slug}" class="no-underline">
								<h4
									class="m-0 text-base leading-tight font-black text-black transition-colors group-hover:text-[#e31e24]"
								>
									{item.title}
								</h4>
							</a>
						</div>
					</div>
				{/each}
			</div>
		</aside>

		<!-- List Sidebar -->
		<div class="order-4 h-fit bg-gray-50 p-6 shadow-sm lg:order-4 lg:p-4">
			<div class="space-y-5">
				{#each popularList as item}
					<div class="border-b border-gray-200 pb-3 last:border-0">
						<div class="mb-1 flex items-center gap-2">
							<span class="text-[9px] font-black text-[#e31e24] uppercase">{item.category}</span>
							{#if item.exclusive}{@render exclusiveBadge()}{/if}
						</div>
						<a href="/blog/{item.slug}" class="group text-black no-underline">
							<h5
								class="m-0 text-sm leading-snug font-black transition-colors group-hover:text-[#e31e24]"
							>
								{item.title}
							</h5>
						</a>
						<span class="mt-1 block text-[9px] font-bold text-gray-400 uppercase">{item.date}</span>
					</div>
				{/each}
			</div>
		</div>
	</main>

	<!-- BREAKING NEWS SECTION -->
	<div class="mt-5 border-t border-gray-200 bg-[#f9f9f9] py-16">
		<div class="mx-auto max-w-[1300px] px-5">
			<div
				class="mb-10 flex flex-col items-center justify-between gap-4 border-b border-gray-300 pb-6 md:flex-row"
			>
				<span class="text-[10px] font-black tracking-widest text-[#e31e24]">STAY CONNECTED</span>
				<h2
					class="m-0 text-center font-['Playfair_Display'] text-2xl font-black italic sm:text-3xl md:text-left"
				>
					For even more exclusive content!
				</h2>
				<div class="flex gap-6 text-xl font-bold text-gray-400">
					<span class="cursor-pointer hover:text-[#e31e24]">f</span>
					<span class="cursor-pointer hover:text-[#e31e24]">📸</span>
					<span class="cursor-pointer hover:text-[#e31e24]">𝕏</span>
				</div>
			</div>

			<div class="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each breakingGrid as item, i}
					<a
						href="/blog/{item.slug}"
						class="group relative block aspect-[3/4] overflow-hidden rounded-lg"
					>
						{#if i === 0}
							<div class="absolute top-4 left-4 z-10 flex flex-col">
								<span
									class="bg-[#e31e24] px-2 py-1 text-[10px] font-black text-white uppercase italic shadow-lg"
									>Breaking News</span
								>
							</div>
						{/if}
						<img
							src={item.img}
							alt={item.title}
							class="h-full w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-110"
						/>
						<div
							class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6"
						>
							<span
								class="mb-2 inline-block w-fit bg-[#e31e24] px-2 py-0.5 text-[9px] font-black text-white uppercase"
								>{item.cat}</span
							>
							<h4 class="m-0 text-lg leading-tight font-black text-white group-hover:underline">
								{item.title}
							</h4>
						</div>
					</a>
				{/each}
			</div>

			<div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each breakingBottomList as post}
					<a
						href="/blog/{post.slug}"
						class="group flex items-center justify-between gap-4 border-b border-gray-200 pb-4 text-inherit no-underline"
					>
						<div class="flex-1">
							{#if post.exclusive}{@render exclusiveBadge()}{/if}
							<h5
								class="m-0 mb-1 text-sm leading-snug font-black transition-colors group-hover:text-[#e31e24]"
							>
								{post.title}
							</h5>
							<span class="text-[9px] font-black text-[#e31e24] uppercase">{post.cat}</span>
						</div>
						<div class="h-[70px] w-[85px] flex-shrink-0 overflow-hidden rounded-sm">
							<img
								src={post.img}
								alt=""
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
							/>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- RECENT POSTS SECTION -->
	<section class="relative mx-auto max-w-[1300px] overflow-hidden px-5 py-24">
		<div
			class="pointer-events-none absolute top-10 left-0 -z-10 text-[6rem] font-black tracking-[-10px] opacity-[0.03] select-none sm:text-[10rem]"
		>
			LATEST NEWS
		</div>

		<div class="mb-16 flex flex-col items-center">
			<h2 class="text-4xl font-black tracking-tighter uppercase sm:text-5xl">Recent posts</h2>
			<div class="mt-4 h-1.5 w-20 bg-[#e31e24]"></div>
		</div>

		<div class="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_350px] lg:gap-20">
			<!-- Main Feed -->
			<div>
				<div class="group mb-5 flex flex-col gap-10 border-b border-gray-100 pb-5 md:flex-row">
					<div class="relative overflow-hidden rounded-sm md:w-1/2">
						<img
							src={recentFeatured.featuredImage ||
								`https://picsum.photos/seed/${recentFeatured.slug}/600/400`}
							alt=""
							class="h-[300px] w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<span
							class="absolute top-4 left-4 bg-black/80 px-3 py-1 text-[10px] font-black text-white uppercase"
							>Featured</span
						>
					</div>
					<div class="flex flex-col justify-center md:w-1/2">
						<div class="mb-4 flex items-center gap-3">
							<span class="text-xs font-black text-[#e31e24] uppercase"
								>{recentFeatured.categoryName || 'GENERAL'}</span
							>
							<div class="h-1 w-1 rounded-full bg-gray-300"></div>
							<span class="text-[10px] font-bold tracking-wider text-gray-500 uppercase"
								>{recentFeatured.publishedAt
									? new Date(recentFeatured.publishedAt).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric'
										})
									: ''}</span
							>
						</div>
						<a href="/blog/{recentFeatured.slug}" class="text-black no-underline"
							><h3
								class="m-0 mb-4 font-['Playfair_Display'] text-3xl leading-tight font-black italic transition-colors group-hover:text-[#e31e24] sm:text-4xl"
							>
								{recentFeatured.title}
							</h3></a
						>
						<p class="mb-6 line-clamp-3 leading-relaxed text-gray-600">
							{recentFeatured.excerpt || ''}
						</p>
						<div class="flex items-center gap-3">
							<img
								src={recentFeatured.authorAvatar ||
									`https://i.pravatar.cc/50?u=${recentFeatured.authorName || 'staff'}`}
								alt={recentFeatured.authorName || 'Staff Writer'}
								class="h-8 w-8 rounded-full object-cover"
							/>
							<span class="text-xs font-black uppercase"
								>{recentFeatured.authorName || 'Staff Writer'}</span
							>
						</div>
					</div>
				</div>

				<!-- Recent Grid -->
				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
					{#each recentGrid as post}
						<div class="group">
							<a
								href="/blog/{post.slug}"
								class="relative mb-5 block aspect-[4/3] overflow-hidden rounded-sm"
							>
								<img
									src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/400/300`}
									alt=""
									class="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-110"
								/>
								<span
									class="absolute top-4 left-4 bg-[#e31e24] px-2 py-1 text-[9px] font-black text-white uppercase"
									>{post.categoryName || 'GENERAL'}</span
								>
							</a>
							<div>
								{#if post.exclusive}{@render exclusiveBadge()}{/if}
								<a href="/blog/{post.slug}" class="text-black no-underline"
									><h4
										class="m-0 mb-3 text-base leading-tight font-black transition-colors group-hover:text-[#e31e24]"
									>
										{post.title}
									</h4></a
								>
								<div class="flex items-center gap-2 text-[10px] font-bold text-gray-400">
									<span class="font-black text-black uppercase"
										>{post.authorName || 'Staff Writer'}</span
									>
									<span>—</span>
									<span class="tracking-widest uppercase">{post.date}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="space-y-16">
				<!-- Promotional/Stick Feature -->
				<div class="group relative h-fit overflow-hidden rounded-sm">
					<a href="/blog/{recentSidebarFeatured.slug}" class="block">
						<div class="aspect-[3/4]">
							<img
								src={recentSidebarFeatured.featuredImage ||
									`https://picsum.photos/seed/${recentSidebarFeatured.slug}/400/500`}
								alt=""
								class="h-full w-full rounded-lg object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</div>
						<div
							class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-8"
						>
							<span
								class="mb-3 inline-block w-fit bg-red-600 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase"
								>{recentSidebarFeatured.categoryName || 'GENERAL'}</span
							>
							<h4
								class="m-0 mb-3 font-['Playfair_Display'] text-2xl leading-tight font-black text-white italic"
							>
								{recentSidebarFeatured.title}
							</h4>
							<span class="text-[10px] font-bold tracking-widest text-gray-300 uppercase"
								>Editor's Pick</span
							>
						</div>
					</a>
				</div>

				<!-- Most Read List -->
				<div>
					<div class="mb-8 border-b-4 border-black pb-2">
						<h3 class="m-0 text-xl font-black tracking-tighter uppercase">Popular Posts</h3>
					</div>
					<div class="space-y-8">
						{#each popularPosts.slice(0, 5) as item}
							<div class="group flex gap-4">
								<div class="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-gray-200"></div>
								<div class="flex-1">
									<span class="mb-1 block text-[10px] font-black text-[#e31e24] uppercase"
										>{item.categoryName || 'GENERAL'}</span
									>
									<a href="/blog/{item.slug}" class="text-black no-underline"
										><h5
											class="m-0 text-sm leading-tight font-black transition-colors group-hover:text-[#e31e24]"
										>
											{item.title}
										</h5></a
									>
									<span
										class="mt-2 block text-[9px] font-bold tracking-wider text-gray-400 uppercase"
										>{new Date(item.publishedAt * 1000).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric'
										})}</span
									>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Sidebar Pagination -->
				<div class="flex justify-center gap-3">
					<button
						class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-300 transition-all hover:border-black hover:text-black"
						>←</button
					>
					<button
						class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-300 transition-all hover:border-black hover:text-black"
						>→</button
					>
				</div>
			</aside>
		</div>
	</section>
</div>
