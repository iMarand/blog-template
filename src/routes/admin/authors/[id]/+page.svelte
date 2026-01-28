<script>
	import { enhance } from '$app/forms';
	import { User, ArrowLeft, Save, Shield } from 'lucide-svelte';
	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Edit Author: {data.author.displayName || data.author.username} - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="flex items-center justify-between border-b border-slate-200 pb-4">
		<div class="flex items-center gap-4">
			<a href="/admin/authors" class="rounded-sm p-2 transition-colors hover:bg-slate-100">
				<ArrowLeft class="h-5 w-5 text-slate-600" />
			</a>
			<div>
				<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">
					Edit Author Profile
				</h1>
				<p class="mt-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
					@{data.author.username} • Role: {data.author.role}
				</p>
			</div>
		</div>
	</div>

	<form
		method="POST"
		action="?/updateAuthor"
		enctype="multipart/form-data"
		class="space-y-6"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
	>
		{#if form?.success}
			<div class="border-l-4 border-green-500 bg-green-50 p-4 text-sm font-bold text-green-700">
				Author profile updated successfully!
			</div>
		{/if}

		{#if form?.error}
			<div class="border-l-4 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="space-y-6 md:col-span-2">
				<div class="border border-slate-200 bg-white p-6 shadow-sm">
					<div class="space-y-4">
						<div>
							<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Display Name</label
							>
							<input
								type="text"
								name="displayName"
								value={data.author.displayName || ''}
								required
								class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
							/>
						</div>

						<div>
							<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Email Address</label
							>
							<input
								type="email"
								name="email"
								value={data.author.email || ''}
								class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
							/>
						</div>

						<div>
							<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
								>Bio</label
							>
							<textarea
								name="bio"
								rows="5"
								class="w-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
								placeholder="Small biography for this author...">{data.author.bio || ''}</textarea
							>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				<div class="border border-slate-200 bg-white p-6 shadow-sm">
					<h3 class="mb-4 text-xs font-bold tracking-wider text-slate-900 uppercase">
						Profile Picture
					</h3>
					<div class="flex flex-col items-center gap-4">
						<div class="h-32 w-32 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-50">
							{#if data.author.avatarUrl}
								<img src={data.author.avatarUrl} alt="Avatar" class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-slate-300">
									<User class="h-16 w-16" />
								</div>
							{/if}
						</div>
						<div class="w-full">
							<input
								type="file"
								name="avatarFile"
								accept="image/*"
								class="w-full text-[10px] text-slate-500 file:mr-3 file:rounded-sm file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold file:text-white hover:file:bg-slate-800"
							/>
						</div>
					</div>
				</div>

				<div class="bg-blue-600 p-6 text-white shadow-lg">
					<div class="mb-4 flex items-center gap-2">
						<Shield class="h-5 w-5" />
						<span class="text-xs font-bold tracking-widest uppercase">Admin Control</span>
					</div>
					<p class="text-[10px] leading-relaxed font-medium opacity-90">
						As an administrator, you are updating this author's public profile. These details will
						be visible to all readers of their articles.
					</p>
					<button
						type="submit"
						disabled={loading}
						class="mt-6 flex w-full items-center justify-center gap-2 bg-white px-4 py-3 text-xs font-black tracking-widest text-blue-600 uppercase transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
					>
						{#if loading}
							<span
								class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
							></span>
						{:else}
							<Save class="h-4 w-4" />
						{/if}
						Update Profile
					</button>
				</div>
			</div>
		</div>
	</form>
</div>
