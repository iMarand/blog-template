<script>
	import { enhance } from '$app/forms';
	import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In - Admin Panel</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[#f9f9f9] p-4 font-sans">
	<div class="w-full max-w-md">
		<!-- Brand Header -->
		<div class="mb-10 text-center">
			<a href="/" class="group inline-block">
				<h1
					class="text-5xl font-extrabold tracking-tighter text-slate-900 transition-transform group-hover:scale-105"
				>
					Admin Panel<span class="text-blue-600">.</span>
				</h1>
			</a>
			<p class="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
				Professional Magazine/Blog Admin
			</p>
		</div>

		<!-- Login Container -->
		<div class="border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
			<div class="mb-8 border-l-4 border-slate-900 pl-4">
				<h2 class="text-xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
				<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
					Authenticate to continue
				</p>
			</div>

			<form
				method="POST"
				class="space-y-6"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				{#if form?.error}
					<div class="border-l-4 border-red-500 bg-red-50 p-4 text-xs font-bold text-red-700">
						<div class="flex items-center gap-2">
							<AlertCircle class="h-4 w-4" />
							{form.error}
						</div>
					</div>
				{/if}

				<div class="space-y-4">
					<div>
						<label
							for="username"
							class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
						>
							Username
						</label>
						<div class="relative">
							<div
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"
							>
								<Mail class="h-4 w-4" />
							</div>
							<input
								type="text"
								id="username"
								name="username"
								required
								value={form?.username ?? ''}
								class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
								placeholder="admin"
							/>
						</div>
					</div>

					<div>
						<div class="mb-2 flex items-center justify-between">
							<label
								for="password"
								class="block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Password
							</label>
							<a
								href="/admin/forgot-password"
								class="text-[10px] font-bold tracking-wider text-blue-600 uppercase hover:text-blue-800"
							>
								Forgot?
							</a>
						</div>
						<div class="relative">
							<div
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"
							>
								<Lock class="h-4 w-4" />
							</div>
							<input
								type="password"
								id="password"
								name="password"
								required
								class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
								placeholder="••••••••"
							/>
						</div>
					</div>
				</div>

				<div class="flex items-center">
					<label class="group flex cursor-pointer items-center gap-2">
						<div
							class="relative flex h-4 w-4 items-center justify-center border-2 border-slate-300 bg-white group-hover:border-slate-900"
						>
							<input
								type="checkbox"
								name="remember"
								class="peer absolute h-full w-full cursor-pointer opacity-0"
							/>
							<div
								class="h-2 w-2 bg-slate-900 opacity-0 transition-opacity peer-checked:opacity-100"
							></div>
						</div>
						<span
							class="text-[10px] font-bold tracking-wider text-slate-500 uppercase group-hover:text-slate-900"
							>Remember me</span
						>
					</label>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-slate-800 disabled:bg-slate-400"
				>
					{#if loading}
						<span class="h-4 w-4 animate-spin border-2 border-white border-t-transparent"></span>
						Authenticating...
					{:else}
						Sign In To Dashboard
					{/if}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<div class="mt-10 text-center">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-900"
			>
				<ArrowLeft class="h-3 w-3" />
				Back To Main Site
			</a>
		</div>
	</div>
</div>
