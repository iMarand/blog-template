<script>
	import { Facebook, Twitter, Youtube, Instagram, ChevronRight, ShieldCheck } from 'lucide-svelte';

	let { data } = $props();
	let isDarkMode = $state(false);

	const SOCIAL_LINKS = [
		{ name: 'Facebook', icon: Facebook, color: 'bg-[#3b5999]', label: 'Facebook' },
		{ name: 'Twitter', icon: Twitter, color: 'bg-[#000000]', label: 'Twitter' },
		{ name: 'YouTube', icon: Youtube, color: 'bg-[#cd201f]', label: 'YouTube' },
		{ name: 'Instagram', icon: Instagram, color: 'bg-[#e4405f]', label: 'Instagram' }
	];
</script>

<svelte:head>
	<title>Privacy Policy - Plexify</title>
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
				>Privacy Policy</span
			>
		</nav>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Main Content -->
			<div class="lg:col-span-8">
				<div class="mb-8 flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-100 text-blue-600"
					>
						<ShieldCheck class="h-6 w-6" />
					</div>
					<h1 class="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
						Privacy <span class="text-blue-600">Policy</span>
					</h1>
				</div>

				<div class="prose max-w-none space-y-8 leading-relaxed text-slate-600 prose-slate">
					<section>
						<h2 class="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900">
							1. Overview
						</h2>
						<p>
							Welcome to Plexify's Privacy Policy. Your privacy is critically important to us. This
							document outlines the types of personal information that is received and collected by
							Plexify and how it is used.
						</p>
					</section>

					<section>
						<h2 class="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900">
							2. Information Collection
						</h2>
						<p>
							Like many other Web sites, Plexify makes use of log files. The information inside the
							log files includes internet protocol (IP) addresses, type of browser, Internet Service
							Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze
							trends, administer the site, track user's movement around the site, and gather
							demographic information.
						</p>
					</section>

					<section>
						<h2 class="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900">
							3. Cookies and Web Beacons
						</h2>
						<p>
							Plexify does use cookies to store information about visitors preferences, record
							user-specific information on which pages the user access or visit, customize Web page
							content based on visitors browser type or other information that the visitor sends via
							their browser.
						</p>
					</section>

					<section>
						<h2 class="mb-4 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900">
							4. Third Party Privacy Policies
						</h2>
						<p>
							You should consult the respective privacy policies of these third-party ad servers for
							more detailed information on their practices as well as for instructions about how to
							opt-out of certain practices. Plexify's privacy policy does not apply to, and we
							cannot control the activities of, such other advertisers or web sites.
						</p>
					</section>

					<div class="mt-12 border-l-4 border-blue-600 bg-blue-50 p-6 italic">
						<p class="text-sm font-medium">
							Last updated: January 23, 2026. If you require any more information or have any
							questions about our privacy policy, please feel free to contact us by email at
							privacy@plexify.com.
						</p>
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
