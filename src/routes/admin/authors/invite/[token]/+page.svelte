<script>
	import { enhance } from '$app/forms';
	import { User, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Join Authors - Plexify</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[#f9f9f9] p-4 font-sans">
	<div class="w-full max-w-md">
		<!-- Brand Header -->
		<div class="mb-10 text-center">
			<a href="/" class="group inline-block">
				<h1
					class="text-5xl font-extrabold tracking-tighter text-slate-900 transition-transform group-hover:scale-105"
				>
					Plexify<span class="text-blue-600">.</span>
				</h1>
			</a>
			<p class="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
				Professional Magazine Co-operation
			</p>
		</div>

		<!-- Container -->
		<div class="border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
			{#if !data.valid}
				<div class="space-y-6">
					<div class="border-l-4 border-red-500 bg-red-50 p-6">
						<div class="flex items-start gap-3 text-red-700">
							<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="text-sm font-bold tracking-tight">Invalid Connection</p>
								<p class="mt-2 text-xs leading-relaxed opacity-80">
									This invitation is either expired, already used, or invalid. Please request a new
									invitation from the system administrator.
								</p>
							</div>
						</div>
					</div>
					<a
						href="/"
						class="flex w-full items-center justify-center bg-slate-900 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-slate-800"
					>
						Back To Homepage
					</a>
				</div>
			{:else if form?.success}
				<div class="space-y-6">
					<div class="border-l-4 border-green-500 bg-green-50 p-6">
						<div class="flex items-start gap-3 text-green-700">
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="text-sm font-bold tracking-tight">Onboarding Complete</p>
								<p class="mt-2 text-xs leading-relaxed opacity-80">
									Your author account has been successfully configured. You may now proceed to the
									dashboard to begin writing.
								</p>
							</div>
						</div>
					</div>
					<a
						href="/admin/login"
						class="flex w-full items-center justify-center bg-slate-900 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-slate-800"
					>
						Go To Dashboard
					</a>
				</div>
			{:else}
				<div class="mb-8 border-l-4 border-slate-900 pl-4">
					<h2 class="text-xl font-bold tracking-tight text-slate-900">Author Onboarding</h2>
					<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
						Create your contributor profile
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
								for="displayName"
								class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Display Name
							</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"
								>
									<User class="h-4 w-4" />
								</div>
								<input
									type="text"
									id="displayName"
									name="displayName"
									required
									value={form?.displayName ?? ''}
									class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
									placeholder="e.g. John Doe"
								/>
							</div>
						</div>

						<div>
							<label
								for="username"
								class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Username
							</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400"
								>
									@
								</div>
								<input
									type="text"
									id="username"
									name="username"
									required
									pattern="[a-z0-9_]+"
									value={form?.username ?? ''}
									class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
									placeholder="johndoe"
								/>
							</div>
						</div>

						<div>
							<label
								for="email"
								class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Email Address
							</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"
								>
									<Mail class="h-4 w-4" />
								</div>
								<input
									type="email"
									id="email"
									name="email"
									required
									value={form?.email ?? data.invite?.email ?? ''}
									readonly={!!data.invite?.email}
									class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0 {data
										.invite?.email
										? 'opacity-60 grayscale'
										: ''}"
									placeholder="your@email.com"
								/>
							</div>
						</div>

						<div>
							<label
								for="password"
								class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Choose Password
							</label>
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
									minlength="8"
									class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
									placeholder="••••••••"
								/>
							</div>
						</div>

						<div>
							<label
								for="confirmPassword"
								class="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase"
							>
								Confirm Password
							</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"
								>
									<Lock class="h-4 w-4" />
								</div>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									required
									minlength="8"
									class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
									placeholder="••••••••"
								/>
							</div>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-slate-800 disabled:bg-slate-400"
					>
						{#if loading}
							<span class="h-4 w-4 animate-spin border-2 border-white border-t-transparent"></span>
							Creating Account...
						{:else}
							Complete Registration
						{/if}
					</button>
				</form>
			{/if}
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
