<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	let { data } = $props();

	let commentName = $state('');
	let commentEmail = $state('');
	let commentContent = $state('');
	let isSubmitting = $state(false);
	let commentStatus = $state(null);

	const post = $derived(data.post);
	const relatedPosts = $derived(data.relatedPosts || []);
	const comments = $derived(data.comments || []);

	async function submitComment(e) {
		e.preventDefault();
		isSubmitting = true;
		commentStatus = null;

		try {
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId: post.id,
					authorName: commentName,
					authorEmail: commentEmail,
					content: commentContent
				})
			});
			const result = await res.json();
			if (result.success) {
				commentStatus = { type: 'success', message: 'Comment posted successfully!' };
				commentName = '';
				commentEmail = '';
				commentContent = '';
				// Reload data to show new comment
				window.location.reload();
			} else {
				commentStatus = { type: 'error', message: result.error || 'Failed to post comment.' };
			}
		} catch (e) {
			commentStatus = { type: 'error', message: 'An error occurred. Please try again.' };
		} finally {
			isSubmitting = false;
		}
	}

	const formattedDate = $derived(
		post.publishedAt
			? new Date(post.publishedAt * 1000).toLocaleDateString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				})
			: ''
	);
</script>

<svelte:head>
	<title>{post.title} - NewsWeek PRO</title>
	<meta name="description" content={post.excerpt || post.title} />
</svelte:head>

{#snippet exclusiveBadge()}
	<span class="bg-red-600 px-1 text-[10px] font-extrabold text-white uppercase">EXCLUSIVE</span>
{/snippet}

<article class="bg-white font-[Roboto] text-[#222]">
	<!-- Hero Section -->
	<div class="relative h-[300px] w-full overflow-hidden sm:h-[400px] md:h-[500px]">
		<img
			src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/1200/600`}
			alt={post.title}
			class="h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
		<div
			class="absolute inset-0 flex flex-col items-center justify-end px-5 pb-10 text-center sm:pb-16"
		>
			<span
				class="mb-2 text-[10px] font-extrabold tracking-widest text-white uppercase sm:mb-4 sm:text-sm"
			>
				{post.categoryName || 'GENERAL'}
			</span>
			<h1
				class="max-w-4xl font-['Playfair_Display'] text-3xl leading-tight font-black text-white italic sm:text-5xl md:text-6xl"
			>
				{post.title}
			</h1>
		</div>
	</div>

	<!-- Info Bar -->
	<div
		class="sm:row mx-auto flex max-w-[1300px] flex-col items-center justify-center gap-2 border-b border-gray-100 px-5 py-4 text-[10px] font-bold text-gray-500 uppercase sm:gap-8 sm:py-6 sm:text-sm"
	>
		<div class="flex items-center gap-2">By: <span class="text-black">Dan Bush</span></div>
		<div class="hidden h-4 w-[1px] bg-gray-300 sm:block"></div>
		<div class="flex items-center gap-2">Date: <span class="text-black">{formattedDate}</span></div>
	</div>

	<div
		class="mx-auto grid max-w-[1300px] grid-cols-1 gap-12 px-5 py-10 sm:gap-16 sm:py-16 lg:grid-cols-[1fr_350px]"
	>
		<!-- Main Content -->
		<div class="min-w-0">
			<!-- Post Content -->
			<div
				class="prose max-w-none prose-slate
				sm:text-2xl sm:text-3xl sm:text-4xl
				prose-headings:font-['Playfair_Display'] prose-headings:tracking-normal prose-headings:text-[#222] prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
				prose-h2:font-bold prose-h2:italic prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
				prose-h3:font-bold prose-p:mb-5 prose-p:leading-relaxed prose-p:font-normal
				prose-p:text-gray-700 prose-blockquote:my-12 prose-blockquote:border-none prose-blockquote:bg-transparent
				prose-blockquote:p-0 prose-blockquote:font-['Playfair_Display'] prose-blockquote:text-2xl
				prose-blockquote:leading-snug prose-blockquote:font-bold prose-blockquote:text-[#e31e24] prose-blockquote:italic
				prose-strong:font-bold prose-strong:text-black
				prose-img:my-8 prose-img:rounded-sm"
			>
				{@html post.html}
			</div>

			<!-- Tags -->
			{#if post.tags && post.tags.length > 0}
				<div class="mt-12 flex flex-wrap items-center gap-2">
					<span class="bg-black px-2 py-1 text-[9px] font-black text-white uppercase">TAGS</span>
					{#each post.tags as tag}
						<span
							class="cursor-pointer border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600 transition-colors hover:border-black"
						>
							{tag}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Navigation -->
			<div class="mt-16 grid grid-cols-1 gap-4 border-t border-gray-100 pt-10 sm:grid-cols-2">
				<div
					class="group cursor-pointer rounded-sm bg-gray-50 p-6 transition-colors hover:bg-gray-100"
				>
					<span class="mb-2 block text-[9px] font-black text-gray-400 uppercase"
						>Previous article</span
					>
					<h4 class="text-sm leading-tight font-black group-hover:text-[#e31e24]">
						THE NEWS WE DIDN'T WANT TO HEAR TODAY
					</h4>
				</div>
				<div
					class="group cursor-pointer rounded-sm bg-gray-50 p-6 text-right transition-colors hover:bg-gray-100"
				>
					<span class="mb-2 block text-[9px] font-black text-gray-400 uppercase">Next article</span>
					<h4 class="text-sm leading-tight font-black group-hover:text-[#e31e24]">
						DESIGNING THE FUTURE OF MODERN HOMES
					</h4>
				</div>
			</div>

			<!-- Author Bio -->
			<div class="sm:row mt-16 flex flex-col gap-6 border-t border-gray-100 pt-10 md:items-center">
				<div class="flex items-center gap-6">
					<img
						src="https://i.pravatar.cc/150?u=danbush"
						alt="Dan Bush"
						class="h-20 w-20 rounded-full object-cover shadow-lg sm:h-24 sm:w-24"
					/>
					<div>
						<h3 class="mb-1 text-xl font-black">Dan Bush</h3>
						<a href="/" class="mb-2 block text-[10px] text-blue-500 italic"
							>https://demo.tagdiv.com/newspaper_week_pro/</a
						>
						<div class="hidden max-w-lg text-sm leading-relaxed text-gray-600 sm:block">
							Newspaper is your news, entertainment, music fashion website. We provide you with the
							latest breaking news.
						</div>
					</div>
				</div>
				<div class="text-sm leading-relaxed text-gray-600 sm:hidden">
					Newspaper is your news, entertainment, music fashion website. We provide you with the
					latest breaking news straight from the heart of industry.
				</div>
				<div class="mt-4 flex gap-6 text-lg text-gray-400 sm:mt-0">
					<span class="cursor-pointer hover:text-[#e31e24]">f</span>
					<span class="cursor-pointer hover:text-[#e31e24]">📸</span>
					<span class="cursor-pointer hover:text-[#e31e24]">𝕏</span>
					<span class="cursor-pointer hover:text-[#e31e24]">▶</span>
				</div>
			</div>

			<!-- Comments Section -->
			<div class="mt-20 border-t border-gray-100 pt-16">
				<div class="mb-10 flex items-center justify-between border-b border-black pb-4">
					<h3 class="text-2xl font-black tracking-tighter uppercase">
						Comments ({comments.length})
					</h3>
				</div>

				{#if comments.length === 0}
					<p class="py-10 text-center text-gray-400 italic">
						No comments yet. Be the first to share your thoughts!
					</p>
				{:else}
					<div class="space-y-10">
						{#each comments as comment}
							<div class="flex gap-6">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-[#e31e24]"
								>
									{comment.authorName.charAt(0).toUpperCase()}
								</div>
								<div class="flex-1">
									<div class="mb-2 flex items-center justify-between">
										<h4 class="text-base font-black uppercase">{comment.authorName}</h4>
										<span class="text-[10px] font-bold text-gray-400 uppercase">
											{new Date(comment.createdAt).toLocaleDateString('en-US', {
												month: 'long',
												day: 'numeric',
												year: 'numeric'
											})}
										</span>
									</div>
									<p class="leading-relaxed text-gray-700">{comment.content}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Post Comment Form -->
				<div class="mt-20 bg-gray-50 p-8 sm:p-12">
					<h3 class="mb-8 text-xl font-black tracking-tighter uppercase">Leave a Reply</h3>

					{#if commentStatus}
						<div
							class="mb-6 rounded-sm p-4 text-sm font-bold {commentStatus.type === 'success'
								? 'border-l-4 border-green-500 bg-green-50 text-green-700'
								: 'border-l-4 border-red-500 bg-red-50 text-red-700'}"
						>
							{commentStatus.message}
						</div>
					{/if}

					<form onsubmit={submitComment} class="space-y-6">
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div class="space-y-2">
								<label class="text-[10px] font-black text-gray-400 uppercase">Your Name *</label>
								<input
									type="text"
									bind:value={commentName}
									required
									placeholder="Name"
									class="w-full border border-gray-200 bg-white p-4 text-sm focus:border-[#e31e24] focus:outline-none"
								/>
							</div>
							<div class="space-y-2">
								<label class="text-[10px] font-black text-gray-400 uppercase">Your Email</label>
								<input
									type="email"
									bind:value={commentEmail}
									placeholder="Email"
									class="w-full border border-gray-200 bg-white p-4 text-sm focus:border-[#e31e24] focus:outline-none"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label class="text-[10px] font-black text-gray-400 uppercase">Comment *</label>
							<textarea
								bind:value={commentContent}
								required
								rows="6"
								placeholder="Write your thoughts..."
								class="w-full resize-none border border-gray-200 bg-white p-4 text-sm focus:border-[#e31e24] focus:outline-none"
							></textarea>
						</div>
						<button
							type="submit"
							disabled={isSubmitting}
							class="flex min-w-[200px] items-center justify-center gap-2 rounded-sm bg-[#e31e24] px-10 py-5 text-sm font-black text-white uppercase shadow-lg transition-colors hover:bg-black disabled:bg-gray-400"
						>
							{#if isSubmitting}
								<span
									class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></span>
							{/if}
							Post Comment
						</button>
					</form>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<aside class="space-y-12 sm:space-y-16">
			<!-- Share Post -->
			<div class="rounded-sm border border-gray-100 bg-white p-8 text-center shadow-sm">
				<h3 class="mb-6 text-[10px] font-black tracking-widest uppercase">Share Post:</h3>
				<div class="grid grid-cols-4 gap-2">
					<button
						class="flex h-10 items-center justify-center rounded-sm bg-blue-600 text-sm font-black text-white uppercase transition-opacity hover:opacity-90"
						>f</button
					>
					<button
						class="flex h-10 items-center justify-center rounded-sm bg-black text-sm font-black text-white uppercase transition-opacity hover:opacity-90"
						>𝕏</button
					>
					<button
						class="flex h-10 items-center justify-center rounded-sm bg-red-600 text-sm font-black text-white uppercase transition-opacity hover:opacity-90"
						>P</button
					>
					<button
						class="flex h-10 items-center justify-center rounded-sm bg-green-500 text-sm font-black text-white uppercase transition-opacity hover:opacity-90"
						>W</button
					>
				</div>
			</div>

			<!-- Subscribe -->
			<div class="rounded-sm bg-gray-50 p-8">
				<h3 class="mb-6 text-2xl font-black tracking-tighter uppercase">Subscribe</h3>
				<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
					<input
						type="email"
						placeholder="Email address"
						class="w-full border border-gray-200 bg-white p-4 text-sm focus:border-[#e31e24] focus:outline-none"
					/>
					<button
						class="flex w-full items-center justify-center gap-2 rounded-sm bg-[#e31e24] p-4 text-sm font-black text-white uppercase shadow-md transition-colors hover:bg-black"
					>
						I WANT IN <span>→</span>
					</button>
					<label class="flex cursor-pointer items-start gap-2 text-[9px] text-gray-500">
						<input type="checkbox" class="mt-0.5" />
						<span
							>I've read and accept the <a href="/privacy" class="font-bold text-[#e31e24]"
								>Privacy Policy</a
							>.</span
						>
					</label>
				</form>
			</div>

			<!-- Popular Section -->
			<div>
				<div class="mb-8 border-b-4 border-black pb-2">
					<h2 class="text-xl font-black tracking-tighter uppercase">Popular</h2>
				</div>
				<div class="space-y-8">
					{#each relatedPosts as item}
						<div class="group flex items-start gap-4">
							<a
								href="/blog/{item.slug}"
								class="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm"
							>
								<img
									src={item.featuredImage || `https://picsum.photos/seed/${item.slug}/100/100`}
									alt=""
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							</a>
							<div>
								<a href="/blog/{item.slug}" class="text-black no-underline">
									<h4
										class="line-clamp-2 text-sm leading-tight font-black transition-colors hover:text-[#e31e24]"
									>
										{item.title}
									</h4>
								</a>
								<span class="mt-2 block text-[9px] font-bold text-gray-400 uppercase">
									{new Date(item.publishedAt * 1000).toLocaleDateString('en-US', {
										month: 'long',
										day: 'numeric',
										year: 'numeric'
									})}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</aside>
	</div>

	<!-- Bottom Section (Related Posts Extended) -->
	{#if relatedPosts.length > 0}
		<div class="border-t border-gray-100 bg-gray-50 py-20">
			<div class="mx-auto max-w-[1300px] px-5">
				<div class="mb-12 flex flex-col items-center">
					<h2 class="text-center text-3xl font-black tracking-tighter uppercase">
						You might also like
					</h2>
					<div class="mt-3 h-1 w-16 bg-[#e31e24]"></div>
				</div>
				<div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
					{#each relatedPosts as item}
						<div class="group">
							<a
								href="/blog/{item.slug}"
								class="relative mb-5 block aspect-video overflow-hidden rounded-sm"
							>
								<img
									src={item.featuredImage || `https://picsum.photos/seed/${item.slug}/600/400`}
									alt={item.title}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
								<div
									class="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent"
								></div>
							</a>
							<a href="/blog/{item.slug}" class="text-black no-underline">
								<h3
									class="font-['Playfair_Display'] text-xl leading-tight font-black italic transition-colors group-hover:text-[#e31e24]"
								>
									{item.title}
								</h3>
							</a>
							<div
								class="mt-4 flex items-center gap-3 text-[9px] font-bold tracking-widest text-gray-400 uppercase"
							>
								<span class="font-black text-black">Dan Bush</span>
								<div class="h-1 w-1 rounded-full bg-gray-300"></div>
								<span
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
		</div>
	{/if}
</article>

<style>
	/* Explicitly force heading weights to ensure they don't look like paragraphs */
	h1 {
		font-weight: 900 !important;
	}
	:global(.prose h1) {
		font-weight: 900 !important;
		font-size: 1.9rem;
		line-height: 2;
		font-family: 'Playfair Display', serif;
	}
	:global(.prose h2) {
		font-weight: 800 !important;
		font-size: 1.5rem;
		line-height: 2;
		font-family: 'Playfair Display', serif;
	}
	:global(.prose h3) {
		font-weight: 800 !important;
		font-size: 1rem;
		line-height: 2;
		font-family: 'Playfair Display', serif;
	}
	:global(.prose strong) {
		font-weight: 800 !important;
	}
	:global(.prose p) {
		font-weight: 300 !important;
		font-size: 18px;
		color: #374151; /* gray-700 */
		line-height: 1.5;
	}
</style>
