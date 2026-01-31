<script>
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import TextAlign from '@tiptap/extension-text-align';
	import Underline from '@tiptap/extension-underline';
	import {
		Bold,
		Italic,
		Underline as UnderlineIcon,
		Strikethrough,
		Heading1,
		Heading2,
		Heading3,
		List,
		ListOrdered,
		Quote,
		Code,
		Link as LinkIcon,
		Image as ImageIcon,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Undo,
		Redo,
		Minus
	} from 'lucide-svelte';

	let {
		content = $bindable(''),
		onImageUpload = null,
		placeholder = 'Start writing...'
	} = $props();

	let element = $state(null);
	let editor = $state(null);
	let showLinkInput = $state(false);
	let linkUrl = $state('');
	let selectedImageNode = $state(null);
	let showImageResize = $state(false);
	let imageWidth = $state('');

	// Custom resizable image extension
	const ResizableImage = Image.extend({
		addAttributes() {
			return {
				...this.parent?.(),
				width: {
					default: null,
					renderHTML: (attributes) => {
						if (!attributes.width) return {};
						return { width: attributes.width };
					}
				},
				style: {
					default: null,
					renderHTML: (attributes) => {
						if (!attributes.style) return {};
						return { style: attributes.style };
					}
				}
			};
		}
	});

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4]
					}
				}),
				ResizableImage.configure({
					inline: false,
					allowBase64: true,
					HTMLAttributes: {
						class: 'editor-image'
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'editor-link'
					}
				}),
				Placeholder.configure({
					placeholder: placeholder
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph']
				}),
				Underline
			],
			content: content,
			onTransaction: () => {
				editor = editor;
			},
			onUpdate: ({ editor: e }) => {
				content = e.getHTML();
			},
			onSelectionUpdate: ({ editor: e }) => {
				// Check if an image is selected
				const { node } = e.state.selection;
				if (node && node.type.name === 'image') {
					selectedImageNode = node;
					showImageResize = true;
					imageWidth = node.attrs.width || '';
				} else {
					selectedImageNode = null;
					showImageResize = false;
				}
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Update editor content when prop changes externally
	$effect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content, false);
		}
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleUnderline() {
		editor?.chain().focus().toggleUnderline().run();
	}

	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}

	function toggleHeading(level) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}

	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function setTextAlign(align) {
		editor?.chain().focus().setTextAlign(align).run();
	}

	function addHorizontalRule() {
		editor?.chain().focus().setHorizontalRule().run();
	}

	function undo() {
		editor?.chain().focus().undo().run();
	}

	function redo() {
		editor?.chain().focus().redo().run();
	}

	function openLinkInput() {
		const previousUrl = editor?.getAttributes('link').href ?? '';
		linkUrl = previousUrl;
		showLinkInput = true;
	}

	function setLink() {
		if (linkUrl === '') {
			editor?.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
		}
		showLinkInput = false;
		linkUrl = '';
	}

	function removeLink() {
		editor?.chain().focus().unsetLink().run();
		showLinkInput = false;
		linkUrl = '';
	}

	async function insertImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async (e) => {
			const file = e.target.files?.[0];
			if (!file) return;

			if (onImageUpload) {
				const url = await onImageUpload(file);
				if (url) {
					editor?.chain().focus().setImage({ src: url }).run();
				}
			} else {
				// Fallback to base64 if no upload handler
				const reader = new FileReader();
				reader.onload = (re) => {
					const src = re.target?.result;
					if (src) {
						editor?.chain().focus().setImage({ src }).run();
					}
				};
				reader.readAsDataURL(file);
			}
		};
		input.click();
	}

	function handleDrop(e) {
		e.preventDefault();
		const files = Array.from(e.dataTransfer?.files ?? []);
		const imageFiles = files.filter((f) => f.type.startsWith('image/'));

		imageFiles.forEach(async (file) => {
			if (onImageUpload) {
				const url = await onImageUpload(file);
				if (url) {
					editor?.chain().focus().setImage({ src: url }).run();
				}
			} else {
				const reader = new FileReader();
				reader.onload = (re) => {
					const src = re.target?.result;
					if (src) {
						editor?.chain().focus().setImage({ src }).run();
					}
				};
				reader.readAsDataURL(file);
			}
		});
	}

	function handleDragOver(e) {
		e.preventDefault();
	}

	function isActive(name, attrs = {}) {
		return editor?.isActive(name, attrs) ?? false;
	}

	// Image resize functions
	function setImageWidth(width) {
		if (!editor) return;
		editor.chain().focus().updateAttributes('image', { width: width }).run();
		imageWidth = width;
	}

	function applyCustomWidth() {
		if (!editor || !imageWidth) return;
		const width =
			imageWidth.includes('%') || imageWidth.includes('px') ? imageWidth : `${imageWidth}px`;
		editor.chain().focus().updateAttributes('image', { width }).run();
	}
</script>

<div class="rich-text-editor">
	<!-- Toolbar -->
	<div class="editor-toolbar">
		<!-- Text Formatting -->
		<div class="toolbar-group">
			<button
				type="button"
				onclick={toggleBold}
				class="toolbar-btn"
				class:active={isActive('bold')}
				title="Bold (Ctrl+B)"
			>
				<Bold class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleItalic}
				class="toolbar-btn"
				class:active={isActive('italic')}
				title="Italic (Ctrl+I)"
			>
				<Italic class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleUnderline}
				class="toolbar-btn"
				class:active={isActive('underline')}
				title="Underline (Ctrl+U)"
			>
				<UnderlineIcon class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleStrike}
				class="toolbar-btn"
				class:active={isActive('strike')}
				title="Strikethrough"
			>
				<Strikethrough class="h-4 w-4" />
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Headings -->
		<div class="toolbar-group">
			<button
				type="button"
				onclick={() => toggleHeading(1)}
				class="toolbar-btn"
				class:active={isActive('heading', { level: 1 })}
				title="Heading 1"
			>
				<Heading1 class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => toggleHeading(2)}
				class="toolbar-btn"
				class:active={isActive('heading', { level: 2 })}
				title="Heading 2"
			>
				<Heading2 class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => toggleHeading(3)}
				class="toolbar-btn"
				class:active={isActive('heading', { level: 3 })}
				title="Heading 3"
			>
				<Heading3 class="h-4 w-4" />
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Lists -->
		<div class="toolbar-group">
			<button
				type="button"
				onclick={toggleBulletList}
				class="toolbar-btn"
				class:active={isActive('bulletList')}
				title="Bullet List"
			>
				<List class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleOrderedList}
				class="toolbar-btn"
				class:active={isActive('orderedList')}
				title="Numbered List"
			>
				<ListOrdered class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleBlockquote}
				class="toolbar-btn"
				class:active={isActive('blockquote')}
				title="Quote"
			>
				<Quote class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={toggleCodeBlock}
				class="toolbar-btn"
				class:active={isActive('codeBlock')}
				title="Code Block"
			>
				<Code class="h-4 w-4" />
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Alignment -->
		<div class="toolbar-group">
			<button
				type="button"
				onclick={() => setTextAlign('left')}
				class="toolbar-btn"
				class:active={isActive({ textAlign: 'left' })}
				title="Align Left"
			>
				<AlignLeft class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => setTextAlign('center')}
				class="toolbar-btn"
				class:active={isActive({ textAlign: 'center' })}
				title="Align Center"
			>
				<AlignCenter class="h-4 w-4" />
			</button>
			<button
				type="button"
				onclick={() => setTextAlign('right')}
				class="toolbar-btn"
				class:active={isActive({ textAlign: 'right' })}
				title="Align Right"
			>
				<AlignRight class="h-4 w-4" />
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Insert -->
		<div class="toolbar-group">
			<button type="button" onclick={openLinkInput} class="toolbar-btn" title="Insert Link">
				<LinkIcon class="h-4 w-4" />
			</button>
			<button type="button" onclick={insertImage} class="toolbar-btn" title="Insert Image">
				<ImageIcon class="h-4 w-4" />
			</button>
			<button type="button" onclick={addHorizontalRule} class="toolbar-btn" title="Horizontal Line">
				<Minus class="h-4 w-4" />
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Undo/Redo -->
		<div class="toolbar-group">
			<button type="button" onclick={undo} class="toolbar-btn" title="Undo (Ctrl+Z)">
				<Undo class="h-4 w-4" />
			</button>
			<button type="button" onclick={redo} class="toolbar-btn" title="Redo (Ctrl+Y)">
				<Redo class="h-4 w-4" />
			</button>
		</div>
	</div>

	<!-- Image Resize Toolbar (shows when image is selected) -->
	{#if showImageResize}
		<div class="image-resize-bar">
			<span class="resize-label">Image Size:</span>
			<button type="button" onclick={() => setImageWidth('25%')} class="resize-btn">25%</button>
			<button type="button" onclick={() => setImageWidth('50%')} class="resize-btn">50%</button>
			<button type="button" onclick={() => setImageWidth('75%')} class="resize-btn">75%</button>
			<button type="button" onclick={() => setImageWidth('100%')} class="resize-btn">100%</button>
			<div class="resize-divider"></div>
			<input
				type="text"
				bind:value={imageWidth}
				placeholder="e.g. 300px"
				class="resize-input"
				onkeydown={(e) => e.key === 'Enter' && applyCustomWidth()}
			/>
			<button type="button" onclick={applyCustomWidth} class="resize-apply">Apply</button>
		</div>
	{/if}

	<!-- Link Input Popup -->
	{#if showLinkInput}
		<div class="link-input-popup">
			<input
				type="url"
				bind:value={linkUrl}
				placeholder="Enter URL..."
				class="link-input"
				onkeydown={(e) => e.key === 'Enter' && setLink()}
			/>
			<button type="button" onclick={setLink} class="link-btn save">Save</button>
			<button type="button" onclick={removeLink} class="link-btn remove">Remove</button>
			<button type="button" onclick={() => (showLinkInput = false)} class="link-btn cancel"
				>Cancel</button
			>
		</div>
	{/if}

	<!-- Editor Content -->
	<div
		class="editor-content"
		bind:this={element}
		ondrop={handleDrop}
		ondragover={handleDragOver}
	></div>
</div>

<style>
	.rich-text-editor {
		border: 1px solid #e2e8f0;
		background: white;
		overflow: hidden;
	}

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.toolbar-divider {
		width: 1px;
		height: 1.25rem;
		background: #cbd5e1;
		margin: 0 0.25rem;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		color: #475569;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toolbar-btn:hover {
		background: #e2e8f0;
		color: #1e293b;
	}

	.toolbar-btn.active {
		background: #1e293b;
		color: white;
	}

	.link-input-popup {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #f1f5f9;
		border-bottom: 1px solid #e2e8f0;
	}

	.link-input {
		flex: 1;
		padding: 0.375rem 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	.link-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.link-btn {
		padding: 0.375rem 0.75rem;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.link-btn.save {
		background: #3b82f6;
		color: white;
	}

	.link-btn.save:hover {
		background: #2563eb;
	}

	.link-btn.remove {
		background: #ef4444;
		color: white;
	}

	.link-btn.remove:hover {
		background: #dc2626;
	}

	.link-btn.cancel {
		background: #e2e8f0;
		color: #475569;
	}

	.link-btn.cancel:hover {
		background: #cbd5e1;
	}

	.editor-content {
		height: 500px;
		max-height: 500px;
		overflow-y: auto;
		padding: 1.5rem;
	}

	/* Image resize bar */
	.image-resize-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #dbeafe;
		border-bottom: 1px solid #93c5fd;
	}

	.resize-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #1e40af;
		text-transform: uppercase;
	}

	.resize-btn {
		padding: 0.25rem 0.5rem;
		background: white;
		border: 1px solid #93c5fd;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #1e40af;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.resize-btn:hover {
		background: #1e40af;
		color: white;
	}

	.resize-divider {
		width: 1px;
		height: 1.25rem;
		background: #93c5fd;
	}

	.resize-input {
		width: 80px;
		padding: 0.25rem 0.5rem;
		border: 1px solid #93c5fd;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}

	.resize-input:focus {
		outline: none;
		border-color: #1e40af;
	}

	.resize-apply {
		padding: 0.25rem 0.5rem;
		background: #1e40af;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		cursor: pointer;
	}

	.resize-apply:hover {
		background: #1e3a8a;
	}

	:global(.rich-text-editor .ProseMirror) {
		min-height: 400px;
		outline: none;
		font-size: 1rem;
		line-height: 1.75;
		color: #334155;
	}

	:global(.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #94a3b8;
		pointer-events: none;
		height: 0;
	}

	:global(.rich-text-editor .ProseMirror h1) {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		margin: 1.5rem 0 1rem;
		line-height: 1.2;
	}

	:global(.rich-text-editor .ProseMirror h2) {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		margin: 1.25rem 0 0.75rem;
		line-height: 1.3;
	}

	:global(.rich-text-editor .ProseMirror h3) {
		font-size: 1.25rem;
		font-weight: 600;
		color: #0f172a;
		margin: 1rem 0 0.5rem;
		line-height: 1.4;
	}

	:global(.rich-text-editor .ProseMirror h4) {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 1rem 0 0.5rem;
	}

	:global(.rich-text-editor .ProseMirror p) {
		margin: 0.75rem 0;
	}

	:global(.rich-text-editor .ProseMirror ul),
	:global(.rich-text-editor .ProseMirror ol) {
		padding-left: 1.5rem;
		margin: 0.75rem 0;
	}

	:global(.rich-text-editor .ProseMirror li) {
		margin: 0.25rem 0;
	}

	:global(.rich-text-editor .ProseMirror blockquote) {
		border-left: 4px solid #3b82f6;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #475569;
		font-style: italic;
		background: #f8fafc;
		padding: 1rem;
	}

	:global(.rich-text-editor .ProseMirror code) {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'Fira Code', monospace;
		font-size: 0.875rem;
		color: #ef4444;
	}

	:global(.rich-text-editor .ProseMirror pre) {
		background: #1e293b;
		color: #f1f5f9;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.rich-text-editor .ProseMirror pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
	}

	:global(.rich-text-editor .ProseMirror a) {
		color: #2563eb;
		text-decoration: underline;
		cursor: pointer;
	}

	:global(.rich-text-editor .ProseMirror a:hover) {
		color: #1d4ed8;
	}

	:global(.rich-text-editor .ProseMirror hr) {
		border: none;
		border-top: 2px solid #e2e8f0;
		margin: 1.5rem 0;
	}

	:global(.rich-text-editor .ProseMirror img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
		cursor: pointer;
	}

	:global(.rich-text-editor .ProseMirror img.ProseMirror-selectednode) {
		outline: 3px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Text alignment */
	:global(.rich-text-editor .ProseMirror [style*='text-align: center']) {
		text-align: center;
	}

	:global(.rich-text-editor .ProseMirror [style*='text-align: right']) {
		text-align: right;
	}

	:global(.rich-text-editor .ProseMirror [style*='text-align: left']) {
		text-align: left;
	}
</style>
