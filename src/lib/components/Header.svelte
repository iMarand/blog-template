<script>
	import { Menu, X, Search } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	let { categories = [], blogName = 'NewsWeek' } = $props();
	let menuOpen = $state(false);
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let liveResults = $state([]);
	let loading = $state(false);
	let debounceTimer;

	async function fetchLiveResults() {
		if (searchQuery.length < 3) {
			liveResults = [];
			return;
		}

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			loading = true;
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
				const data = await res.json();
				liveResults = data.posts || [];
			} catch (e) {
				console.error('Live search error:', e);
			} finally {
				loading = false;
			}
		}, 300);
	}

	function handleSearch(e) {
		e.preventDefault();
		if (searchQuery.trim()) {
			searchOpen = false;
			clearTimeout(debounceTimer);
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			searchQuery = '';
			liveResults = [];
		}
	}

	let isSticky = $state(false);

	$effect(() => {
		const handleScroll = () => {
			// Change 100 to the height of your main header
			isSticky = window.scrollY > 120;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header class="relative border-b border-gray-200 pt-5 font-[Roboto]">
	<div class="mx-auto max-w-[1300px] px-5">
		<div class="flex items-center justify-between pb-6">
			<!-- Menu (Left) -->
			<div class="flex-1">
				<button
					class="flex cursor-pointer items-center gap-2 border-none bg-transparent font-extrabold focus:outline-none"
					onclick={() => (menuOpen = !menuOpen)}
				>
					<Menu class="h-6 w-6" />
					<span class="hidden text-sm md:inline">MENU</span>
				</button>
			</div>

			<!-- Logo (Center) -->
			<div class="flex-shrink-0 text-center">
				<a href="/" class="group no-underline">
					<h1
						class="m-0 inline-flex items-baseline font-['Playfair_Display'] text-[2.2rem] leading-none font-black text-[#e31e24] italic md:text-[3.2rem]"
					>
						{blogName}
						<span
							class="ml-1 font-[Roboto] text-[0.7rem] font-black tracking-tighter text-[#222] uppercase italic not-italic md:text-[0.9rem]"
							>PRO</span
						>
					</h1>
				</a>
			</div>

			<!-- Search (Right) -->
			<div class="flex flex-1 justify-end">
				<button
					class="flex cursor-pointer items-center gap-2 border-none bg-transparent font-extrabold focus:outline-none"
					onclick={() => (searchOpen = !searchOpen)}
				>
					<Search class="h-6 w-6" />
					<span class="hidden text-sm uppercase md:inline">Search</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Search Overlay (Dropdown Style) -->
	{#if searchOpen}
		<div
			class="animate-in fade-in slide-in-from-top-2 pointer-events-auto absolute top-full right-0 left-0 z-[1100] border-b border-gray-200 bg-white shadow-2xl duration-300"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mx-auto max-w-[1300px] px-5 py-10">
				<!-- Search bar -->
				<form onsubmit={handleSearch} class="mb-10 flex h-14">
					<input
						type="text"
						bind:value={searchQuery}
						oninput={fetchLiveResults}
						placeholder="Search for..."
						class="flex-1 border border-r-0 border-gray-200 px-6 text-lg font-medium focus:ring-0 focus:outline-none"
						autoFocus
					/>
					<button
						type="submit"
						class="cursor-pointer border-none bg-[#e31e24] px-10 font-bold tracking-wider text-white uppercase transition-colors hover:bg-black"
					>
						Search
					</button>
				</form>

				{#if loading}
					<div class="py-10 text-center text-gray-400 italic">Searching...</div>
				{:else if liveResults.length > 0}
					<div class="mb-8">
						<h3
							class="mb-6 border-b border-gray-100 pb-2 text-xs font-bold tracking-widest text-gray-400 uppercase"
						>
							Stories
						</h3>
						<div class="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
							{#each liveResults as post}
								<a
									href="/blog/{post.slug}"
									class="group flex gap-4 no-underline"
									onclick={() => (searchOpen = false)}
								>
									<div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm">
										<img
											src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/100/100`}
											alt=""
											class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
									</div>
									<div class="flex-1">
										<h4
											class="mb-2 line-clamp-2 text-[15px] leading-tight font-black text-black transition-colors group-hover:text-[#e31e24]"
										>
											{post.title}
										</h4>
										<div class="flex items-center gap-2 text-[10px] font-bold">
											<span class="text-[#e31e24] uppercase">{post.categoryName || 'General'}</span>
											<span class="text-gray-400"
												>{post.publishedAt
													? new Date(post.publishedAt).toLocaleDateString('en-US', {
															month: 'long',
															day: 'numeric',
															year: 'numeric'
														})
													: ''}</span
											>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
					<div class="border-t border-gray-100 pt-6 text-center">
						<a
							href="/search?q={searchQuery}"
							class="text-[11px] font-black tracking-[2px] text-[#e31e24] uppercase no-underline transition-colors hover:text-black"
							onclick={() => (searchOpen = false)}
						>
							View All Results
						</a>
					</div>
				{:else if searchQuery.length > 2 && !loading}
					<div class="py-10 text-center text-gray-400 italic">
						No stories found for "{searchQuery}"
					</div>
				{/if}
			</div>
		</div>
	{/if}
</header>

<!-- Sticky Navigation -->
<nav class="sticky-nav">
	<div class="mx-auto flex max-w-[1300px] items-center px-5">
		<!-- Sticky Leading (Left) -->
		<div
			class="flex flex-shrink-0 items-center gap-2 transition-all duration-300 md:gap-3 {isSticky
				? 'translate-x-0 opacity-100 md:w-[240px]'
				: 'pointer-events-none w-0 -translate-x-4 overflow-hidden opacity-0'}"
		>
			<!-- Menu Button -->
			<button
				class="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-colors hover:text-[#e31e24]"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Toggle Menu"
			>
				<Menu class="h-5 w-5 md:h-6 md:w-6" />
			</button>

			<a
				href="/"
				class="hidden flex-shrink-0 no-underline transition-opacity hover:opacity-80 md:block"
			>
				<span
					class="font-['Playfair_Display'] text-base font-black text-[#e31e24] italic md:text-2xl"
				>
					{blogName}
					<!-- <span
						class="ml-0.5 hidden font-[Roboto] text-[0.6rem] font-black text-[#222] not-italic md:inline-block md:text-[0.7rem]"
						>PRO</span
					> -->
				</span>
			</a>
		</div>

		<!-- Horizontal Scrollable Nav (Robust Alignment + Scroll Indicators) -->
		<div class="scroll-container flex-1 overflow-x-auto {isSticky ? 'is-sticky' : 'is-normal'}">
			<div class="flex min-w-full items-center">
				<!-- Left Spacer: Dynamic growth to handle alignment -->
				<div
					class="flex-1 transition-all duration-500 {isSticky
						? 'md:flex-grow-[1]'
						: 'md:flex-grow-[1]'}"
				></div>

				<ul
					class="m-0 flex items-center justify-center list-none w-full gap-3 p-0 px-5 md:px-5 py-1 font-bold whitespace-nowrap transition-all duration-500 md:gap-4"
				>
					{#each categories as cat, i}
						<li class="text-center block">
							<a
								href="/category/{cat.slug}"
								class="text-[11px] text-center border-red-400 font-bold tracking-wider text-black uppercase no-underline transition-colors hover:text-[#e31e24] md:text-[13px]"
								>{cat.name}</a
							>
						</li>

						{#if i != categories.length - 1}
							<div class="flex justify-center items-center">
								<li class="w-3 h-0.5 bg-red-500"></li>
							</div>
							{:else}
							<div class="flex justify-center items-center">
								<li class="w-3 h-0.5 bg-white/10"></li>
							</div>

						{/if}

					{/each}
				</ul>

				<!-- Right Spacer: Only grows when NOT sticky to keep it centered -->
				<div
					class="transition-all duration-500 {!isSticky
						? 'flex-1 md:flex-grow-[1]'
						: 'w-0 overflow-hidden opacity-0'}"
				></div>
			</div>
		</div>
	</div>
</nav>

<!-- Mobile Overlay Menu -->
{#if menuOpen}
	<div
		class="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm"
		onclick={() => (menuOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)}
		role="button"
		tabindex="0"
	>
		<div
			class="absolute top-0 bottom-0 left-0 flex w-[85%] max-w-[320px] flex-col bg-white p-8 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="button"
			tabindex="0"
		>
			<div class="mb-10 flex items-center justify-between">
				<h2 class="font-['Playfair_Display'] text-2xl font-black text-[#e31e24] italic">
					{blogName} <span class="text-xs font-black text-black not-italic">PRO</span>
				</h2>
				<button
					onclick={() => (menuOpen = false)}
					class="cursor-pointer rounded-full border-none bg-transparent p-2 hover:bg-gray-100"
				>
					<X class="h-6 w-6" />
				</button>
			</div>

			<div class="thin-scrollbar flex-1 overflow-y-auto pr-2">
				<nav class="flex flex-col gap-5">
					<a
						href="/"
						class="border-b border-gray-100 pb-2 text-xl font-black text-black no-underline hover:text-[#e31e24]"
						>Home</a
					>
					{#each categories as cat}
						<a
							href="/category/{cat.slug}"
							class="text-base font-bold text-gray-700 no-underline transition-colors hover:text-[#e31e24]"
							onclick={() => (menuOpen = false)}
						>
							{cat.name}
						</a>
					{/each}
				</nav>
			</div>

			<div class="mt-auto border-t border-gray-100 pt-10">
				<button
					class="mb-6 w-full cursor-pointer rounded-sm bg-[#e31e24] py-4 font-black text-white uppercase transition-colors hover:bg-black"
					>Subscribe</button
				>
				<div class="flex justify-center gap-8 text-xl font-bold text-gray-400">
					<span>f</span><span>📸</span><span>𝕏</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.sticky-nav {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		z-index: 1000;
		background-color: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(8px);
		border-top: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
		font-family: 'Roboto', sans-serif;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	/* Scroll Indicators (Edge Fades) */
	.scroll-container {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.scroll-container.is-normal {
		mask-image: linear-gradient(
			to right,
			transparent,
			black 15px,
			black calc(100% - 15px),
			transparent
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent,
			black 15px,
			black calc(100% - 15px),
			transparent
		);
	}

	.scroll-container.is-sticky {
		/* Mobile sticky: no left fade, fade only on right */
		mask-image: linear-gradient(to right, black calc(100% - 15px), transparent);
		-webkit-mask-image: linear-gradient(to right, black calc(100% - 15px), transparent);
	}

	@media (min-width: 768px) {
		.scroll-container.is-sticky {
			/* Desktop sticky: symmetric small fades */
			mask-image: linear-gradient(
				to right,
				transparent,
				black 15px,
				black calc(100% - 15px),
				transparent
			);
			-webkit-mask-image: linear-gradient(
				to right,
				transparent,
				black 15px,
				black calc(100% - 15px),
				transparent
			);
		}
	}

	.scroll-container::-webkit-scrollbar {
		display: none;
	}

	/* Thin Scrollbar for Mobile Menu */
	.thin-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.thin-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.thin-scrollbar::-webkit-scrollbar-thumb {
		background-color: #e5e7eb;
		border-radius: 20px;
	}
	.thin-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: #d1d5db;
	}
</style>
