<script>
	import { enhance } from '$app/forms';
	import {
		Save,
		CheckCircle,
		AlertCircle,
		Globe,
		Share2,
		Mail,
		Phone,
		MapPin
	} from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);

	const settings = $derived(data.settings || {});
</script>

<svelte:head>
	<title>Settings - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8">
	<!-- Header -->
	<div class="border-l-4 border-slate-900 bg-white px-6 py-4 shadow-sm">
		<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">Global Settings</h1>
		<p class="mt-1 text-xs font-medium text-slate-500">
			Manage site information, social links, and contact details
		</p>
	</div>

	{#if form?.success}
		<div
			class="flex items-center gap-2 border-l-4 border-green-500 bg-green-50 p-4 text-xs font-bold text-green-700"
		>
			<CheckCircle class="h-4 w-4" />
			Settings updated successfully!
		</div>
	{/if}

	{#if form?.error}
		<div
			class="flex items-center gap-2 border-l-4 border-red-500 bg-red-50 p-4 text-xs font-bold text-red-700"
		>
			<AlertCircle class="h-4 w-4" />
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateSettings"
		class="space-y-8"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update({ reset: false });
				loading = false;
			};
		}}
	>
		<!-- General Settings -->
		<div class="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
			<div class="absolute top-0 right-0 p-4 opacity-5">
				<Globe class="h-24 w-24 text-blue-900" />
			</div>

			<h2
				class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-900 uppercase"
			>
				<Globe class="h-4 w-4 text-blue-600" />
				General Information
			</h2>

			<div class="grid gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<label
						for="blog_name"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase">Site Name</label
					>
					<input
						type="text"
						name="blog_name"
						id="blog_name"
						value={settings.blog_name || 'ExtraMele'}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						placeholder="e.g. ExtraMele"
					/>
				</div>
				<div class="space-y-2 md:col-span-2">
					<label
						for="blog_description"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Site Description</label
					>
					<textarea
						name="blog_description"
						id="blog_description"
						rows="3"
						class="w-full resize-none border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						placeholder="Brief description of your blog for SEO..."
						>{settings.blog_description || ''}</textarea
					>
				</div>
			</div>
		</div>

		<!-- Social Media -->
		<div class="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
			<div class="absolute top-0 right-0 p-4 opacity-5">
				<Share2 class="h-24 w-24 text-purple-900" />
			</div>

			<h2
				class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-900 uppercase"
			>
				<Share2 class="h-4 w-4 text-purple-600" />
				Social Media
			</h2>

			<div class="grid gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<label
						for="social_facebook"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Facebook URL</label
					>
					<input
						type="url"
						name="social_facebook"
						id="social_facebook"
						value={settings.social_facebook || ''}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
						placeholder="https://facebook.com/..."
					/>
				</div>
				<div class="space-y-2">
					<label
						for="social_twitter"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>X (Twitter) URL</label
					>
					<input
						type="url"
						name="social_twitter"
						id="social_twitter"
						value={settings.social_twitter || ''}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
						placeholder="https://twitter.com/..."
					/>
				</div>
				<div class="space-y-2">
					<label
						for="social_youtube"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>YouTube URL</label
					>
					<input
						type="url"
						name="social_youtube"
						id="social_youtube"
						value={settings.social_youtube || ''}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
						placeholder="https://youtube.com/..."
					/>
				</div>
				<div class="space-y-2">
					<label
						for="social_instagram"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Instagram URL</label
					>
					<input
						type="url"
						name="social_instagram"
						id="social_instagram"
						value={settings.social_instagram || ''}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
						placeholder="https://instagram.com/..."
					/>
				</div>
				<div class="space-y-2">
					<label
						for="social_tiktok"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>TikTok URL</label
					>
					<input
						type="url"
						name="social_tiktok"
						id="social_tiktok"
						value={settings.social_tiktok || ''}
						class="w-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
						placeholder="https://tiktok.com/..."
					/>
				</div>
			</div>
		</div>

		<!-- Contact Info -->
		<div class="relative overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
			<div class="absolute top-0 right-0 p-4 opacity-5">
				<Mail class="h-24 w-24 text-green-900" />
			</div>

			<h2
				class="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-900 uppercase"
			>
				<Mail class="h-4 w-4 text-green-600" />
				Contact Details
			</h2>

			<div class="grid gap-6 md:grid-cols-2">
				<div class="space-y-2">
					<label
						for="contact_email"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Contact Email</label
					>
					<div class="relative">
						<Mail class="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
						<input
							type="email"
							name="contact_email"
							id="contact_email"
							value={settings.contact_email || ''}
							class="w-full border border-slate-300 py-2 pr-4 pl-10 text-sm font-bold text-slate-700 transition-all outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
							placeholder="contact@example.com"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<label
						for="contact_phone"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Phone Number</label
					>
					<div class="relative">
						<Phone class="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
						<input
							type="text"
							name="contact_phone"
							id="contact_phone"
							value={settings.contact_phone || ''}
							class="w-full border border-slate-300 py-2 pr-4 pl-10 text-sm font-bold text-slate-700 transition-all outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
							placeholder="+1 (555) 000-0000"
						/>
					</div>
				</div>
				<div class="space-y-2 md:col-span-2">
					<label
						for="contact_address"
						class="block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Office Address</label
					>
					<div class="relative">
						<MapPin class="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
						<textarea
							name="contact_address"
							id="contact_address"
							rows="2"
							class="w-full resize-none border border-slate-300 py-2 pr-4 pl-10 text-sm font-medium text-slate-700 transition-all outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
							placeholder="123 Street Name, City, Country"
							>{settings.contact_address || ''}</textarea
						>
					</div>
				</div>
			</div>
		</div>

		<div class="pt-2">
			<button
				type="submit"
				disabled={loading}
				class="flex items-center gap-2 bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700 disabled:opacity-50"
			>
				{#if loading}
					<span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
					></span>
				{:else}
					<Save class="h-4 w-4" />
				{/if}
				Save Settings
			</button>
		</div>
	</form>
</div>
