<script>
	import { Facebook, Twitter, Youtube, Instagram, Share2 } from 'lucide-svelte';

	let {
		categories = [],
		latestNews = [],
		footerPages = [],
		blogName = 'NewsWeek',
		siteSettings = {}
	} = $props();
	let email = $state('');
	let status = $state(''); // 'loading', 'success', 'error'
	let message = $state('');

	// Social links with dynamic values
	const socialLinks = $derived(
		[
			{
				name: 'Facebook',
				icon: Facebook,
				bg: 'bg-[#3b5999]',
				href: siteSettings.social_facebook
			},
			{
				name: 'Twitter',
				icon: Twitter,
				bg: 'bg-black',
				href: siteSettings.social_twitter
			},
			{
				name: 'YouTube',
				icon: Youtube,
				bg: 'bg-[#ff0000]',
				href: siteSettings.social_youtube
			},
			{
				name: 'Instagram',
				icon: Instagram,
				bg: 'bg-[#e1306c]',
				href: siteSettings.social_instagram
			},
			{
				name: 'TikTok',
				icon: Share2,
				bg: 'bg-black',
				href: siteSettings.social_tiktok
			}
		].filter((link) => link.href)
	);

	async function subscribe(e) {
		e.preventDefault();
		status = 'loading';
		message = '';

		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const result = await res.json();

			if (res.ok) {
				status = 'success';
				message = 'Thank you for subscribing!';
				email = '';
			} else {
				status = 'error';
				message = result.error || 'Something went wrong. Please try again.';
			}
		} catch (e) {
			status = 'error';
			message = 'Could not connect to the server.';
		}
	}
</script>

<footer class="bg-[#ededed] pt-16 font-[Roboto] text-[#222]">
	<div class="mx-auto max-w-[1300px] px-5">
		<!-- Mobile Logo -->
		<div class="mb-8 text-center md:hidden">
			<a href="/" class="no-underline">
				<h2 class="m-0 font-['Playfair_Display'] text-4xl font-black text-[#222] italic">
					{blogName} <span class="align-top font-[Roboto] text-xs not-italic">PRO</span>
				</h2>
			</a>
		</div>

		<div
			class="mb-12 flex flex-col items-center justify-between border-b-2 border-black pb-8 md:flex-row"
		>
			<h2
				class="m-0 hidden font-['Playfair_Display'] text-4xl font-black text-[#222] italic md:block"
			>
				{blogName} <span class="align-top font-[Roboto] text-xs not-italic">PRO</span>
			</h2>
			<nav class="mt-4 flex flex-wrap justify-center gap-4 md:mt-0 md:gap-5">
				{#each categories as cat}
					<a
						href="/category/{cat.slug}"
						class="text-sm font-bold text-[#222] no-underline transition-colors hover:text-[#e31e24]"
						>{cat.name}</a
					>
				{/each}
			</nav>
		</div>

		<div
			class="grid grid-cols-1 gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-[1fr_0.6fr_1.2fr_1fr] lg:gap-10"
		>
			<!-- About -->
			<div>
				<h3 class="m-0 mb-6 text-2xl font-black">About us</h3>
				<p class="mb-6 text-sm leading-relaxed text-gray-700">
					{siteSettings.blog_description ||
						`${blogName} PRO is your ultimate source for the latest in technology, lifestyle, and global trends. We bring you curated stories that matter.`}
				</p>
				{#if socialLinks.length > 0}
					<div class="flex gap-2">
						{#each socialLinks as social}
							<a
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								class="{social.bg} group flex h-10 w-10 items-center justify-center rounded-sm text-white transition-transform hover:-translate-y-1"
							>
								<social.icon class="h-4 w-4 transition-transform group-hover:scale-110" />
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Company -->
			<div class="lg:pl-5">
				<h3 class="m-0 mb-6 text-2xl font-black">Company</h3>
				<ul class="m-0 list-none p-0">
					{#each footerPages as page}
						<li class="mb-3">
							<a
								href={page.externalUrl || `/${page.slug}`}
								target={page.externalUrl?.startsWith('http') ? '_blank' : '_self'}
								class="text-sm font-black text-black no-underline transition-colors hover:text-[#e31e24]"
								>{page.title}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Latest -->
			<div>
				<h3 class="m-0 mb-6 text-2xl font-black">The latest</h3>
				<div class="space-y-5">
					{#each latestNews as item}
						<div class="border-b border-gray-200 pb-2 last:border-0">
							<a
								href="/blog/{item.slug}"
								class="mb-1 block text-sm leading-snug font-black text-black no-underline transition-colors hover:text-[#e31e24]"
								>{item.title}</a
							>
							<div class="text-xs font-black">
								<span class="mr-2 text-[#e31e24] uppercase">{item.categoryName || 'GENERAL'}</span>
								<span class="font-normal text-gray-600">
									{item.publishedAt
										? new Date(item.publishedAt).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})
										: ''}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Subscribe -->
			<div>
				<h3 class="m-0 mb-6 text-2xl font-black">Subscribe</h3>
				<form class="space-y-3" onsubmit={subscribe}>
					<input
						type="email"
						bind:value={email}
						placeholder="Email address"
						required
						disabled={status === 'loading'}
						class="w-full border border-gray-300 p-4 text-sm focus:border-[#e31e24] focus:outline-none disabled:opacity-50"
					/>
					<button
						type="submit"
						disabled={status === 'loading'}
						class="flex w-full cursor-pointer items-center justify-center gap-2 border-none bg-black p-4 font-black text-white transition-colors hover:bg-[#e31e24] disabled:opacity-50"
					>
						{status === 'loading' ? 'SUBSCRIBING...' : 'I WANT IN'} <span>→</span>
					</button>
					{#if message}
						<p
							class="text-center text-xs font-bold {status === 'success'
								? 'text-green-600'
								: 'text-red-600'}"
						>
							{message}
						</p>
					{/if}
					<label class="flex cursor-pointer items-start gap-2 text-[10px] text-gray-500">
						<input type="checkbox" required class="mt-0.5" />
						<span
							>I've read and accept the <a
								href="/privacy"
								class="text-[#e31e24] no-underline hover:underline">Privacy Policy</a
							>.</span
						>
					</label>
				</form>
			</div>
		</div>
	</div>

	<div class="border-t border-gray-300 px-5 py-8 text-center text-xs text-gray-500">
		<p>
			© {new Date().getFullYear()}
			{blogName} PRO. All Rights Reserved. Designed for premium experience.
		</p>
	</div>
</footer>
