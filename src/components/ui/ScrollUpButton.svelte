<script lang="ts">
	import { onMount } from "svelte";

	let isVisible = false;

	function syncScrollUpState(): void {
		isVisible = window.scrollY > window.innerHeight;
	}

	function prefersReducedMotion(): boolean {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	function scrollToTop(): void {
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion() ? "auto" : "smooth",
		});
	}

	onMount(() => {
		syncScrollUpState();
	});
</script>

<svelte:window
	on:scroll|passive={syncScrollUpState}
	on:resize|passive={syncScrollUpState} />

<button
	type="button"
	class="scroll-up"
	class:is-visible={isVisible}
	on:click={scrollToTop}
	aria-label="Scroll back to top">
	SCROLL UP
</button>

<style>
	.scroll-up {
		--scroll-up-shadow-rest: 3px 4px 3px var(--color-shadow-paper-button);
		--scroll-up-shadow-hover: 4px 5px 4px var(--color-shadow-paper-button-hover);
		position: fixed;
		right: 1rem;
		bottom: 3rem;
		z-index: 30;
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--color-border-medium);
		background: linear-gradient(
			162deg,
			var(--color-surface-paper) 0%,
			var(--color-surface-paper-tint) 52%,
			var(--color-surface-paper) 100%
		);
		color: var(--color-text-handwriting);
		font-family: var(--font-handwriting);
		font-size: var(--type-hand-size-body);
		letter-spacing: 0.02em;
		line-height: 1;
		overflow: hidden;
		box-shadow: var(--scroll-up-shadow-rest);
		cursor: pointer;
		opacity: 0;
		visibility: hidden;
		transform: translateY(0.75rem) rotate(-0.6deg);
		transition:
			opacity 180ms ease,
			transform 200ms ease,
			box-shadow 200ms ease,
			visibility 180ms ease;
	}

	.scroll-up::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			-12deg,
			transparent 0,
			transparent 6px,
			rgb(from var(--color-text-strong) r g b / 0.025) 6px,
			rgb(from var(--color-text-strong) r g b / 0.025) 7px
		);
	}

	.scroll-up.is-visible {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) rotate(-0.6deg);
	}

	.scroll-up:hover,
	.scroll-up:focus-visible {
		box-shadow: var(--scroll-up-shadow-hover);
		transform: translateY(-4px) rotate(-0.6deg);
	}

	.scroll-up:focus-visible {
		outline: 2px solid var(--color-text-handwriting);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-up {
			transition: opacity 0ms;
			transform: none;
		}

		.scroll-up.is-visible,
		.scroll-up:hover,
		.scroll-up:focus-visible {
			transform: none;
		}
	}
</style>
