<script>
	import {
		Facebook,
		Twitter,
		Youtube,
		Instagram,
		Mail,
		MapPin,
		Phone,
		Send,
		ChevronRight
	} from 'lucide-svelte';

	let { data, form } = $props();
	let isDarkMode = $state(false);
	let loading = $state(false);

	const SOCIAL_LINKS = [
		{ name: 'Facebook', icon: Facebook, color: 'bg-[#3b5999]', label: 'Facebook' },
		{ name: 'Twitter', icon: Twitter, color: 'bg-[#000000]', label: 'Twitter' },
		{ name: 'YouTube', icon: Youtube, color: 'bg-[#cd201f]', label: 'YouTube' },
		{ name: 'Instagram', icon: Instagram, color: 'bg-[#e4405f]', label: 'Instagram' }
	];
</script>

<svelte:head>
	<title>Contact Us - Plexify</title>
</svelte:head>

<div class="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">

	<main class="container mx-auto px-4 py-12 lg:px-6">
		<!-- Breadcrumbs -->
		<nav
			class="mb-8 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
		>
			<a href="/" class="transition-colors hover:text-blue-600">Home</a>
			<ChevronRight class="h-3 w-3" />
			<span class="text-slate-900 underline decoration-blue-600 decoration-2 underline-offset-4"
				>Contact Us</span
			>
		</nav>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Main Content -->
			<div class="lg:col-span-8">
				<h1 class="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
					Get in <span class="text-blue-600">Touch</span>
				</h1>
				<p class="mb-10 max-w-2xl text-lg text-slate-500">
					Have a question, feedback, or a story idea? We'd love to hear from you. Fill out the form
					below and our team will get back to you as soon as possible.
				</p>

				<div
					class="group relative overflow-hidden border border-slate-100 bg-slate-50 p-8 shadow-sm md:p-10"
				>
					<div
						class="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-blue-600/5 transition-transform duration-700 group-hover:scale-110"
					></div>

					{#if form?.success}
						<div
							class="animate-in fade-in slide-in-from-left-4 mb-8 border-l-4 border-green-500 bg-green-100 p-6 text-green-700"
						>
							<h3 class="mb-1 text-lg font-bold">Message Sent!</h3>
							<p class="text-sm">Thank you for reaching out. We'll be in touch shortly.</p>
						</div>
					{/if}

					<form method="POST" class="relative z-10 space-y-6">
						<div class="grid gap-6 md:grid-cols-2">
							<div class="space-y-2">
								<label class="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
									>Full Name</label
								>
								<input
									type="text"
									name="name"
									required
									placeholder="John Doe"
									class="w-full border border-slate-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
								/>
							</div>
							<div class="space-y-2">
								<label class="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
									>Email Address</label
								>
								<input
									type="email"
									name="email"
									required
									placeholder="john@example.com"
									class="w-full border border-slate-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label class="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
								>Subject</label
							>
							<input
								type="text"
								name="subject"
								required
								placeholder="How can we help?"
								class="w-full border border-slate-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
							/>
						</div>
						<div class="space-y-2">
							<label class="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
								>Message</label
							>
							<textarea
								name="message"
								rows="6"
								required
								placeholder="Your message here..."
								class="w-full resize-none border border-slate-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
							></textarea>
						</div>

						<button
							type="submit"
							disabled={loading}
							class="inline-flex items-center gap-3 bg-blue-600 px-8 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg transition-all hover:bg-slate-900 hover:shadow-xl active:scale-95 disabled:opacity-50"
						>
							{#if loading}
								<span
									class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
								></span>
							{:else}
								<Send class="h-4 w-4" />
							{/if}
							Send Message
						</button>
					</form>
				</div>

				<div class="mt-12 grid gap-6 md:grid-cols-3">
					<div
						class="flex items-start gap-4 border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-blue-50 text-blue-600"
						>
							<Mail class="h-5 w-5" />
						</div>
						<div>
							<h4 class="mb-1 text-xs font-bold tracking-widest uppercase">Email Us</h4>
							<p class="truncate text-sm text-slate-500">contact@plexify.com</p>
						</div>
					</div>
					<div
						class="flex items-start gap-4 border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-blue-50 text-blue-600"
						>
							<Phone class="h-5 w-5" />
						</div>
						<div>
							<h4 class="mb-1 text-xs font-bold tracking-widest uppercase">Call Us</h4>
							<p class="text-sm text-slate-500">+1 (555) 000-0000</p>
						</div>
					</div>
					<div
						class="flex items-start gap-4 border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-blue-50 text-blue-600"
						>
							<MapPin class="h-5 w-5" />
						</div>
						<div>
							<h4 class="mb-1 text-xs font-bold tracking-widest uppercase">Office</h4>
							<p class="text-sm text-slate-500">San Francisco, CA</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<aside class="space-y-12 lg:col-span-4 lg:pl-6">
				<!-- Follow Widget -->
				<div class="flex flex-col">
					<h2
						class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3 text-sm font-bold tracking-wider text-slate-900 uppercase"
					>
						Follow Us
					</h2>
					<div class="grid grid-cols-2 gap-1">
						{#each SOCIAL_LINKS as social}
							<a
								href="/"
								class="{social.color} flex items-center justify-between px-3 py-2 text-white transition-opacity hover:opacity-90"
							>
								<div class="flex items-center gap-2">
									<social.icon class="h-4 w-4 fill-current" /><span
										class="text-[10px] font-bold tracking-wider uppercase">{social.label}</span
									>
								</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Latest Posts Widget -->
				<div>
					<h2
						class="mb-6 flex items-center justify-between border-l-4 border-slate-900 bg-yellow-50 px-4 py-3 text-sm font-bold tracking-wider text-slate-900 uppercase"
					>
						Latest Posts
					</h2>
					<div class="flex flex-col gap-5">
						{#each data.latestPosts as post}
							<a href="/blog/{post.slug}" class="group flex cursor-pointer gap-3">
								<div
									class="h-16 w-20 flex-shrink-0 overflow-hidden border border-slate-100 bg-slate-100"
								>
									<img
										src={post.featuredImage || `https://picsum.photos/seed/${post.slug}/150/100`}
										alt={post.title}
										class="h-full w-full object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div>
									<h4
										class="line-clamp-2 text-xs leading-tight font-bold tracking-tight text-slate-900 uppercase transition-colors group-hover:text-blue-600"
									>
										{post.title}
									</h4>
									<span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase"
										>{new Date(post.publishedAt).toLocaleDateString()}</span
									>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</aside>
		</div>
	</main>
</div>
