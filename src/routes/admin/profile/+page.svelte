<script>
	import { enhance } from '$app/forms';
	import { User, Lock, Save, AlertCircle } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Profile - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<!-- Header -->
	<div class="border-l-4 border-slate-900 bg-white px-6 py-4 shadow-sm">
		<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">My Profile</h1>
		<p class="mt-1 text-xs font-medium text-slate-500">Manage your account settings and password</p>
	</div>

	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<!-- Profile Info -->
		<div class="space-y-6">
			<div class="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
				<div class="absolute top-0 right-0 p-4 opacity-5">
					<User class="h-24 w-24 text-blue-900" />
				</div>
				<h2
					class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-900 uppercase"
				>
					<User class="h-4 w-4 text-blue-600" />
					Account Details
				</h2>

				<form
					method="POST"
					action="?/updateProfile"
					class="space-y-4"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
				>
					{#if form?.profileSuccess}
						<div
							class="border-l-4 border-green-500 bg-green-50 p-3 text-xs font-bold text-green-700"
						>
							Profile updated successfully!
						</div>
					{/if}

					<div>
						<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
							>Display Name</label
						>
						<input
							type="text"
							name="displayName"
							value={data.user.displayName}
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
							value={data.user.email}
							required
							class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						/>
					</div>

					<div>
						<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
							>Username</label
						>
						<input
							type="text"
							value={data.user.username}
							disabled
							class="w-full cursor-not-allowed border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500"
						/>
						<p class="mt-1 text-[10px] text-slate-400">Username cannot be changed.</p>
					</div>

					<div class="pt-2">
						<button
							type="submit"
							disabled={loading}
							class="flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700 disabled:opacity-50"
						>
							{#if loading}
								<span
									class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
								></span>
							{/if}
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Change Password -->
		<div class="space-y-6">
			<div class="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
				<div class="absolute top-0 right-0 p-4 opacity-5">
					<Lock class="h-24 w-24 text-red-900" />
				</div>
				<h2
					class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-900 uppercase"
				>
					<Lock class="h-4 w-4 text-red-600" />
					Change Password
				</h2>

				<form
					method="POST"
					action="?/changePassword"
					class="space-y-4"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
				>
					{#if form?.passwordError}
						<div
							class="flex items-start gap-2 border-l-4 border-red-500 bg-red-50 p-3 text-xs font-bold text-red-700"
						>
							<AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
							{form.passwordError}
						</div>
					{/if}

					{#if form?.passwordSuccess}
						<div
							class="border-l-4 border-green-500 bg-green-50 p-3 text-xs font-bold text-green-700"
						>
							Password changed successfully!
						</div>
					{/if}

					<div>
						<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
							>Current Password</label
						>
						<input
							type="password"
							name="currentPassword"
							required
							class="w-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						/>
					</div>

					<div>
						<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
							>New Password</label
						>
						<input
							type="password"
							name="newPassword"
							required
							minlength="8"
							class="w-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						/>
					</div>

					<div>
						<label class="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase"
							>Confirm New Password</label
						>
						<input
							type="password"
							name="confirmPassword"
							required
							minlength="8"
							class="w-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						/>
					</div>

					<div class="pt-2">
						<button
							type="submit"
							disabled={loading}
							class="flex items-center gap-2 bg-slate-900 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-slate-800 disabled:opacity-50"
						>
							{#if loading}
								<span
									class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
								></span>
							{/if}
							Update Password
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
