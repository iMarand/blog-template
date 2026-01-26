<script>
	import { enhance } from '$app/forms';
	import { Plus, Search, Edit, Trash2, Eye, PenTool, Mail } from 'lucide-svelte';

	let { data, form } = $props();
	let searchQuery = $state('');

	let filteredPosts = $derived(
		data.posts.filter((post) => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Posts - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	{#if form?.newsletterSuccess}
		<div
			class="border-l-4 border-green-500 bg-green-50 p-4 text-sm font-bold text-green-700 shadow-sm"
		>
			{form.message}
		</div>
	{/if}

	<!-- Header -->
	<div
		class="flex flex-col gap-4 border-l-4 border-slate-900 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Posts</h1>
			<p class="mt-1 text-xs font-medium text-slate-500">Manage your blog content</p>
		</div>
		<a
			href="/admin/posts/new"
			class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-blue-700"
		>
			<PenTool class="h-3 w-3" />
			New Post
		</a>
	</div>

	<!-- Search & Filters -->
	<div class="border border-slate-200 bg-white p-4 shadow-sm">
		<div class="relative max-w-md">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search posts..."
				bind:value={searchQuery}
				class="w-full border border-slate-300 py-2 pr-4 pl-10 text-sm font-medium transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Posts Table -->
	<div class="overflow-hidden border border-slate-200 bg-white shadow-sm">
		{#if filteredPosts.length === 0}
			<div class="p-12 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50"
				>
					<Edit class="h-8 w-8 text-slate-300" />
				</div>
				<h3 class="mb-2 text-lg font-bold tracking-wide text-slate-900 uppercase">
					{searchQuery ? 'No posts found' : 'No posts yet'}
				</h3>
				<p class="mb-6 text-sm text-slate-500">
					{searchQuery ? 'Try a different search term' : 'Create your first post to get started'}
				</p>
				{#if !searchQuery}
					<a
						href="/admin/posts/new"
						class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700"
					>
						<Plus class="h-4 w-4" />
						Create Post
					</a>
				{/if}
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b border-slate-200 bg-slate-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Title</th
							>
							<th
								class="hidden px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase md:table-cell"
								>Category</th
							>
							<th
								class="hidden px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:table-cell"
								>Status</th
							>
							<th
								class="hidden px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase lg:table-cell"
								>Date</th
							>
							<th
								class="px-6 py-3 text-right text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredPosts as post}
							<tr class="group transition-colors hover:bg-blue-50/30">
								<td class="px-6 py-4">
									<div class="min-w-0">
										<a
											href="/admin/posts/{post.id}"
											class="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600"
										>
											{post.title}
										</a>
										{#if post.authorName && data.user?.role === 'admin'}
											<p
												class="mt-1 text-[10px] font-medium tracking-wider text-slate-400 uppercase"
											>
												by {post.authorName}
											</p>
										{/if}
									</div>
								</td>
								<td class="hidden px-6 py-4 md:table-cell">
									{#if post.categoryName}
										<span
											class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
											style="background-color: {post.categoryColor}15; color: {post.categoryColor};"
										>
											{post.categoryName}
										</span>
									{:else}
										<span class="text-xs text-slate-400">—</span>
									{/if}
								</td>
								<td class="hidden px-6 py-4 sm:table-cell">
									<span
										class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {post.published
											? 'bg-green-100 text-green-700'
											: 'bg-amber-100 text-amber-700'}"
									>
										{post.published ? 'Published' : 'Draft'}
									</span>
								</td>
								<td class="hidden px-6 py-4 lg:table-cell">
									<span class="text-xs font-medium text-slate-500">
										{new Date(post.createdAt).toLocaleDateString()}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										{#if post.published}
											<a
												href="/blog/{post.slug}"
												target="_blank"
												class="p-1.5 text-slate-400 transition-colors hover:text-slate-600"
												title="View post"
											>
												<Eye class="h-4 w-4" />
											</a>
											{#if data.user?.role === 'admin'}
												<form
													action="?/sendNewsletter"
													method="POST"
													use:enhance={() => {
														if (!confirm('Send this article to all subscribers?')) return false;
														return async ({ update }) => {
															await update();
														};
													}}
												>
													<input type="hidden" name="postId" value={post.id} />
													<button
														type="submit"
														class="p-1.5 text-slate-400 transition-colors hover:text-blue-600"
														title="Send Newsletter"
													>
														<Mail class="h-4 w-4" />
													</button>
												</form>
											{/if}
										{/if}
										<a
											href="/admin/posts/{post.id}"
											class="p-1.5 text-slate-400 transition-colors hover:text-blue-600"
											title="Edit post"
										>
											<Edit class="h-4 w-4" />
										</a>
										<form
											action="?/delete"
											method="POST"
											use:enhance={() => {
												if (!confirm('Are you sure you want to delete this post?')) {
													return ({ cancel }) => cancel();
												}
												return async ({ update }) => {
													await update();
												};
											}}
										>
											<input type="hidden" name="postId" value={post.id} />
											<button
												type="submit"
												class="p-1.5 text-slate-400 transition-colors hover:text-red-600"
												title="Delete post"
											>
												<Trash2 class="h-4 w-4" />
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
