<script>
	import { Users, Target, ChevronRight, Globe, Award, Zap } from 'lucide-svelte';

	let { data } = $props();
	const blogName = $derived(data.blogName || 'NewsWeek');
	const settings = $derived(data.siteSettings || {});
</script>

<svelte:head>
	<title>About Us - {blogName} PRO</title>
</svelte:head>

<div class="min-h-screen bg-white font-[Roboto] text-[#222] selection:bg-red-100">
	<main class="mx-auto max-w-[1300px] px-5 py-12">
		<!-- Breadcrumbs -->
		<nav
			class="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase"
		>
			<a href="/" class="transition-colors hover:text-[#e31e24]">Home</a>
			<ChevronRight class="h-3 w-3" />
			<span class="text-[#222] underline decoration-[#e31e24] decoration-2 underline-offset-4"
				>About Us</span
			>
		</nav>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Main Content -->
			<div class="flex flex-col lg:col-span-8">
				<h1
					class="mb-8 font-['Playfair_Display'] text-4xl font-black tracking-tight text-[#222] italic md:text-5xl"
				>
					Our Mission & <span class="text-[#e31e24]">Full Story</span>
				</h1>

				<div class="relative mb-10 h-[400px] w-full overflow-hidden rounded-sm shadow-2xl">
					<img
						src="https://picsum.photos/id/20/1200/600"
						alt="Our Journey"
						class="h-full w-full object-cover"
					/>
					<div
						class="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent"
					></div>
				</div>

				<div class="prose max-w-none space-y-10 leading-relaxed text-gray-600 prose-slate">
					<section>
						<h2 class="mb-4 font-['Playfair_Display'] text-3xl font-black text-[#222] italic">
							The Beginning of <span class="text-[#e31e24]">{blogName}</span>
						</h2>
						<p class="text-lg">
							Welcome to <span class="font-black text-[#222]">{blogName}</span>. We are a premier
							digital publication dedicated to exploring the intersection of technology, culture,
							and innovation. Since our inception, we've aimed to provide our readers with deep
							insights, honest reviews, and the latest trends that shape our daily lives. Our
							journey began with a simple observation: in a world overflowing with information,
							there was a profound need for clarity, integrity, and depth in reporting.
						</p>
						<p>
							What started as a small project by a group of passionate tech enthusiasts has grown
							into a global platform that reaches millions of readers every month. We've stayed true
							to our original vision of providing independent, research-oriented content that cuts
							through the noise of the modern digital landscape.
						</p>
					</section>

					<div class="my-12 grid gap-8 md:grid-cols-2">
						<div class="border-t-4 border-[#e31e24] bg-gray-50 p-8 shadow-sm">
							<div
								class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#e31e24] text-white"
							>
								<Target class="h-6 w-6" />
							</div>
							<h3 class="mb-4 text-xl font-bold tracking-wider text-[#222] uppercase">
								Our Vision
							</h3>
							<p class="text-sm leading-relaxed text-gray-600">
								To deliver high-quality, research-driven content that empowers our readers to make
								informed decisions in a fast-evolving global landscape.
							</p>
						</div>
						<div class="border-t-4 border-[#222] bg-gray-50 p-8 shadow-sm">
							<div
								class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#222] text-white"
							>
								<Globe class="h-6 w-6" />
							</div>
							<h3 class="mb-4 text-xl font-bold tracking-wider text-[#222] uppercase">
								Global Reach
							</h3>
							<p class="text-sm leading-relaxed text-gray-600">
								We believe in fostering a global community of enthusiasts who are passionate about
								learning and sharing knowledge across borders.
							</p>
						</div>
					</div>

					<section>
						<h2 class="mb-4 font-['Playfair_Display'] text-3xl font-black text-[#222] italic">
							Our Core <span class="text-[#e31e24]">Values</span>
						</h2>
						<div class="grid gap-6 md:grid-cols-2">
							<div class="flex gap-4">
								<div class="mt-1 shrink-0 text-[#e31e24]"><Award class="h-5 w-5" /></div>
								<div>
									<h4 class="mb-1 text-sm font-bold tracking-wider text-[#222] uppercase">
										Unwavering Integrity
									</h4>
									<p class="text-sm">
										We provide honest, unbiased reporting that you can trust, free from corporate
										influence or hidden agendas.
									</p>
								</div>
							</div>
							<div class="flex gap-4">
								<div class="mt-1 shrink-0 text-[#e31e24]"><Zap class="h-5 w-5" /></div>
								<div>
									<h4 class="mb-1 text-sm font-bold tracking-wider text-[#222] uppercase">
										Rapid Innovation
									</h4>
									<p class="text-sm">
										We stay ahead of the curve, constantly evolving our digital platforms to deliver
										a better reading experience.
									</p>
								</div>
							</div>
						</div>
					</section>

					<section>
						<h2 class="mb-4 font-['Playfair_Display'] text-3xl font-black text-[#222] italic">
							What Sets Us <span class="text-[#e31e24]">Apart</span>
						</h2>
						<p>
							In an era of clickbait and superficial analysis, we double down on depth. Every
							article published on <span class="font-bold text-[#222]">{blogName}</span> undergoes a rigorous
							editorial process to ensure accuracy and relevance. We don't just report the news; we explain
							what it means for your future, your business, and your life.
						</p>
						<p>
							Our commitment to quality extends beyond our text. From our sleek, responsive design
							to our carefully curated visuals, every element of <span class="font-bold text-[#222]"
								>{blogName}</span
							>
							is designed to provide a premium reading experience that respects your time and intelligence.
						</p>
					</section>

					<section class="border-l-4 border-[#e31e24] bg-red-50 p-8">
						<h3 class="mb-4 text-xl font-bold tracking-wider text-[#222] uppercase">
							The {blogName} Promise
						</h3>
						<p class="text-[#222] italic">
							"To remain the world's most trusted source of digital insight, championing the stories
							that matter and the voices that deserve to be heard. We are dedicated to our readers,
							our community, and the future of independent journalism."
						</p>
					</section>
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="space-y-12 lg:col-span-4 lg:pl-6">
				<!-- Latest Posts Widget -->
				<div>
					<h2
						class="mb-6 flex items-center justify-between border-l-4 border-black bg-gray-50 px-4 py-3 text-sm font-bold tracking-wider text-[#222] uppercase"
					>
						Latest Stories
					</h2>
					<div class="flex flex-col gap-5">
						{#each data.latestPosts as post}
							<a href="/blog/{post.slug}" class="group flex cursor-pointer gap-3">
								<div
									class="h-16 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-gray-100 bg-gray-100"
								>
									<img
										src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/150/100`}
										alt={post.title}
										class="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div>
									<h4
										class="line-clamp-2 text-xs leading-tight font-bold tracking-tight text-[#222] uppercase transition-colors group-hover:text-[#e31e24]"
									>
										{post.title}
									</h4>
									<span class="text-[9px] font-bold tracking-widest text-gray-400 uppercase"
										>{new Date(post.publishedAt * 1000).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric'
										})}</span
									>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</aside>
		</div>
	</main>
</div>
