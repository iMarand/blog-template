<script>
	import {
		Facebook,
		Twitter,
		Youtube,
		Instagram,
		Mail,
		Users,
		Target,
		ChevronRight
	} from 'lucide-svelte';
	import BlogHeader from '$lib/components/Header.svelte';
	import BlogFooter from '$lib/components/Footer.svelte';

	let { data } = $props();
	let isDarkMode = $state(false);

	const TEAM = [
		{ name: 'John Doe', role: 'Founder & Editor', img: 'https://i.pravatar.cc/150?u=1' },
		{ name: 'Jane Smith', role: 'Tech Reviewer', img: 'https://i.pravatar.cc/150?u=2' },
		{ name: 'Sora Blog', role: 'Content Strategist', img: 'https://i.pravatar.cc/150?u=3' }
	];

	const SOCIAL_LINKS = [
		{ name: 'Facebook', icon: Facebook, color: 'bg-[#3b5999]', label: 'Facebook' },
		{ name: 'Twitter', icon: Twitter, color: 'bg-[#000000]', label: 'Twitter' },
		{ name: 'YouTube', icon: Youtube, color: 'bg-[#cd201f]', label: 'YouTube' },
		{ name: 'Instagram', icon: Instagram, color: 'bg-[#e4405f]', label: 'Instagram' }
	];
</script>

<svelte:head>
	<title>About Us - Plexify</title>
</svelte:head>

<div class="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
	<!-- <BlogHeader bind:isDarkMode /> -->

	<main class="container mx-auto px-4 py-12 lg:px-6">
		<!-- Breadcrumbs -->
		<nav
			class="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
		>
			<a href="/" class="transition-colors hover:text-blue-600">Home</a>
			<ChevronRight class="h-3 w-3" />
			<span class="text-slate-900 underline decoration-blue-600 decoration-2 underline-offset-4"
				>About Us</span
			>
		</nav>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Main Content -->
			<div class="flex flex-col lg:col-span-8">
				<h1 class="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
					Our Mission & <span class="text-blue-600">Story</span>
				</h1>

				<div class="relative mb-10 h-[400px] w-full overflow-hidden shadow-2xl">
					<img
						src="https://picsum.photos/id/20/1200/600"
						alt="Office"
						class="h-full w-full rounded-xs object-cover"
					/>
					<div
						class="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent"
					></div>
				</div>

				<div class="prose max-w-none prose-slate">
					<p class="mb-6 text-lg leading-relaxed text-slate-600">
						Welcome to <span class="font-bold text-slate-900">Plexify</span>. We are a premier
						digital publication dedicated to exploring the intersection of technology, culture, and
						innovation. Since our inception, we've aimed to provide our readers with deep insights,
						honest reviews, and the latest trends that shape our daily lives.
					</p>

					<div class="my-12 grid gap-8 md:grid-cols-2">
						<div
							class="border-t-4 border-blue-600 bg-slate-50 p-8 shadow-sm transition-shadow hover:shadow-md"
						>
							<div
								class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-blue-600 text-white"
							>
								<Target class="h-6 w-6" />
							</div>
							<h3 class="mb-4 text-xl font-bold tracking-wider text-slate-900 uppercase">
								Our Goal
							</h3>
							<p class="text-sm leading-relaxed text-slate-600">
								To deliver high-quality, research-driven content that empowers our readers to make
								informed decisions in a fast-evolving tech landscape.
							</p>
						</div>
						<div
							class="border-t-4 border-slate-900 bg-slate-50 p-8 shadow-sm transition-shadow hover:shadow-md"
						>
							<div
								class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-slate-900 text-white"
							>
								<Users class="h-6 w-6" />
							</div>
							<h3 class="mb-4 text-xl font-bold tracking-wider text-slate-900 uppercase">
								Our Community
							</h3>
							<p class="text-sm leading-relaxed text-slate-600">
								We believe in foster a global community of enthusiasts who are passionate about
								learning and sharing knowledge.
							</p>
						</div>
					</div>

					<h2 class="mb-8 border-b-2 border-slate-100 pb-4 text-3xl font-extrabold text-slate-900">
						Meet the <span class="text-blue-600">Team</span>
					</h2>
					<div class="grid grid-cols-1 gap-10 sm:grid-cols-3">
						{#each TEAM as member}
							<div class="group text-center">
								<div
									class="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-slate-100 p-1 transition-colors group-hover:border-blue-600"
								>
									<img
										src={member.img}
										alt={member.name}
										class="h-full w-full scale-100 rounded-full grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
									/>
								</div>
								<h4
									class="text-lg font-bold tracking-tight text-slate-900 uppercase transition-colors group-hover:text-blue-600"
								>
									{member.name}
								</h4>
								<p class="mt-1 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
									{member.role}
								</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="space-y-12 lg:col-span-4 lg:pl-6">
				<!-- Follow Widget -->
				<div class="flex flex-col">
					<h2
						class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3 text-sm font-bold tracking-wider text-slate-900 uppercase"
					>
						Follow Us
					</h2>
					<div class="grid grid-cols-2 gap-1">
						{#each SOCIAL_LINKS as social}
							<a
								href="/"
								class="{social.color} flex items-center justify-between px-3 py-2 text-white transition-opacity hover:opacity-90"
							>
								<div class="flex items-center gap-2">
									<social.icon class="h-4 w-4 fill-current" /><span
										class="text-[10px] font-bold tracking-wider uppercase">{social.label}</span
									>
								</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Latest Posts Widget -->
				<div>
					<h2
						class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3 text-sm font-bold tracking-wider text-slate-900 uppercase"
					>
						Latest Posts
					</h2>
					<div class="flex flex-col gap-5">
						{#each data.latestPosts as post}
							<a href="/blog/{post.slug}" class="group flex cursor-pointer gap-3">
								<div
									class="h-16 w-20 flex-shrink-0 overflow-hidden border border-slate-100 bg-slate-100"
								>
									<img
										src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/150/100`}
										alt={post.title}
										class="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div>
									<h4
										class="line-clamp-2 text-xs leading-tight font-bold tracking-tight text-slate-900 uppercase transition-colors group-hover:text-blue-600"
									>
										{post.title}
									</h4>
									<span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase"
										>{new Date(post.publishedAt).toLocaleDateString()}</span
									>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</aside>
		</div>
	</main>

	<!-- <BlogFooter categories={data.commonCategories} latestPosts={data.latestPosts} /> -->
</div>
