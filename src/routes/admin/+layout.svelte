<script>
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		FileText,
		Users,
		Settings,
		LogOut,
		Menu,
		X,
		ChevronRight,
		Home,
		ExternalLink,
		PenTool
	} from 'lucide-svelte';

	let { data, children } = $props();
	let sidebarOpen = $state(false);

	const menuItems = [
		{ href: '/admin', icon: LayoutDashboard, label: 'DASHBOARD', exact: true },
		{ href: '/admin/posts', icon: FileText, label: 'ALL POSTS' },
		{ href: '/admin/posts/new', icon: PenTool, label: 'NEW POST' },
		{ href: '/admin/pages', icon: FileText, label: 'PAGES', adminOnly: true },
		{ href: '/admin/subscribers', icon: Users, label: 'SUBSCRIBERS', adminOnly: true },
		{ href: '/admin/comments', icon: PenTool, label: 'COMMENTS' },
		{ href: '/admin/authors', icon: Users, label: 'AUTHORS', adminOnly: true },
		{ href: '/admin/profile', icon: Users, label: 'MY PROFILE' }
	];

	function isActive(href, exact = false) {
		if (exact) return $page.url.pathname === href;
		return $page.url.pathname.startsWith(href);
	}

	const noLayoutPaths = [
		'/admin/login',
		'/admin/forgot-password',
		'/admin/reset-password',
		'/admin/authors/invite'
	];
	const isAuthPage = $derived(noLayoutPaths.some((path) => $page.url.pathname.startsWith(path)));
</script>

<div class="flex min-h-screen bg-[#f9f9f9] font-sans text-slate-900">
	<!-- Mobile sidebar backdrop -->
	{#if sidebarOpen && !isAuthPage}
		<div
			class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
			onclick={() => (sidebarOpen = false)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
		></div>
	{/if}

	<!-- Sidebar -->
	{#if !isAuthPage}
		<aside
			class="fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:transform-none {sidebarOpen
				? 'translate-x-0'
				: '-translate-x-full lg:translate-x-0'}"
		>
			<div class="flex h-full flex-col">
				<!-- Logo -->
				<div class="flex h-20 items-center justify-between border-b border-slate-100 px-6">
					<a href="/admin" class="text-3xl font-extrabold tracking-tighter text-slate-900"
						>Admin Panel<span class="text-blue-600">.</span></a
					>
					<button
						class="text-slate-400 hover:text-red-500 lg:hidden"
						onclick={() => (sidebarOpen = false)}
					>
						<X class="h-6 w-6" />
					</button>
				</div>

				<!-- User info -->
				<div class="px-6 py-6">
					<div class="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-900 font-bold text-white"
						>
							{data.user?.displayName?.charAt(0).toUpperCase() || 'A'}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-bold text-slate-900">
								{data.user?.displayName || 'Admin'}
							</p>
							<p class="text-xs font-bold tracking-wider text-slate-500 uppercase">
								{data.user?.role || 'admin'}
							</p>
						</div>
					</div>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 space-y-1 overflow-y-auto px-4 py-2">
					<div class="mb-2 px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
						Main Menu
					</div>
					{#each menuItems as item}
						{#if !item.adminOnly || data.user?.role === 'admin'}
							<a
								href={item.href}
								class="flex items-center gap-3 rounded-sm border-l-4 px-3 py-2.5 text-sm font-bold transition-all {isActive(
									item.href,
									item.exact
								)
									? 'border-blue-600 bg-blue-50 text-blue-700'
									: 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
								onclick={() => (sidebarOpen = false)}
							>
								<item.icon class="h-4 w-4" />
								{item.label}
							</a>
						{/if}
					{/each}
				</nav>

				<!-- Footer -->
				<div class="space-y-1 border-t border-slate-100 p-4">
					<a
						href="/"
						target="_blank"
						class="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
					>
						<ExternalLink class="h-4 w-4" />
						View Blog
					</a>
					<form action="/admin/logout" method="POST">
						<button
							type="submit"
							class="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
						>
							<LogOut class="h-4 w-4" />
							Logout
						</button>
					</form>
				</div>
			</div>
		</aside>
	{/if}

	<!-- Main content -->
	<div class="flex min-w-0 flex-1 flex-col">
		<!-- Top bar -->
		{#if !isAuthPage}
			<header
				class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm lg:px-8"
			>
				<div class="flex items-center gap-4">
					<button
						class="text-slate-600 hover:text-blue-600 lg:hidden"
						onclick={() => (sidebarOpen = true)}
					>
						<Menu class="h-6 w-6" />
					</button>

					<!-- Breadcrumb -->
					<nav class="hidden items-center gap-2 text-sm sm:flex">
						<a
							href="/admin"
							class="text-xs font-bold tracking-wider text-slate-400 uppercase hover:text-blue-600"
							>Admin</a
						>
						{#if $page.url.pathname !== '/admin'}
							<ChevronRight class="h-3 w-3 text-slate-300" />
							<span class="text-xs font-bold tracking-wider text-slate-900 uppercase">
								{$page.url.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
							</span>
						{/if}
					</nav>
				</div>

				<div class="flex items-center gap-3">
					<a
						href="/admin/posts/new"
						class="hidden items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-blue-700 sm:flex"
					>
						<PenTool class="h-3 w-3" /> Write Post
					</a>
				</div>
			</header>
		{/if}

		<!-- Page content -->
		<main class="flex-1 p-4 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
