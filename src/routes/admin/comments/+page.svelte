<script>
	import { enhance } from '$app/forms';
	import { MessageSquare, Check, X, Trash2, ExternalLink } from 'lucide-svelte';
	let { data } = $props();
	let comments = $derived(data.comments || []);
</script>

<svelte:head>
	<title>Comments Management - Admin Panel</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between border-b border-slate-200 pb-4">
		<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Comments Management</h1>
	</div>

	{#if comments.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 bg-white py-20 text-slate-400"
		>
			<MessageSquare class="mb-4 h-12 w-12 opacity-20" />
			<p class="text-sm font-bold tracking-widest uppercase">No comments found</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-sm border border-slate-200 bg-white shadow-sm">
			<table class="w-full text-left text-sm">
				<thead>
					<tr
						class="border-b border-slate-100 bg-slate-50 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
					>
						<th class="px-6 py-4">Author</th>
						<th class="px-6 py-4">Comment</th>
						<th class="px-6 py-4">Post</th>
						<th class="px-6 py-4">Status</th>
						<th class="px-6 py-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each comments as comment}
						<tr class="group transition-colors hover:bg-slate-50/50">
							<td class="px-6 py-4">
								<div class="font-bold text-slate-900">{comment.authorName}</div>
								<div class="text-[10px] text-slate-400">
									{comment.authorEmail || 'No email provided'}
								</div>
								<div class="mt-1 text-[10px] font-bold text-slate-300 uppercase">
									{new Date(comment.createdAt).toLocaleDateString()}
								</div>
							</td>
							<td class="max-w-md px-6 py-4">
								<p class="line-clamp-2 text-slate-600 italic">"{comment.content}"</p>
							</td>
							<td class="px-6 py-4">
								<a
									href="/blog/{comment.postSlug}"
									target="_blank"
									class="flex items-center gap-1 font-bold text-blue-600 hover:underline"
								>
									{comment.postTitle}
									<ExternalLink class="h-3 w-3" />
								</a>
							</td>
							<td class="px-6 py-4">
								{#if comment.approved}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase"
									>
										<Check class="h-3 w-3" /> Approved
									</span>
								{:else}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase"
									>
										<X class="h-3 w-3" /> Pending
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<form
										method="POST"
										action={comment.approved ? '?/unapprove' : '?/approve'}
										use:enhance
									>
										<input type="hidden" name="id" value={comment.id} />
										<button
											class="rounded-sm p-2 transition-colors {comment.approved
												? 'text-amber-600 hover:bg-amber-50'
												: 'text-green-600 hover:bg-green-50'}"
											title={comment.approved ? 'Unapprove' : 'Approve'}
										>
											{#if comment.approved}
												<X class="h-4 w-4" />
											{:else}
												<Check class="h-4 w-4" />
											{/if}
										</button>
									</form>
									<form
										method="POST"
										action="?/delete"
										use:enhance
										onsubmit={() => confirm('Are you sure you want to delete this comment?')}
									>
										<input type="hidden" name="id" value={comment.id} />
										<button
											class="rounded-sm p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
											title="Delete"
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
