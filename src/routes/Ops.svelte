<script>
	import {
		Search,
		ArrowRight,
		Play,
		TrendingUp,
		Sun,
		Moon,
		Facebook,
		Twitter,
		Youtube,
		Linkedin,
		Instagram,
		Github,
		ChevronLeft,
		ChevronRight,
		Menu,
		X
	} from 'lucide-svelte';
	import BlogHeader from '$lib/components/BlogHeader.svelte';
	import BlogFooter from '$lib/components/BlogFooter.svelte';

	let { data } = $props();

	// --- Runes: State Management ---
	let isDarkMode = $state(false);

	// --- DATA MAPPING ---
	const heroPosts = $derived(data.heroPosts || []);
	const heroMain = $derived(heroPosts[0] || {});
	const heroSub = $derived(heroPosts.slice(1, 5));

	const techPosts = $derived(data.techPosts || []);
	const techFeatured = $derived(techPosts[0] || heroMain);
	const techList = $derived(techPosts.slice(1, 4));

	const videoPosts = $derived(data.videoPosts || []);
	const videoMain = $derived(videoPosts[0] || heroMain);
	const videoSub = $derived(videoPosts.slice(1, 7));

	const popularPosts = $derived(data.popularPosts || []);

	const BREAKING_NEWS = $derived(
		data.heroPosts
			? data.heroPosts.map((p) => p.title)
			: [
					'Opera Browser Lets You Apply Dark Mode to Web Page',
					'The 18 Practices for Building Responsive Web Applications'
				]
	);

	const SOCIAL_LINKS = [
		{ name: 'Facebook', icon: Facebook, color: 'bg-[#3b5999]', label: 'Facebook' },
		{ name: 'Twitter', icon: Twitter, color: 'bg-[#000000]', label: 'Twitter' },
		{ name: 'YouTube', icon: Youtube, color: 'bg-[#cd201f]', label: 'YouTube' },
		{ name: 'Instagram', icon: Instagram, color: 'bg-[#e4405f]', label: 'Instagram' },
		{ name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0077b5]', label: 'LinkedIn' },
		{ name: 'Skype', icon: Search, color: 'bg-[#00aff0]', label: 'Skype' }
	];

	const SIDEBAR_TAGS = $derived(data.categories || []);

	const SIDEBAR_COMMENTS = [
		{ author: 'Sora Blogging Tips', text: 'This Is Third Testing Comment' },
		{ author: 'Sora Blogging Tips', text: 'This Is Second Testing Comment' },
		{ author: 'Sora Blogging Tips', text: 'This Is First Testing Reply' }
	];
</script>

<svelte:head>
	<title>Big Info</title>
</svelte:head>

<div class="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
	<BlogHeader bind:isDarkMode />

	<div class="hidden border-b border-[#faf2cc] bg-[#fcf8e3] py-3">
		<div class="container mx-auto flex items-center justify-between px-4 lg:px-6">
			<div class="flex items-center gap-4 overflow-hidden">
				<span
					class="flex flex-shrink-0 items-center gap-1 text-[10px] font-bold text-blue-600 uppercase"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span> Breaking
					<ChevronRight class="h-3 w-3" />
				</span>
				<div class="truncate text-sm font-medium text-slate-700">
					{BREAKING_NEWS[0]}
				</div>
			</div>
			<div class="flex flex-shrink-0 gap-1">
				<button
					class="flex h-7 w-7 items-center justify-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
					><ChevronLeft class="h-4 w-4" /></button
				>
				<button
					class="flex h-7 w-7 items-center justify-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
					><ChevronRight class="h-4 w-4" /></button
				>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8 lg:px-6">
		<div
			class="flex h-24 w-full items-center justify-center border border-slate-200 bg-slate-100 text-sm text-slate-400 italic shadow-sm"
		>
			Responsive Advertisement
		</div>
	</div>

	<section class="container mx-auto mt-4 px-4 lg:px-6">
		<div class="grid h-auto grid-cols-1 gap-1 lg:h-[500px] lg:grid-cols-2">
			<a
				href="/blog/{heroMain.slug}"
				class="group relative h-[400px] w-full cursor-pointer overflow-hidden bg-slate-200 lg:h-full"
			>
				<img
					src={heroMain.featuredImage || `https://picsum.photos/seed/${heroMain.slug}/800/600`}
					alt={heroMain.title}
					class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
				></div>
				<div class="absolute bottom-0 left-0 p-6 md:p-8">
					<span
						class="mb-3 inline-block bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase"
						>{heroMain.categoryName || 'General'}</span
					>
					<h2 class="mb-2 text-2xl leading-tight font-bold text-white md:text-4xl">
						{heroMain.title}
					</h2>
					<div class="text-xs text-slate-300">
						<span class="font-bold text-white">Sora Tips</span> - {heroMain.publishedAt
							? new Date(heroMain.publishedAt).toLocaleDateString()
							: ''}
					</div>
				</div>
			</a>
			<div class="grid grid-cols-2 grid-rows-2 gap-1">
				{#each heroSub as item}
					<a
						href="/blog/{item.slug}"
						class="group relative cursor-pointer overflow-hidden bg-slate-200"
					>
						<img
							src={item.featuredImage || `https://picsum.photos/seed/${item.slug}/400/300`}
							alt={item.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
						></div>
						<div class="absolute bottom-0 left-0 p-4">
							<span
								class="mb-2 inline-block bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase"
								>{item.categoryName || 'General'}</span
							>
							<h3 class="line-clamp-2 text-sm leading-tight font-bold text-white md:text-base">
								{item.title}
							</h3>
							<p class="mt-1 text-[10px] text-slate-300">
								{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<section class="py-12">
		<div class="container mx-auto px-4 lg:px-6">
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-12">
				<div class="flex flex-col gap-12 lg:col-span-8">
					<div>
						<div
							class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3"
						>
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Technology</h2>
							<a href="/" class="text-xs font-medium text-slate-500 hover:text-blue-600">View all</a
							>
						</div>
						<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
							<a href="/blog/{techFeatured.slug}" class="group cursor-pointer">
								<div class="relative mb-4 overflow-hidden rounded-sm">
									<img
										src={techFeatured.featuredImage ||
											`https://picsum.photos/seed/${techFeatured.slug}/600/400`}
										alt={techFeatured.title}
										class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
									<span
										class="absolute bottom-0 left-0 bg-blue-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
										>{techFeatured.categoryName || 'Technology'}</span
									>
								</div>
								<h3
									class="mb-2 text-2xl leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600"
								>
									{techFeatured.title}
								</h3>
								<div class="mb-3 text-xs text-slate-400">
									<span class="font-medium text-blue-600">Sora Tips</span> - {techFeatured.publishedAt
										? new Date(techFeatured.publishedAt).toLocaleDateString()
										: ''}
								</div>
								<p class="line-clamp-3 text-sm leading-relaxed text-slate-500">
									{techFeatured.excerpt || ''}
								</p>
							</a>
							<div class="flex flex-col gap-6">
								{#each techList as item}
									<a href="/blog/{item.slug}" class="group flex cursor-pointer gap-4">
										<div class="h-20 w-28 flex-shrink-0 overflow-hidden rounded-sm bg-slate-100">
											<img
												src={item.featuredImage ||
													`https://picsum.photos/seed/${item.slug}/150/100`}
												alt={item.title}
												class="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
										</div>
										<div class="flex-1">
											<h4
												class="mb-1 text-sm leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600"
											>
												{item.title}
											</h4>
											<span class="text-[10px] text-slate-400"
												>{item.publishedAt
													? new Date(item.publishedAt).toLocaleDateString()
													: ''}</span
											>
										</div>
									</a>
								{/each}
							</div>
						</div>
					</div>

					<div>
						<div
							class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3"
						>
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Videos</h2>
							<a href="/" class="text-xs font-medium text-slate-500 hover:text-blue-600">View all</a
							>
						</div>
						<a
							href="/blog/{videoMain.slug}"
							class="group relative mb-6 block cursor-pointer overflow-hidden bg-slate-200"
						>
							<img
								src={videoMain.featuredImage ||
									`https://picsum.photos/seed/${videoMain.slug}/800/400`}
								alt={videoMain.title}
								class="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							<div
								class="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10"
							></div>
							<div class="absolute inset-0 flex items-center justify-center">
								<div
									class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-black/30 backdrop-blur-sm transition-transform hover:scale-110"
								>
									<Play class="ml-1 h-8 w-8 fill-white text-white" />
								</div>
							</div>
							<div
								class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6"
							>
								<span
									class="mb-2 inline-block bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase"
									>{videoMain.categoryName || 'Entertainment'}</span
								>
								<h3 class="mb-1 text-2xl font-bold text-white">{videoMain.title}</h3>
								<div class="text-xs text-slate-300">
									by <span class="font-bold text-white">Sora Tips</span> - {videoMain.publishedAt
										? new Date(videoMain.publishedAt).toLocaleDateString()
										: ''}
								</div>
							</div>
						</a>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
							{#each videoSub as vid}
								<a href="/blog/{vid.slug}" class="group cursor-pointer">
									<div class="relative mb-3 overflow-hidden rounded-sm bg-slate-200">
										<img
											src={vid.featuredImage || `https://picsum.photos/seed/${vid.slug}/300/200`}
											alt={vid.title}
											class="aspect-video w-full object-cover transition-transform group-hover:scale-105"
										/>
										<div
											class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
										>
											<div class="rounded-full bg-black/50 p-2 text-white">
												<Play class="h-4 w-4 fill-white" />
											</div>
										</div>
										<span
											class="absolute bottom-0 left-0 bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase"
											>{vid.categoryName || 'Entertainment'}</span
										>
									</div>
									<h4
										class="text-sm leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600"
									>
										{vid.title}
									</h4>
									<p class="mt-1 text-[10px] text-slate-400">
										{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString() : ''}
									</p>
								</a>
							{/each}
						</div>
					</div>
				</div>

				<div class="space-y-10 lg:col-span-4 lg:pl-6">
					<div>
						<div class="mb-5 border-l-4 border-slate-900 bg-yellow-50 px-4 py-2">
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Follow Us</h2>
						</div>
						<div class="grid grid-cols-2 gap-1">
							{#each SOCIAL_LINKS as social}
								<a
									href="/"
									class="{social.color} flex items-center justify-between px-3 py-2 text-white transition-opacity hover:opacity-90"
								>
									<div class="flex items-center gap-2">
										<social.icon class="h-4 w-4 fill-current" /><span class="text-xs font-bold"
											>{social.label}</span
										>
									</div>
								</a>
							{/each}
						</div>
					</div>
					<div>
						<div class="mb-5 border-l-4 border-slate-900 bg-yellow-50 px-4 py-2">
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">
								Recent Posts
							</h2>
						</div>
						<div class="flex flex-col gap-4">
							{#each popularPosts as post, i}
								{#if i === 0}
									<a
										href="/blog/{post.slug}"
										class="group relative h-40 w-full cursor-pointer overflow-hidden bg-slate-200"
									>
										<img
											src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/400/250`}
											alt={post.title}
											class="h-full w-full object-cover transition-transform group-hover:scale-105"
										/>
										<div
											class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
										></div>
										<div class="absolute bottom-0 left-0 p-4">
											<span
												class="mb-2 inline-block bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase"
												>{post.categoryName || 'General'}</span
											>
											<h3 class="text-sm leading-tight font-bold text-white">{post.title}</h3>
										</div>
									</a>
								{:else}
									<a href="/blog/{post.slug}" class="group flex cursor-pointer gap-3">
										<div class="h-16 w-20 flex-shrink-0 overflow-hidden bg-slate-100">
											<img
												src={post.featuredImage ||
													`https://picsum.photos/seed/${post.slug}/100/100`}
												alt={post.title}
												class="h-full w-full object-cover transition-transform group-hover:scale-105"
											/>
										</div>
										<div>
											<h4
												class="line-clamp-2 text-xs leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-600"
											>
												{post.title}
											</h4>
											<span class="text-[10px] text-slate-400"
												>{post.publishedAt
													? new Date(post.publishedAt).toLocaleDateString()
													: ''}</span
											>
										</div>
									</a>
								{/if}
							{/each}
						</div>
					</div>
					<div>
						<div class="mb-5 border-l-4 border-slate-900 bg-yellow-50 px-4 py-2">
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Comments</h2>
						</div>
						<div class="flex flex-col gap-5">
							{#each SIDEBAR_COMMENTS as comment}
								<div class="flex gap-4">
									<div
										class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
									>
										SBT
									</div>
									<div>
										<h5 class="text-sm font-bold text-slate-900">{comment.author}</h5>
										<p class="text-xs text-slate-500 italic">"{comment.text}"</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div>
						<div class="mb-5 border-l-4 border-slate-900 bg-yellow-50 px-4 py-2">
							<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Main Tags</h2>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each SIDEBAR_TAGS as tag}
								<a
									href="/category/{tag.slug}"
									class="cursor-pointer rounded-sm bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-blue-600 hover:text-white"
									>{tag.name}</a
								>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<BlogFooter categories={data.commonCategories} latestPosts={data.latestPosts} />
</div>
