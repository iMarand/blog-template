<script>
	import { enhance } from '$app/forms';
	import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Reset Password - Plexify Admin</title>
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
				Professional Magazine Admin
			</p>
		</div>

		<!-- Container -->
		<div class="border border-slate-200 bg-white p-8 shadow-2xl md:p-10">
			<div class="mb-8 border-l-4 border-slate-900 pl-4">
				<h2 class="text-xl font-bold tracking-tight text-slate-900">Reset Password</h2>
				<p class="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
					Request a security reset link
				</p>
			</div>

			{#if form?.success}
				<div class="space-y-6">
					<div class="border-l-4 border-green-500 bg-green-50 p-6">
						<div class="flex items-start gap-3 text-green-700">
							<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
							<div>
								<p class="text-sm font-bold tracking-tight">Email Sent!</p>
								<p class="mt-2 text-xs leading-relaxed opacity-80">
									Check the server console for the reset link. In a production environment, this
									would be sent to your registered email address.
								</p>
							</div>
						</div>
					</div>
					<a
						href="/admin/login"
						class="flex w-full items-center justify-center bg-slate-900 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-slate-800"
					>
						Return To Login
					</a>
				</div>
			{:else}
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
								value={form?.email ?? ''}
								class="block w-full border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-slate-900 focus:bg-white focus:ring-0"
								placeholder="your@email.com"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 bg-slate-900 px-4 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-slate-800 disabled:bg-slate-400"
					>
						{#if loading}
							<span class="h-4 w-4 animate-spin border-2 border-white border-t-transparent"></span>
							Processing...
						{:else}
							Send Reset Connection
						{/if}
					</button>
				</form>
			{/if}
		</div>

		<!-- Footer -->
		<div class="mt-10 text-center">
			<a
				href="/admin/login"
				class="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-colors hover:text-slate-900"
			>
				<ArrowLeft class="h-3 w-3" />
				Back To Login
			</a>
		</div>
	</div>
</div>
