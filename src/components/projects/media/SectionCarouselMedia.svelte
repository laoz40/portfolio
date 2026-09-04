<script lang="ts">
	import type { ImageMetadata } from "astro";

	type CarouselItem = {
		image: ImageMetadata;
		alt: string;
		title?: string;
		description?: string;
	};

	export let items: CarouselItem[] = [];
	export let imageFit: "cover" | "contain" = "cover";
	export let aspectRatio: "4:3" | "16:9" = "4:3";
	export let background: "default" | "black" = "default";

	const swipeThreshold = 48;
	const pointerActivationThreshold = 12;
	const defaultCarouselMaxWidth = 704;

	let currentIndex = 0;
	let activePointerId: number | null = null;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let pointerDeltaX = 0;
	let pointerDeltaY = 0;
	let isSwiping = false;

	$: slideCount = items.length;
	$: maxIndex = Math.max(slideCount - 1, 0);
	$: currentIndex = Math.min(currentIndex, maxIndex);
	$: carouselMaxWidth =
		slideCount > 0 ? Math.max(...items.map((item) => item.image.width)) : defaultCarouselMaxWidth;
	$: hasMultipleSlides = slideCount > 1;

	function clampIndex(index: number): number {
		return Math.min(Math.max(index, 0), maxIndex);
	}

	function goTo(index: number): void {
		currentIndex = clampIndex(index);
	}

	function goPrev(): void {
		if (currentIndex === 0) {
			return;
		}

		goTo(currentIndex - 1);
	}

	function goNext(): void {
		if (currentIndex >= maxIndex) {
			return;
		}

		goTo(currentIndex + 1);
	}

	function resetSwipeState(): void {
		activePointerId = null;
		pointerStartX = 0;
		pointerStartY = 0;
		pointerDeltaX = 0;
		pointerDeltaY = 0;
		isSwiping = false;
	}

	function releasePointerCapture(event: PointerEvent): void {
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	function shouldStartSwipe(): boolean {
		return (
			Math.abs(pointerDeltaX) >= pointerActivationThreshold &&
			Math.abs(pointerDeltaX) > Math.abs(pointerDeltaY)
		);
	}

	function shouldChangeSlides(): boolean {
		return (
			Math.abs(pointerDeltaX) >= swipeThreshold && Math.abs(pointerDeltaX) > Math.abs(pointerDeltaY)
		);
	}

	function updatePointerDelta(event: PointerEvent): void {
		pointerDeltaX = event.clientX - pointerStartX;
		pointerDeltaY = event.clientY - pointerStartY;
	}

	function finishPointerInteraction(event: PointerEvent): void {
		releasePointerCapture(event);
		resetSwipeState();
	}

	function handlePointerDown(event: PointerEvent): void {
		if (!hasMultipleSlides) {
			return;
		}

		if (event.pointerType === "mouse" && event.button !== 0) {
			return;
		}

		activePointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		pointerDeltaX = 0;
		pointerDeltaY = 0;
		isSwiping = false;

		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.setPointerCapture(event.pointerId);
		}
	}

	function handlePointerMove(event: PointerEvent): void {
		if (activePointerId !== event.pointerId) {
			return;
		}

		updatePointerDelta(event);

		if (!isSwiping && shouldStartSwipe()) {
			isSwiping = true;
		}

		if (isSwiping) {
			event.preventDefault();
		}
	}

	function handlePointerUp(event: PointerEvent): void {
		if (activePointerId !== event.pointerId) {
			return;
		}

		if (shouldChangeSlides()) {
			if (pointerDeltaX < 0) {
				goNext();
			} else {
				goPrev();
			}
		}

		finishPointerInteraction(event);
	}

	function handlePointerCancel(event: PointerEvent): void {
		if (activePointerId !== event.pointerId) {
			return;
		}

		finishPointerInteraction(event);
	}
</script>

<div
	class="section-carousel max-case-study:w-full grid w-[min(100%,57.4vw,var(--section-carousel-max-width))] min-w-0 gap-3 self-center max-sm:w-full"
	style={`--section-carousel-max-width: ${carouselMaxWidth}px; --carousel-index: ${currentIndex}; --section-carousel-image-fit: ${imageFit}; --section-carousel-aspect-ratio: ${aspectRatio.replace(":", " / ")}; --section-carousel-background: ${background === "black" ? "#000" : "var(--color-media-fallback)"};`}>
	<div
		class="section-carousel-frame taped-frame relative min-w-0 pt-[calc(var(--size-project-tape-height)*0.5)]"
		style="--tape-angle: calc(var(--section-media-tilt, 0deg) + 1.2deg);">
		<div
			class="section-carousel-viewport paper-frame max-sm:bg-paper relative max-w-full min-w-0 rotate-[var(--section-media-tilt,0deg)] [touch-action:pan-y] max-sm:rotate-0"
			role="group"
			aria-label="Project media carousel"
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
			on:pointerup={handlePointerUp}
			on:pointercancel={handlePointerCancel}>
			<div class="section-carousel-track flex w-full min-w-0">
				{#each items as item, index (item.image.src)}
					<div
						class="section-carousel-slide"
						role="group"
						aria-label={`Slide ${index + 1} of ${slideCount}`}>
						<div class="section-carousel-media">
							<img
								class="section-carousel-image"
								src={item.image.src}
								alt={item.alt}
								width={item.image.width}
								height={item.image.height}
								loading="lazy"
								decoding="async" />
						</div>
						<div class="section-carousel-content">
							<h4 class="section-carousel-title">
								{item.title ?? `Slide ${index + 1}`}
							</h4>
							{#if item.description}
								<p class="section-carousel-description">{item.description}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<div
				class="section-carousel-indicators absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 items-center justify-center gap-[0.55rem] max-sm:static max-sm:bottom-auto max-sm:left-auto max-sm:m-[0.35rem_0.85rem_0.5rem] max-sm:translate-x-0 max-sm:justify-start max-sm:gap-2"
				aria-label="Carousel slide indicators">
				{#each items as carouselItem, dotIndex (carouselItem.image.src)}
					<button
						type="button"
						class="section-carousel-indicator"
						on:click={() => goTo(dotIndex)}
						aria-label={`Go to slide ${dotIndex + 1}: ${carouselItem.title ?? carouselItem.alt}`}
						aria-current={dotIndex === currentIndex ? "true" : "false"}
						disabled={!hasMultipleSlides}></button>
				{/each}
			</div>
		</div>
		<div
			class="section-carousel-controls pointer-events-none absolute inset-x-0 top-[calc(var(--size-project-tape-height)*0.5)] bottom-0 z-[3] max-sm:pointer-events-auto max-sm:static max-sm:mt-[0.4rem] max-sm:flex max-sm:justify-between max-sm:gap-3">
			<button
				type="button"
				class="section-carousel-button section-carousel-button--prev"
				on:click={goPrev}
				aria-label="Previous slide"
				disabled={!hasMultipleSlides || currentIndex === 0}>
				&lt; Prev
			</button>
			<button
				type="button"
				class="section-carousel-button section-carousel-button--next"
				on:click={goNext}
				aria-label="Next slide"
				disabled={!hasMultipleSlides || currentIndex === maxIndex}>
				Next &gt;
			</button>
		</div>
	</div>
</div>

<style>
	.section-carousel-track {
		transform: translateX(calc(var(--carousel-index, 0) * -100%));
		transition: transform 260ms ease;
	}

	.section-carousel-viewport {
		transform: rotate(var(--section-media-tilt, 0deg));
	}

	.section-carousel-slide {
		position: relative;
		display: flex;
		min-width: 100%;
		align-items: flex-end;
		overflow: hidden;
		aspect-ratio: var(--section-carousel-aspect-ratio, 4 / 3);
		background: var(--section-carousel-background, var(--color-media-fallback)) !important;
	}

	.section-carousel-media {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.section-carousel-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: var(--section-carousel-image-fit, cover);
	}

	.section-carousel-content {
		position: relative;
		z-index: 2;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 1rem 2rem 2.8rem;
	}

	.section-carousel-media::before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(
			to top,
			var(--color-overlay-carousel-start) 0%,
			var(--color-overlay-carousel-mid) 24%,
			var(--color-overlay-carousel-soft) 46%,
			var(--color-overlay-carousel-clear) 68%
		);
		pointer-events: none;
	}

	.section-carousel-title {
		font-family: var(--font-sans);
		font-size: var(--type-sans-size-title);
		font-weight: var(--type-sans-weight-emphasis);
		line-height: var(--type-sans-leading-tight);
		margin: 0;
		color: var(--color-text-on-dark) !important;
		text-wrap: balance;
	}

	.section-carousel-description {
		font-family: var(--font-sans);
		font-size: var(--type-sans-size-body);
		font-weight: var(--type-sans-weight-regular);
		line-height: var(--type-sans-leading-reading);
		margin: 0;
		color: var(--color-text-on-dark) !important;
		text-wrap: pretty;
	}

	.section-carousel-indicator {
		width: 0.8rem;
		height: 0.8rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--color-indicator-light);
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			opacity 180ms ease;
	}

	.section-carousel-indicator:hover,
	.section-carousel-indicator:focus-visible {
		transform: scale(1.12);
		background: var(--color-indicator-light-hover);
	}

	.section-carousel-indicator[aria-current="true"] {
		background: var(--color-indicator-light-active);
		transform: scale(1.18);
	}

	.section-carousel-indicator:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	@media (max-width: 640px) {
		.section-carousel-viewport {
			transform: none;
		}

		.section-carousel-slide {
			display: grid;
			aspect-ratio: auto;
			align-items: stretch;
			background: var(--color-surface-paper) !important;
		}

		.section-carousel-media {
			position: relative;
			inset: auto;
			aspect-ratio: var(--section-carousel-aspect-ratio, 4 / 3);
		}

		.section-carousel-media::before {
			display: none;
		}

		.section-carousel-content {
			background: var(--color-surface-paper);
			gap: 0.2rem;
			padding: 0 0.5rem;
		}

		.section-carousel-title,
		.section-carousel-description {
			color: var(--color-text-body) !important;
			margin: 0.5rem 0;
		}

		.section-carousel-indicator {
			background: var(--color-indicator-dark);
		}

		.section-carousel-indicator:hover,
		.section-carousel-indicator:focus-visible {
			background: var(--color-indicator-dark-hover);
		}

		.section-carousel-indicator[aria-current="true"] {
			background: var(--color-indicator-dark-active);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.section-carousel-track {
			transition: none;
		}
	}

	.section-carousel-button {
		font-family: var(--font-handwriting);
		font-size: var(--type-hand-size-title-md);
		background-color: var(--color-paper);
		pointer-events: auto;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		border: 1px solid var(--color-border-soft);
		padding: 0.3rem 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		box-shadow: 3px 4px 3px var(--color-shadow-paper-button);
		transition:
			box-shadow 200ms ease,
			transform 200ms ease,
			opacity 200ms ease;
	}

	.section-carousel-button--prev {
		left: 0.75rem;
		transform: translateY(-50%) rotate(-1.5deg);
	}

	.section-carousel-button--next {
		right: 0.75rem;
		transform: translateY(-50%) rotate(1.5deg);
	}

	.section-carousel-button--prev:hover,
	.section-carousel-button--prev:focus-visible {
		transform: translateY(calc(-50% - 4px)) rotate(-1.5deg);
		box-shadow: 4px 5px 4px var(--color-shadow-paper-button-hover);
	}

	.section-carousel-button--next:hover,
	.section-carousel-button--next:focus-visible {
		transform: translateY(calc(-50% - 4px)) rotate(1.5deg);
		box-shadow: 4px 5px 4px var(--color-shadow-paper-button-hover);
	}

	.section-carousel-button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	@media (max-width: 640px) {
		.section-carousel-button {
			position: static;
			transform: none;
			padding: 0.2rem 0.45rem;
			font-size: var(--type-hand-size-title-md);
		}

		.section-carousel-button--prev:hover,
		.section-carousel-button--prev:focus-visible,
		.section-carousel-button--next:hover,
		.section-carousel-button--next:focus-visible {
			transform: translateY(-0.125rem);
		}
	}
</style>
