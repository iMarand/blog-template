<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import {
		ArrowLeft,
		Save,
		Eye,
		Image,
		Bold,
		Italic,
		Link,
		List,
		ListOrdered,
		Code,
		Quote,
		Heading1,
		Trash2,
		Heading2
	} from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);

	let title = $state(form?.title ?? '');
	let content = $state(form?.content ?? '');
	let categoryLabel = $state(form?.categoryLabel ?? '');
	let excerpt = $state(form?.excerpt ?? '');
	let featuredImage = $state(form?.featuredImage ?? '');
	let showPreview = $state(false);

	// Markdown preview
	let preview = $derived(marked(content || ''));

	async function handleUpload(file) {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await fetch('/api/admin/upload', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.success) {
				return data.url;
			}
			throw new Error(data.error || 'Upload failed');
		} catch (e) {
			alert('Image upload failed: ' + e.message);
			return null;
		}
	}

	async function onDrop(e) {
		e.preventDefault();
		const files = Array.from(e.dataTransfer.files);
		const imageFiles = files.filter((f) => f.type.startsWith('image/'));

		if (imageFiles.length === 0) return;

		for (const file of imageFiles) {
			const url = await handleUpload(file);
			if (url) {
				insertMarkdown(`![${file.name}](${url})`);
			}
		}
	}

	// Insert markdown syntax at cursor
	function insertMarkdown(before, after = '') {
		const textarea = document.querySelector('textarea[name="content"]');
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = content.substring(start, end);

		content = content.substring(0, start) + before + selected + after + content.substring(end);

		// Set cursor position after insertion
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
	<title>New Post - Admin Panel</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-slate-200 pb-4">
		<div class="flex items-center gap-4">
			<a href="/admin/posts" class="rounded-sm p-2 transition-colors hover:bg-slate-100">
				<ArrowLeft class="h-5 w-5 text-slate-600" />
			</a>
			<h1 class="text-xl font-bold tracking-wider text-slate-900 uppercase">New Post</h1>
		</div>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-6"
		use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'redirect') {
					goto(result.location);
				} else {
					await update();
				}
			};
		}}
	>
		{#if form?.error}
			<div class="border-l-4 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Title -->
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
						placeholder="Enter post title here..."
					/>
				</div>

				<!-- Content Editor -->
				<div class="border border-slate-200 bg-white shadow-sm">
					<div
						class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2"
					>
						<div class="flex items-center gap-1">
							{#each markdownButtons as btn}
								<button
									type="button"
									onclick={btn.action}
									class="rounded-sm p-1.5 text-slate-600 transition-colors hover:bg-slate-200"
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

					{#if showPreview}
						<div class="prose min-h-[500px] max-w-none p-6 prose-slate">
							{#if preview}
								{@html preview}
							{:else}
								<p class="text-slate-400 italic">Nothing to preview yet...</p>
							{/if}
						</div>
					{:else}
						<textarea
							name="content"
							bind:value={content}
							onkeydown={(e) => {
								if (e.ctrlKey && e.key === 's') {
									e.preventDefault();
									const btn = document.querySelector('button[name="action"][value="save"]');
									if (btn) btn.click();
								}
							}}
							ondragover={(e) => e.preventDefault()}
							ondrop={onDrop}
							class="min-h-[500px] w-full resize-y border-0 px-6 py-4 font-mono text-sm leading-relaxed text-slate-800 focus:ring-0"
							placeholder="Write your post content in Markdown... (Drag and drop images here)"
						></textarea>
					{/if}
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Publish Options -->
				<div class="border border-slate-200 bg-white p-5 shadow-sm">
					<h3
						class="mb-4 border-b border-slate-100 pb-2 text-xs font-bold tracking-wider text-slate-900 uppercase"
					>
						Publish
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
							>
								Include in Sitemap
							</label>
						</div>
						<button
							type="submit"
							name="action"
							value="publish"
							disabled={loading}
							class="flex w-full items-center justify-center gap-2 bg-blue-600 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-700 disabled:bg-blue-400"
						>
							{#if loading}
								<span
									class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
								></span>
							{/if}
							Publish Post
						</button>
						<button
							type="submit"
							name="action"
							value="draft"
							disabled={loading}
							class="w-full bg-slate-100 px-4 py-3 text-xs font-bold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-200"
						>
							Save as Draft
						</button>
					</div>
				</div>

				<!-- Slug (Hidden, generated on server) -->
				<input type="hidden" name="slug" value="" />

				<!-- Label / Category -->
				<div class="border border-slate-200 bg-white p-5 shadow-sm">
					<label class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Label / Category</label
					>
					<input
						type="text"
						name="categoryLabel"
						bind:value={categoryLabel}
						class="w-full border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						placeholder="e.g. Technology, Travel..."
					/>
				</div>

				<!-- Excerpt -->
				<div class="border border-slate-200 bg-white p-5 shadow-sm">
					<label class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Excerpt</label
					>
					<textarea
						name="excerpt"
						bind:value={excerpt}
						rows="4"
						class="w-full resize-none border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
						placeholder="Brief summary..."
					></textarea>
				</div>

				<!-- Featured Image -->
				<div class="border border-slate-200 bg-white p-5 shadow-sm">
					<label class="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase"
						>Featured Image</label
					>
					<div class="space-y-4">
						<input type="hidden" name="featuredImage" value={featuredImage} />
						<input
							type="file"
							name="featuredImageFile"
							accept="image/*"
							class="w-full text-xs text-slate-500 file:mr-4 file:rounded-sm file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-bold file:tracking-wider file:text-white file:uppercase file:transition-colors file:hover:bg-slate-800"
							onchange={(e) => {
								const file = e.currentTarget.files?.[0];
								if (file) {
									const reader = new FileReader();
									reader.onload = (re) => {
										featuredImage = re.target.result;
									};
									reader.readAsDataURL(file);
								}
							}}
						/>

						<div class="relative">
							<p class="mb-1 text-[9px] font-bold text-slate-400 uppercase">
								Current or Preview URL
							</p>
							<input
								type="text"
								value={featuredImage}
								onchange={(e) => (featuredImage = e.currentTarget.value)}
								class="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500"
								placeholder="Image URL (auto-filled on upload)"
							/>
						</div>

						{#if featuredImage}
							<div
								class="relative aspect-video w-full overflow-hidden border border-slate-200 bg-slate-100"
							>
								<img src={featuredImage} alt="Preview" class="h-full w-full object-cover" />
								<button
									type="button"
									onclick={() => (featuredImage = '')}
									class="absolute top-2 right-2 rounded-sm bg-red-600 p-1 text-white shadow-lg transition-colors hover:bg-red-700"
								>
									<Trash2 class="h-3 w-3" />
								</button>
							</div>
						{:else}
							<div
								class="flex aspect-video w-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-slate-400"
							>
								<span class="text-xs font-bold uppercase">No Image</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</form>
</div>

<style>
	:global(.prose) {
		color: #334155;
	}
	:global(.prose h1),
	:global(.prose h2),
	:global(.prose h3) {
		color: #0f172a;
		font-weight: 800;
	}
	:global(.prose a) {
		color: #2563eb;
		text-decoration: none;
		font-weight: 600;
	}
	:global(.prose a:hover) {
		text-decoration: underline;
	}
	:global(.prose code) {
		background-color: #f1f5f9;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		color: #ef4444;
	}
	:global(.prose pre) {
		background-color: #1e293b;
		color: #f1f5f9;
		padding: 1rem;
		border-radius: 0.25rem;
		overflow-x: auto;
	}
	:global(.prose blockquote) {
		border-left: 4px solid #3b82f6;
		padding-left: 1rem;
		color: #475569;
		font-style: italic;
		background: #f8fafc;
		padding: 1rem;
	}
</style>
