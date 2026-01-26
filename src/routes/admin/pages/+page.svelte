<script>
	import { enhance } from '$app/forms';
	import { Plus, Search, Edit, Trash2, FileText, Eye } from 'lucide-svelte';

	let { data, form } = $props();
	let searchQuery = $state('');

	let filteredPages = $derived(
		data.pages.filter((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Pages - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 border-l-4 border-slate-900 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Pages</h1>
			<p class="mt-1 text-xs font-medium text-slate-500">
				Manage static pages like About, Contact...
			</p>
		</div>
		<a
			href="/admin/pages/new"
			class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-blue-700"
		>
			<Plus class="h-3 w-3" />
			New Page
		</a>
	</div>

	<!-- Search -->
	<div class="border border-slate-200 bg-white p-4 shadow-sm">
		<div class="relative max-w-md">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				placeholder="Search pages..."
				bind:value={searchQuery}
				class="w-full border border-slate-300 py-2 pr-4 pl-10 text-sm font-medium transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Pages Table -->
	<div class="overflow-hidden border border-slate-200 bg-white shadow-sm">
		{#if filteredPages.length === 0}
			<div class="p-12 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50"
				>
					<FileText class="h-8 w-8 text-slate-300" />
				</div>
				<h3 class="mb-2 text-lg font-bold tracking-wide text-slate-900 uppercase">
					{searchQuery ? 'No pages found' : 'No pages yet'}
				</h3>
				<p class="mb-6 text-sm text-slate-500">
					{searchQuery ? 'Try a different search term' : 'Create your first static page'}
				</p>
				{#if !searchQuery}
					<a
						href="/admin/pages/new"
						class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700"
					>
						<Plus class="h-4 w-4" />
						Create Page
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
								class="px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Slug</th
							>
							<th
								class="px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Status</th
							>
							<th
								class="px-6 py-3 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Sitemap</th
							>
							<th
								class="px-6 py-3 text-right text-[10px] font-bold tracking-wider text-slate-500 uppercase"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each filteredPages as page}
							<tr class="group transition-colors hover:bg-blue-50/30">
								<td class="px-6 py-4">
									<a
										href="/admin/pages/{page.id}"
										class="text-sm font-bold text-slate-900 hover:text-blue-600"
									>
										{page.title}
									</a>
								</td>
								<td class="px-6 py-4">
									<span class="text-xs text-slate-500">/{page.slug}</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {page.published
											? 'bg-green-100 text-green-700'
											: 'bg-amber-100 text-amber-700'}"
									>
										{page.published ? 'Published' : 'Draft'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase {page.inSitemap
											? 'bg-blue-100 text-blue-700'
											: 'bg-slate-100 text-slate-500'}"
									>
										{page.inSitemap ? 'In Sitemap' : 'Hidden'}
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										{#if page.published}
											<a
												href="/{page.slug}"
												target="_blank"
												class="p-1.5 text-slate-400 hover:text-slate-600"
												title="View page"
											>
												<Eye class="h-4 w-4" />
											</a>
										{/if}
										<a
											href="/admin/pages/{page.id}"
											class="p-1.5 text-slate-400 hover:text-blue-600"
											title="Edit page"
										>
											<Edit class="h-4 w-4" />
										</a>
										<form
											action="?/delete"
											method="POST"
											use:enhance={() => {
												if (!confirm('Delete this page?')) return false;
												return async ({ update }) => await update();
											}}
										>
											<input type="hidden" name="id" value={page.id} />
											<button
												type="submit"
												class="p-1.5 text-slate-400 hover:text-red-600"
												title="Delete page"
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
