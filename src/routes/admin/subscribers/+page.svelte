<script>
	import { enhance } from '$app/forms';
	import { Mail, Trash2, Search, Calendar, UserCheck } from 'lucide-svelte';

	let { data, form } = $props();
	let searchQuery = $state('');
	let loading = $state(false);

	const filteredSubscribers = $derived(
		data.subscribers.filter((s) => s.email.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Subscribers - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-8">
	<!-- Header -->
	<div
		class="flex flex-col items-start justify-between gap-4 border-l-4 border-slate-900 bg-white px-6 py-4 shadow-sm sm:flex-row sm:items-center"
	>
		<div>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Subscribers</h1>
			<p class="mt-1 text-xs font-medium text-slate-500">
				Manage your newsletter audience ({data.subscribers.length} total)
			</p>
		</div>
		<div
			class="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 font-bold text-blue-600"
		>
			<UserCheck class="h-6 w-6" />
		</div>
	</div>

	<!-- Controls -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative w-full max-w-md">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by email..."
				class="w-full border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
			/>
		</div>
	</div>

	<!-- Subscribers List -->
	<div class="overflow-hidden border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-left text-sm">
			<thead class="bg-slate-50 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
				<tr>
					<th class="px-6 py-4">Email Address</th>
					<th class="px-6 py-4">Subscribed At</th>
					<th class="px-6 py-4 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each filteredSubscribers as sub}
					<tr class="transition-colors hover:bg-slate-50">
						<td class="px-6 py-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-900 text-white"
								>
									<Mail class="h-4 w-4" />
								</div>
								<span class="font-bold text-slate-900">{sub.email}</span>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-2 text-slate-500">
								<Calendar class="h-3 w-3" />
								{new Date(sub.createdAt).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric'
								})}
							</div>
						</td>
						<td class="px-6 py-4 text-right">
							<form
								method="POST"
								action="?/deleteSubscriber"
								use:enhance={() => {
									if (!confirm('Are you sure you want to remove this subscriber?')) return false;
									loading = true;
									return async ({ update }) => {
										loading = false;
										await update();
									};
								}}
							>
								<input type="hidden" name="id" value={sub.id} />
								<button
									type="submit"
									disabled={loading}
									class="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
									title="Remove Subscriber"
								>
									<Trash2 class="h-5 w-5" />
								</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="px-6 py-12 text-center text-slate-400 italic">
							{searchQuery ? 'No subscribers match your search.' : 'No subscribers yet.'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
