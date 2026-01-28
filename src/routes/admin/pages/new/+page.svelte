<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import {
		ArrowLeft,
		Save,
		Eye,
		Bold,
		Italic,
		Link,
		List,
		ListOrdered,
		Code,
		Quote,
		Heading1,
		Heading2
	} from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
	let title = $state(form?.title ?? '');
	let content = $state(form?.content ?? '');
	let externalUrl = $state(form?.externalUrl ?? '');
	let showPreview = $state(false);

	let preview = $derived(marked(content || ''));

	function insertMarkdown(before, after = '') {
		const textarea = document.querySelector('textarea[name="content"]');
		if (!textarea) return;
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = content.substring(start, end);
		content = content.substring(0, start) + before + selected + after + content.substring(end);
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
		}, 0);
	}

	const markdownButtons = [
		{ icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Bold' },
		{ icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Italic' },
		{ icon: Heading1, action: () => insertMarkdown('# '), title: 'Heading 1' },
		{ icon: Heading2, action: () => insertMarkdown('## '), title: 'Heading 2' },
		{ icon: Link, action: () => insertMarkdown('[', '](url)'), title: 'Link' },
		{ icon: List, action: () => insertMarkdown('- '), title: 'Bullet List' },
		{ icon: ListOrdered, action: () => insertMarkdown('1. '), title: 'Numbered List' },
		{ icon: Code, action: () => insertMarkdown('`', '`'), title: 'Code' },
		{ icon: Quote, action: () => insertMarkdown('> '), title: 'Quote' }
	];
</script>

<svelte:head>
	<title>New Page - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-slate-200 pb-4">
		<div class="flex items-center gap-4">
			<a href="/admin/pages" class="rounded-sm p-2 transition-colors hover:bg-slate-100">
				<ArrowLeft class="h-5 w-5 text-slate-600" />
			</a>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">New Page</h1>
		</div>
	</div>

	<form
		method="POST"
		class="space-y-6"
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'redirect') goto(result.location);
				else await update();
			};
		}}
	>
		{#if form?.error}
			<div class="border-l-4 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<div class="border border-slate-200 bg-white p-6 shadow-sm">
					<label class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Title</label
					>
					<input
						type="text"
						name="title"
						bind:value={title}
						required
						class="w-full border-0 border-b-2 border-slate-200 px-0 py-2 text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-0"
						placeholder="Enter page title (e.g. About Us)..."
					/>
				</div>

				<div class="border border-slate-200 bg-white p-6 shadow-sm">
					<label class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>External Link URL (Optional)</label
					>
					<input
						type="text"
						name="externalUrl"
						bind:value={externalUrl}
						class="w-full border-0 border-b-2 border-slate-200 px-0 py-2 text-base font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-0"
						placeholder="https://example.com or /internal-path (leave empty for standard pages)"
					/>
					<p class="mt-2 text-[10px] text-slate-400">
						If provided, this page will act as a direct link and content below will be ignored.
					</p>
				</div>

				<div class="border border-slate-200 bg-white shadow-sm">
					<div
						class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2"
					>
						<div class="flex items-center gap-1">
							{#each markdownButtons as btn}
								<button
									type="button"
									onclick={btn.action}
									class="rounded-sm p-1.5 text-slate-600 hover:bg-slate-200"
									title={btn.title}
								>
									<btn.icon class="h-4 w-4" />
								</button>
							{/each}
						</div>
						<button
							type="button"
							onclick={() => (showPreview = !showPreview)}
							class="flex items-center gap-2 rounded-sm px-3 py-1 text-xs font-bold tracking-wider uppercase transition-colors {showPreview
								? 'bg-blue-600 text-white'
								: 'bg-slate-200 text-slate-700 hover:bg-slate-300'}"
						>
							<Eye class="h-3 w-3" />
							{showPreview ? 'Edit' : 'Preview'}
						</button>
					</div>
					{#if externalUrl}
						<div class="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
							<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
								<Link class="h-6 w-6 text-blue-600" />
							</div>
							<h3 class="text-sm font-bold tracking-wider text-slate-900 uppercase">Link Active</h3>
							<p class="mt-2 text-xs text-slate-500">
								Content editing is disabled while an External Link is set.
							</p>
						</div>
					{:else if showPreview}
						<div class="prose min-h-[500px] max-w-none p-6 font-[Inter] prose-slate">
							{#if preview}
								{@html preview}
							{:else}
								<p class="text-slate-400 italic">Nothing to preview...</p>
							{/if}
						</div>
					{:else}
						<textarea
							name="content"
							bind:value={content}
							class="min-h-[500px] w-full resize-y border-0 px-6 py-4 font-mono text-sm leading-relaxed text-slate-800 focus:ring-0"
							placeholder="Write your page content in Markdown..."
						></textarea>
					{/if}
				</div>
			</div>

			<div class="space-y-6">
				<div class="border border-slate-200 bg-white p-5 shadow-sm">
					<h3
						class="mb-4 border-b border-slate-100 pb-2 text-xs font-bold tracking-wider text-slate-900 uppercase"
					>
						Publish Options
					</h3>
					<div class="space-y-3">
						<div class="flex items-center gap-2 px-1 py-1">
							<input
								type="checkbox"
								id="inSitemap"
								name="inSitemap"
								value="true"
								checked
								class="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-600"
							/>
							<label
								for="inSitemap"
								class="cursor-pointer text-xs font-bold text-slate-700 uppercase"
								>Include in Sitemap</label
							>
						</div>
						<button
							type="submit"
							name="action"
							value="publish"
							disabled={loading}
							class="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase hover:bg-blue-700"
						>
							Publish Page
						</button>
						<button
							type="submit"
							name="action"
							value="draft"
							disabled={loading}
							class="w-full bg-slate-100 px-4 py-3 text-xs font-bold tracking-wider text-slate-700 uppercase hover:bg-slate-200"
						>
							Save as Draft
						</button>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
