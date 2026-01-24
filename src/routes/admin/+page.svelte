<script>
	let { data } = $props();
	import { FileText, Users, Eye, TrendingUp, PenTool, ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Dashboard - Admin Panel</title>
</svelte:head>

<div class="space-y-8">
	<!-- Welcome -->
	<div
		class="flex flex-col items-start justify-between gap-4 border-l-4 border-slate-900 bg-yellow-50 px-6 py-4 md:flex-row md:items-center"
	>
		<div>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">
				Welcome back, {data.user?.displayName || 'Admin'}!
			</h1>
			<p class="mt-1 text-sm text-slate-600">Here's what's happening with your blog today.</p>
		</div>
		<a
			href="/"
			target="_blank"
			class="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase hover:text-blue-800"
		>
			Visit Site <ExternalLink class="h-3 w-3" />
		</a>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="group relative overflow-hidden border border-slate-200 bg-white p-6">
			<div class="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
				<FileText class="h-16 w-16 text-blue-600" />
			</div>
			<div>
				<p class="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Total Posts</p>
				<p class="text-4xl font-extrabold text-slate-900">{data.stats.totalPosts}</p>
			</div>
			<div class="mt-4 flex items-center gap-2 text-xs font-bold">
				<span class="rounded-sm bg-green-50 px-2 py-0.5 text-green-600"
					>{data.stats.publishedPosts} Published</span
				>
				<span class="rounded-sm bg-amber-50 px-2 py-0.5 text-amber-600"
					>{data.stats.draftPosts} Drafts</span
				>
			</div>
		</div>

		{#if data.user?.role === 'admin'}
			<div class="group relative overflow-hidden border border-slate-200 bg-white p-6">
				<div
					class="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20"
				>
					<Users class="h-16 w-16 text-purple-600" />
				</div>
				<div>
					<p class="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Authors</p>
					<p class="text-4xl font-extrabold text-slate-900">{data.stats.totalAuthors}</p>
				</div>
				<div class="mt-4 text-xs font-bold text-slate-400">Active contributors</div>
			</div>

			<div class="group relative overflow-hidden border border-slate-200 bg-white p-6">
				<div
					class="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20"
				>
					<TrendingUp class="h-16 w-16 text-green-600" />
				</div>
				<div>
					<p class="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Categories</p>
					<p class="text-4xl font-extrabold text-slate-900">{data.stats.totalCategories}</p>
				</div>
				<div class="mt-4 text-xs font-bold text-slate-400">Content categories</div>
			</div>
		{/if}
	</div>

	<!-- Recent Posts -->
	<div>
		<div
			class="mb-4 flex items-center justify-between border-l-4 border-slate-900 bg-white px-4 py-2"
		>
			<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Recent Posts</h2>
			<a
				href="/admin/posts"
				class="text-xs font-bold tracking-wider text-blue-600 uppercase hover:text-blue-800"
			>
				View all
			</a>
		</div>

		<div class="border border-slate-200 bg-white">
			{#if data.recentPosts.length === 0}
				<div class="p-12 text-center">
					<FileText class="mx-auto mb-4 h-12 w-12 text-slate-300" />
					<h3 class="mb-2 text-lg font-bold text-slate-900">No posts yet</h3>
					<p class="mb-4 text-sm text-slate-500">Get started by creating your first post</p>
					<a
						href="/admin/posts/new"
						class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700"
					>
						<PenTool class="h-4 w-4" />
						Create Post
					</a>
				</div>
			{:else}
				<div class="divide-y divide-slate-100">
					{#each data.recentPosts as post}
						<a
							href="/admin/posts/{post.id}"
							class="group block px-6 py-4 transition-colors hover:bg-slate-50"
						>
							<div class="flex items-center justify-between">
								<div class="min-w-0 flex-1">
									<h3
										class="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-600"
									>
										{post.title}
									</h3>
									<div class="mt-1 flex items-center gap-3">
										<span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
											{new Date(post.createdAt).toLocaleDateString()}
										</span>
										{#if post.categoryName}
											<span
												class="bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase"
											>
												{post.categoryName}
											</span>
										{/if}
									</div>
								</div>
								<span
									class="ml-4 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {post.published
										? 'bg-green-100 text-green-700'
										: 'bg-amber-100 text-amber-700'}"
								>
									{post.published ? 'Published' : 'Draft'}
								</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
