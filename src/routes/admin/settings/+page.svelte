<script>
	import { enhance } from '$app/forms';
	import { Lock, AlertCircle, CheckCircle } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Settings - Admin Panel</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-slate-900">Settings</h1>
		<p class="mt-1 text-sm text-slate-500">Manage your account settings</p>
	</div>

	<!-- Profile Info -->
	<div class="rounded-xl border border-slate-200 bg-white p-6">
		<h2 class="mb-4 font-bold text-slate-900">Profile</h2>
		<div class="space-y-4">
			<div class="flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
				>
					{data.user?.displayName?.charAt(0).toUpperCase() || 'A'}
				</div>
				<div>
					<p class="font-medium text-slate-900">{data.user?.displayName || data.user?.username}</p>
					<p class="text-sm text-slate-500">@{data.user?.username}</p>
					<p class="mt-1 text-xs text-slate-400 capitalize">{data.user?.role}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Change Password -->
	<div class="rounded-xl border border-slate-200 bg-white p-6">
		<h2 class="mb-4 font-bold text-slate-900">Change Password</h2>

		{#if form?.passwordSuccess}
			<div
				class="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
			>
				<CheckCircle class="h-5 w-5 flex-shrink-0" />
				<p class="text-sm font-medium">Password changed successfully!</p>
			</div>
		{/if}

		{#if form?.passwordError}
			<div
				class="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
			>
				<AlertCircle class="h-5 w-5 flex-shrink-0" />
				<p class="text-sm font-medium">{form.passwordError}</p>
			</div>
		{/if}

		<form
			action="?/changePassword"
			method="POST"
			class="space-y-4"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<div>
				<label for="currentPassword" class="mb-2 block text-sm font-bold text-slate-700"
					>Current Password</label
				>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-slate-400" />
					</div>
					<input
						type="password"
						id="currentPassword"
						name="currentPassword"
						required
						class="block w-full rounded-lg border border-slate-300 py-2.5 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="Enter current password"
					/>
				</div>
			</div>

			<div>
				<label for="newPassword" class="mb-2 block text-sm font-bold text-slate-700"
					>New Password</label
				>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-slate-400" />
					</div>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						required
						minlength="6"
						class="block w-full rounded-lg border border-slate-300 py-2.5 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="Enter new password (min 6 characters)"
					/>
				</div>
			</div>

			<div>
				<label for="confirmPassword" class="mb-2 block text-sm font-bold text-slate-700"
					>Confirm New Password</label
				>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Lock class="h-5 w-5 text-slate-400" />
					</div>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						required
						minlength="6"
						class="block w-full rounded-lg border border-slate-300 py-2.5 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						placeholder="Confirm new password"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
			>
				{#if loading}
					<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
					></span>
				{/if}
				Change Password
			</button>
		</form>
	</div>
</div>
