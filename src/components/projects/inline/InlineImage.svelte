<script lang="ts">
	import { onMount } from "svelte";

	export let imageId: string;

	let root: HTMLDivElement | null = null;

	function replacePlaceholder(): void {
		const placeholder = document.querySelector(
			`.inline-image[data-image="${imageId}"]`,
		);
		const template = root?.querySelector("template");

		if (!(placeholder instanceof HTMLElement)) {
			return;
		}

		if (!(template instanceof HTMLTemplateElement)) {
			return;
		}

		placeholder.replaceWith(template.content.cloneNode(true));
	}

	onMount(() => {
		replacePlaceholder();
		document.addEventListener("astro:page-load", replacePlaceholder);

		return () => {
			document.removeEventListener("astro:page-load", replacePlaceholder);
		};
	});
</script>

<div
	bind:this={root}
	hidden
	aria-hidden="true">
	<slot />
</div>
