<script lang="ts">
	import type { ImageMetadata } from "astro";

	type CarouselItem = {
		image: ImageMetadata;
		alt: string;
		title?: string;
		description?: string;
	};

	export let items: CarouselItem[] = [];

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
		slideCount > 0
			? Math.max(...items.map((item) => item.image.width))
			: defaultCarouselMaxWidth;
	$: hasMultipleSlides = slideCount > 1;

	const goTo = (index: number) => {
		currentIndex = Math.min(Math.max(index, 0), maxIndex);
	};

	const goPrev = () => {
		if (currentIndex === 0) return;
		goTo(currentIndex - 1);
	};

	const goNext = () => {
		if (currentIndex >= maxIndex) return;
		goTo(currentIndex + 1);
	};

	const resetSwipeState = () => {
		activePointerId = null;
		pointerStartX = 0;
		pointerStartY = 0;
		pointerDeltaX = 0;
		pointerDeltaY = 0;
		isSwiping = false;
	};

	const handlePointerDown = (event: PointerEvent) => {
		if (!hasMultipleSlides) return;
		if (event.pointerType === "mouse" && event.button !== 0) return;

		activePointerId = event.pointerId;
		pointerStartX = event.clientX;
		pointerStartY = event.clientY;
		pointerDeltaX = 0;
		pointerDeltaY = 0;
		isSwiping = false;

		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.setPointerCapture(event.pointerId);
		}
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (activePointerId !== event.pointerId) return;

		pointerDeltaX = event.clientX - pointerStartX;
		pointerDeltaY = event.clientY - pointerStartY;

		if (
			!isSwiping &&
			Math.abs(pointerDeltaX) >= pointerActivationThreshold &&
			Math.abs(pointerDeltaX) > Math.abs(pointerDeltaY)
		) {
			isSwiping = true;
		}

		if (isSwiping) {
			event.preventDefault();
		}
	};

	const handlePointerUp = (event: PointerEvent) => {
		if (activePointerId !== event.pointerId) return;

		if (
			Math.abs(pointerDeltaX) >= swipeThreshold &&
			Math.abs(pointerDeltaX) > Math.abs(pointerDeltaY)
		) {
			if (pointerDeltaX < 0) {
				goNext();
			} else {
				goPrev();
			}
		}

		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		resetSwipeState();
	};

	const handlePointerCancel = (event: PointerEvent) => {
		if (activePointerId !== event.pointerId) return;

		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		resetSwipeState();
	};
</script>

<div
	class="section-carousel"
	style={`--section-carousel-max-width: ${carouselMaxWidth}px; --carousel-index: ${currentIndex};`}>
	<div class="section-carousel-frame">
		<div
			class="section-carousel-viewport"
			role="group"
			aria-label="Project media carousel"
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
			on:pointerup={handlePointerUp}
			on:pointercancel={handlePointerCancel}>
			<div class="section-carousel-track">
				{#each items as item, index}
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
				class="section-carousel-indicators"
				aria-label="Carousel slide indicators">
				{#each items as carouselItem, dotIndex}
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
		<div class="section-carousel-controls">
			<button
				type="button"
				class="section-carousel-button"
				on:click={goPrev}
				aria-label="Previous slide"
				disabled={!hasMultipleSlides || currentIndex === 0}>
				&lt; Prev
			</button>
			<button
				type="button"
				class="section-carousel-button"
				on:click={goNext}
				aria-label="Next slide"
				disabled={!hasMultipleSlides || currentIndex === maxIndex}>
				Next &gt;
			</button>
		</div>
	</div>
</div>

<style>
	.section-carousel {
		width: min(100%, 57.4vw, var(--section-carousel-max-width));
		align-self: center;
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}

	.section-carousel-frame {
		position: relative;
		padding-top: calc(var(--size-project-tape-height) * 0.5);
		min-width: 0;
	}

	.section-carousel-frame::before {
		content: "";
		position: absolute;
		top: calc(var(--size-project-tape-height) * 0.5);
		left: 50%;
		width: var(--size-project-tape-width);
		height: var(--size-project-tape-height);
		transform: translate(-50%, -50%)
			rotate(calc(var(--section-media-tilt, 0deg) + 1.2deg));
		background: var(--color-tape);
		pointer-events: none;
		z-index: 2;
	}

	.section-carousel-track {
		display: flex;
		width: 100%;
		transform: translateX(calc(var(--carousel-index, 0) * -100%));
		transition: transform 260ms ease;
		min-width: 0;
	}

	.section-carousel-viewport {
		position: relative;
		overflow: hidden;
		border: 8px solid var(--color-surface-page);
		box-shadow: var(--shadow-paper-medium);
		transform: rotate(var(--section-media-tilt, 0deg));
		min-width: 0;
		max-width: 100%;
		touch-action: pan-y;
	}

	.section-carousel-slide {
		aspect-ratio: 4 / 3;
		min-width: 100%;
		display: flex;
		align-items: flex-end;
		position: relative;
		overflow: hidden;
		background: var(--color-media-fallback);
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
		object-fit: cover;
	}

	.section-carousel-media::before {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 1;
		background: linear-gradient(
			to top,
			rgba(15, 12, 5, 0.82) 0%,
			rgba(15, 12, 5, 0.56) 24%,
			rgba(15, 12, 5, 0.2) 46%,
			rgba(15, 12, 5, 0) 68%
		);
		pointer-events: none;
	}

	.section-carousel-content {
		position: relative;
		z-index: 2;
		width: 100%;
		padding: 1rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding-bottom: 2.8rem;
	}

	.section-carousel-title {
		font-family: var(--font-sans);
		font-size: clamp(1rem, 0.5vw + 0.9rem, 1.2rem);
		font-weight: var(--type-sans-weight-emphasis);
		line-height: var(--type-sans-leading-tight);
		margin: 0;
		color: #ffffff !important;
		text-wrap: balance;
	}

	.section-carousel-description {
		font-family: var(--font-sans);
		font-size: clamp(0.9rem, 0.35vw + 0.8rem, 1rem);
		font-weight: var(--type-sans-weight-regular);
		line-height: var(--type-sans-leading-reading);
		margin: 0;
		color: #ffffff !important;
		text-wrap: pretty;
	}

	.section-carousel-controls {
		position: absolute;
		inset: calc(var(--size-project-tape-height) * 0.5) 0 0;
		z-index: 3;
		pointer-events: none;
	}

	.section-carousel-indicators {
		position: absolute;
		left: 50%;
		bottom: 1rem;
		z-index: 2;
		transform: translateX(-50%);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.55rem;
	}

	.section-carousel-indicator {
		width: 0.8rem;
		height: 0.8rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.3);
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			opacity 180ms ease;
	}

	.section-carousel-indicator:hover,
	.section-carousel-indicator:focus-visible {
		transform: scale(1.12);
		background: rgb(255 255 255 / 0.72);
	}

	.section-carousel-indicator[aria-current="true"] {
		background: rgb(255 255 255 / 0.98);
		transform: scale(1.18);
	}

	.section-carousel-indicator:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	.section-carousel-button {
		--carousel-button-shadow-rest: 3px 4px 3px rgb(54 43 21 / 0.14);
		--carousel-button-shadow-hover: 4px 5px 4px rgb(54 43 21 / 0.24);
		position: absolute;
		top: 50%;
		font-family: var(--font-handwriting);
		font-size: 2rem;
		font-weight: 700;
		text-transform: uppercase;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--color-border-soft);
		background: var(--color-surface-paper);
		pointer-events: auto;
		cursor: pointer;
		box-shadow: var(--carousel-button-shadow-rest);
		transition:
			box-shadow 200ms ease,
			transform 200ms ease,
			opacity 200ms ease;
	}

	.section-carousel-button:first-child {
		left: clamp(0.5rem, 1vw, 0.9rem);
		transform: translateY(-50%) rotate(-1.5deg);
	}

	.section-carousel-button:last-child {
		right: clamp(0.5rem, 1vw, 0.9rem);
		transform: translateY(-50%) rotate(1.5deg);
	}

	.section-carousel-button:first-child:hover,
	.section-carousel-button:first-child:focus-visible {
		box-shadow: var(--carousel-button-shadow-hover);
		transform: translateY(calc(-50% - 4px)) rotate(-1.5deg);
	}

	.section-carousel-button:last-child:hover,
	.section-carousel-button:last-child:focus-visible {
		box-shadow: var(--carousel-button-shadow-hover);
		transform: translateY(calc(-50% - 4px)) rotate(1.5deg);
	}

	.section-carousel-button:disabled,
	.section-carousel-indicator:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 1700px) {
		.section-carousel {
			width: min(100%, 78vw, var(--section-carousel-max-width));
		}
	}

	@media (max-width: 640px) {
		.section-carousel {
			width: 100%;
		}

		.section-carousel-viewport {
			transform: none;
			background: var(--color-surface-paper);
		}

		.section-carousel-slide {
			aspect-ratio: auto;
			display: grid;
			align-items: stretch;
			background: var(--color-surface-paper);
		}

		.section-carousel-media {
			position: relative;
			inset: auto;
			aspect-ratio: 4 / 3;
		}

		.section-carousel-media::before {
			display: none;
		}

		.section-carousel-content {
			padding: 0 0.5rem;
			gap: 0.2rem;
			background: var(--color-surface-paper);
		}

		.section-carousel-title,
		.section-carousel-description {
			color: var(--color-text-body) !important;
			margin: 0.5rem 0 0.5rem 0 !important;
		}

		.section-carousel-controls {
			position: static;
			inset: auto;
			margin-top: 0.4rem;
			display: flex;
			justify-content: space-between;
			gap: 0.75rem;
			pointer-events: auto;
		}

		.section-carousel-indicators {
			position: static;
			left: auto;
			bottom: auto;
			transform: none;
			gap: 0.5rem;
			justify-content: flex-start;
			margin: 0.35rem 0.85rem 0.5rem;
		}

		.section-carousel-indicator {
			background: rgb(39 62 68 / 0.28);
		}

		.section-carousel-indicator:hover,
		.section-carousel-indicator:focus-visible {
			background: rgb(39 62 68 / 0.58);
		}

		.section-carousel-indicator[aria-current="true"] {
			background: rgb(39 62 68 / 0.88);
		}

		.section-carousel-button {
			position: static;
			font-size: 1.5rem;
			padding: 0.2rem 0.45rem;
			transform: none;
		}

		.section-carousel-button:first-child,
		.section-carousel-button:last-child {
			left: auto;
			right: auto;
			transform: none;
		}

		.section-carousel-button:first-child:hover,
		.section-carousel-button:first-child:focus-visible,
		.section-carousel-button:last-child:hover,
		.section-carousel-button:last-child:focus-visible {
			transform: translateY(-2px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.section-carousel-track {
			transition: none;
		}
	}
</style>
