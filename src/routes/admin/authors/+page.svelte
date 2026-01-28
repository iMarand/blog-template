<script>
	import { enhance } from '$app/forms';
	import {
		Plus,
		UserPlus,
		Copy,
		Check,
		ToggleLeft,
		ToggleRight,
		Mail,
		Clock,
		X,
		AlertCircle
	} from 'lucide-svelte';

	let { data, form } = $props();
	let showInviteModal = $state(false);
	let inviteEmail = $state('');
	let copied = $state(false);

	function copyInviteLink(token) {
		const url = `${window.location.origin}/admin/authors/invite/${token}`;
		navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Authors - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-8">
	<!-- Header -->
	<div
		class="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Authors</h1>
			<p class="mt-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
				Manage blog authors and invite new contributors
			</p>
		</div>
		<button
			onclick={() => (showInviteModal = true)}
			class="inline-flex items-center justify-center gap-2 bg-blue-600 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700"
		>
			<UserPlus class="h-4 w-4" />
			Invite New Author
		</button>
	</div>

	{#if form?.success}
		<div class="border-l-4 border-green-500 bg-green-50 p-6 shadow-sm">
			<div class="flex items-center gap-3 text-green-700">
				<Check class="h-5 w-5 flex-shrink-0" />
				<p class="text-sm font-bold tracking-tight">Invite created successfully!</p>
			</div>
			{#if form.inviteUrl}
				<div class="mt-4 border border-green-200 bg-white p-4">
					<p class="mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
						Share this link with the author:
					</p>
					<div class="flex items-center gap-2">
						<code
							class="flex-1 overflow-x-auto bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600"
							>{form.inviteUrl}</code
						>
						<button
							onclick={() => copyInviteLink(form.token)}
							class="bg-slate-100 p-2 transition-colors hover:bg-slate-200"
							title="Copy Link"
						>
							{#if copied}
								<Check class="h-4 w-4 text-green-600" />
							{:else}
								<Copy class="h-4 w-4 text-slate-600" />
							{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div class="border-l-4 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
		<!-- Main List -->
		<div class="space-y-8 lg:col-span-2">
			<!-- Authors Table -->
			<div class="border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
					<h2 class="text-xs font-bold tracking-wider text-slate-900 uppercase">
						Active Authors ({data.authors.length})
					</h2>
				</div>

				{#if data.authors.length === 0}
					<div class="py-20 text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-dashed border-slate-300 text-slate-300"
						>
							<UserPlus class="h-8 w-8" />
						</div>
						<h3 class="text-sm font-bold text-slate-900 uppercase">No authors found</h3>
						<p class="mt-1 text-xs text-slate-500">Invite someone to start writing.</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full text-left">
							<thead>
								<tr class="border-b border-slate-100 bg-slate-50/50">
									<th
										class="px-6 py-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase"
										>Author</th
									>
									<th
										class="px-6 py-3 text-center text-[10px] font-bold tracking-wider text-slate-500 uppercase"
										>Posts</th
									>
									<th
										class="px-6 py-3 text-right text-[10px] font-bold tracking-wider text-slate-500 uppercase"
										>Status</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each data.authors as author}
									<tr class="group transition-colors hover:bg-slate-50">
										<td class="px-6 py-4">
											<div class="flex items-center gap-4">
												<div
													class="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-900 text-sm font-bold text-white"
												>
													{author.displayName?.charAt(0).toUpperCase() ||
														author.username.charAt(0).toUpperCase()}
												</div>
												<div class="min-w-0">
													<p class="truncate font-bold text-slate-900">
														{author.displayName ||
															(author.role === 'admin' ? 'Staff Writer' : author.username)}
													</p>
													<p class="text-[10px] font-bold text-slate-500 uppercase">
														@{author.username} • {author.email || 'No email'}
													</p>
												</div>
											</div>
										</td>
										<td class="px-6 py-4 text-center">
											<span class="text-xs font-bold text-slate-600">{author.postCount || 0}</span>
										</td>
										<td class="px-6 py-4">
											<div class="flex justify-end">
												<form action="?/toggleStatus" method="POST" use:enhance>
													<input type="hidden" name="authorId" value={author.id} />
													<button
														type="submit"
														class="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors {author.active
															? 'bg-green-100 text-green-700 hover:bg-green-200'
															: 'bg-red-100 text-red-700 hover:bg-red-200'}"
													>
														<div
															class="h-1.5 w-1.5 rounded-full {author.active
																? 'bg-green-600'
																: 'bg-red-600'}"
														></div>
														{author.active ? 'Active' : 'Disabled'}
													</button>
												</form>
												<a
													href="/admin/authors/{author.id}"
													class="ml-2 flex items-center gap-1.5 bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase transition-colors hover:bg-slate-200"
												>
													Edit
												</a>
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

		<!-- Sidebar / Invites -->
		<div class="space-y-8">
			<!-- Pending Invites -->
			<div class="border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
					<h2 class="text-xs font-bold tracking-wider text-slate-900 uppercase">Pending Invites</h2>
				</div>

				{#if data.pendingInvites.length === 0}
					<div class="p-6 text-center text-xs font-medium text-slate-400 italic">
						No pending invites.
					</div>
				{:else}
					<div class="divide-y divide-slate-100">
						{#each data.pendingInvites as invite}
							<div class="space-y-3 p-4">
								<div class="flex items-start justify-between">
									<div class="min-w-0">
										<p class="truncate text-xs font-bold text-slate-900">
											{invite.email || 'Private Invite'}
										</p>
										<div
											class="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"
										>
											<Clock class="h-3 w-3" />
											Expires {new Date(invite.expiresAt).toLocaleDateString()}
										</div>
									</div>
									<button
										onclick={() => copyInviteLink(invite.token)}
										class="bg-slate-100 p-1.5 transition-colors hover:bg-slate-200"
										title="Copy Invite Link"
									>
										{#if copied}
											<Check class="h-3 w-3 text-green-600" />
										{:else}
											<Copy class="h-3 w-3 text-slate-600" />
										{/if}
									</button>
								</div>
								<div
									class="bg-slate-50 p-2 font-mono text-[9px] break-all text-slate-400 select-all"
								>
									{invite.token.substring(0, 16)}...
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Invite Tips -->
			<div class="border border-blue-100 bg-blue-50 p-5">
				<h3 class="mb-2 text-[10px] font-bold tracking-wider text-blue-900 uppercase">Pro Tip</h3>
				<p class="text-xs leading-relaxed text-blue-800">
					Invited authors can only write and manage their own posts. Only admins can manage
					categories, themes, and other authors.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Invite Modal -->
{#if showInviteModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
	>
		<div class="w-full max-w-md border border-slate-200 bg-white shadow-2xl">
			<div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
				<h2 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Invite Author</h2>
				<button
					onclick={() => (showInviteModal = false)}
					class="text-slate-400 hover:text-slate-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<form
				action="?/invite"
				method="POST"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showInviteModal = false;
						inviteEmail = '';
					};
				}}
			>
				<div class="space-y-4 p-6">
					<div>
						<label class="mb-2 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
							Email (optional)
						</label>
						<input
							type="email"
							name="email"
							bind:value={inviteEmail}
							class="w-full border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
							placeholder="author@example.com"
						/>
						<p class="mt-2 text-[10px] font-bold text-slate-400 uppercase italic">
							If provided, only this email can use the invite link.
						</p>
					</div>
				</div>
				<div
					class="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"
				>
					<button
						type="button"
						onclick={() => (showInviteModal = false)}
						class="px-4 py-2 text-xs font-bold tracking-wider text-slate-600 uppercase transition-colors hover:text-slate-900"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="bg-blue-600 px-6 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700"
					>
						Generate Link
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
