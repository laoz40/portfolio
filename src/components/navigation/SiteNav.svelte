<script
	context="module"
	lang="ts">
	export interface Props {
		home?: boolean;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";

	type LinkVariant = "yellow" | "lime" | "sky";

	type SiteLink = {
		href: string;
		label: string;
		variant: LinkVariant;
	};

	const links: SiteLink[] = [
		{ href: "/projects", label: "Projects", variant: "yellow" },
		{ href: "/about", label: "About", variant: "sky" },
		{ href: "/contact", label: "Contact", variant: "lime" },
	];

	const highlightByVariant: Record<LinkVariant, string> = {
		yellow: "var(--color-highlight-yellow)",
		lime: "var(--color-highlight-lime)",
		sky: "var(--color-highlight-sky)",
	};

	export let home: Props["home"] = false;

	let isScrolled = false;
	let isMenuOpen = false;

	function syncSiteNavState(): void {
		isScrolled = window.scrollY > 16;

		if (window.innerWidth > 820) {
			isMenuOpen = false;
		}
	}

	function toggleMenu(): void {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu(): void {
		isMenuOpen = false;
	}

	onMount(() => {
		syncSiteNavState();
	});
</script>

<svelte:window
	on:scroll|passive={syncSiteNavState}
	on:resize|passive={syncSiteNavState} />

<nav
	class="max-nav:flex-wrap max-nav:items-center max-nav:py-1 fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between gap-4 px-(--page-gutter)"
	class:is-scrolled={isScrolled}
	class:nav-fade-in={home}>
	<div
		class="nav-grain pointer-events-none absolute inset-x-0 top-0 bottom-[0.55rem] z-0 mix-blend-multiply"
		aria-hidden="true">
		<svg class="nav-grain-svg">
			<filter id="nav-grain-filter">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.5"
					numOctaves="3"
					stitchTiles="stitch"></feTurbulence>
			</filter>
			<rect
				width="100%"
				height="100%"
				filter="url(#nav-grain-filter)"></rect>
		</svg>
	</div>

	<div class="nav-brand max-nav:flex-[1_1_auto] relative z-1 font-bold">
		<a
			class="nav-link inline-block no-underline"
			on:click={closeMenu}
			href="/">
			<span
				class="nav-link-text selectable"
				style={`--highlight-color: ${highlightByVariant.lime};`}>
				Leo Zhou
			</span>
		</a>
	</div>

	<button
		type="button"
		class="menu-toggle text-handwriting focus-visible:outline-accent max-nav:inline-flex max-nav:h-[3.05rem] max-nav:w-[3.05rem] min-nav:h-[2.8rem] min-nav:w-[2.8rem] hidden cursor-pointer items-center justify-center border-none bg-transparent p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
		class:is-open={isMenuOpen}
		on:click={toggleMenu}
		aria-expanded={isMenuOpen}
		aria-controls="site-nav-links"
		aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}>
		<span
			class="menu-toggle-icon max-nav:h-[1.28rem] max-nav:w-[1.65rem] relative block h-[1.1rem] w-[1.4rem]"
			aria-hidden="true">
			<span class="menu-toggle-bar bar-1"></span>
			<span class="menu-toggle-bar bar-2"></span>
			<span class="menu-toggle-bar bar-3"></span>
		</span>
	</button>

	<div
		id="site-nav-links"
		class="nav-links max-nav:bg-page max-nav:border-border-soft-token max-nav:order-3 max-nav:hidden max-nav:w-full max-nav:flex-col max-nav:items-start max-nav:justify-start max-nav:gap-px max-nav:border max-nav:border-solid max-nav:px-0 max-nav:pt-1.5 max-nav:pb-2 min-nav:flex relative z-1 min-w-0 flex-wrap items-center justify-end gap-4"
		class:is-open={isMenuOpen}>
		{#each links as link (link.href)}
			<a
				class="nav-link max-nav:w-full inline-block no-underline"
				on:click={closeMenu}
				href={link.href}>
				<span
					class="nav-link-text"
					style={`--highlight-color: ${highlightByVariant[link.variant]};`}>
					{link.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	nav::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0.55rem;
		background: var(--color-surface-page);
		border: 1px solid var(--color-border-soft);
		border-radius: 0;
		clip-path: polygon(
			0 0,
			100% 0,
			100% 94%,
			96% 98%,
			91% 95%,
			86% 99%,
			74% 98%,
			61% 99%,
			54% 95%,
			47% 98%,
			33% 98%,
			26% 95%,
			18% 99%,
			10% 95%,
			4% 98%,
			0 94%
		);
		box-shadow: inset 0 -3px 1px var(--color-border-soft);
		filter: drop-shadow(0 1px 2px var(--color-shadow-soft))
			drop-shadow(0 10px 16px var(--color-shadow-medium));
		opacity: 0;
		transform: translateY(-0.4rem);
		transition:
			opacity 220ms ease,
			transform 220ms ease,
			filter 220ms ease;
		pointer-events: none;
		z-index: 0;
	}

	nav.is-scrolled::before {
		opacity: 1;
		transform: translateY(0);
	}

	.nav-grain-svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.nav-grain {
		clip-path: polygon(
			0 0,
			100% 0,
			100% 94%,
			96% 98%,
			91% 95%,
			86% 99%,
			74% 98%,
			61% 99%,
			54% 95%,
			47% 98%,
			33% 98%,
			26% 95%,
			18% 99%,
			10% 95%,
			4% 98%,
			0 94%
		);
		opacity: 0;
		transform: translateY(-0.4rem);
		transition:
			opacity 220ms ease,
			transform 220ms ease;
	}

	nav.is-scrolled .nav-grain {
		opacity: 0.3;
		transform: translateY(0);
	}

	.nav-link-text {
		position: relative;
		display: inline-block;
		font-family: var(--font-handwriting);
		font-size: var(--type-hand-size-title-md);
		line-height: 1.1;
		--highlight-top: 0.4em;
		--highlight-bottom: 0.6em;
		--highlight-left: -0.04em;
		--highlight-right: -0.03em;
		padding: 0.85rem 0.7rem;
		transition: transform 120ms ease;
		z-index: 0;
		user-select: none;
	}

	.nav-link-text.selectable {
		user-select: text;
	}

	.nav-link-text::before {
		content: "";
		position: absolute;
		left: var(--highlight-left);
		right: var(--highlight-right);
		top: var(--highlight-top);
		bottom: var(--highlight-bottom);
		background: var(--highlight-color);
		clip-path: polygon(
			2% 22%,
			8% 8%,
			35% 5%,
			48% 14%,
			78% 18%,
			98% 24%,
			96% 82%,
			88% 95%,
			57% 94%,
			42% 86%,
			28% 93%,
			13% 85%,
			4% 91%
		);
		transform-origin: left;
		transform: var(--highlight-transform-base, scaleX(0.2) skewX(-4deg) rotate(-1.2deg));
		opacity: 0;
		transition:
			transform 220ms ease,
			opacity 100ms ease;
		z-index: -1;
		pointer-events: none;
	}

	.nav-link:hover .nav-link-text::before,
	.nav-link:focus-visible .nav-link-text::before {
		transform: var(--highlight-transform-active, scaleX(1) skewX(-4deg) rotate(-1.2deg));
		opacity: 1;
	}

	.nav-link:active .nav-link-text {
		transform: scale(0.95);
	}

	nav.nav-fade-in {
		opacity: 0;
		animation: navFadeIn 1000ms ease-out 1500ms forwards;
	}

	@keyframes navFadeIn {
		to {
			opacity: 1;
		}
	}

	.menu-toggle-bar {
		position: absolute;
		left: 0;
		display: block;
		width: 100%;
		height: 2px;
		background: currentColor;
		border-radius: 999px;
		transform-origin: center;
		transition:
			transform 220ms ease,
			opacity 140ms ease;
	}

	.bar-1 {
		top: 0;
		transform: rotate(-2.5deg);
	}

	.bar-2 {
		top: calc(50% - 1px);
		transform: rotate(1.8deg);
	}

	.bar-3 {
		bottom: 0;
		transform: rotate(-1.3deg);
	}

	.menu-toggle.is-open .bar-1 {
		transform: translateY(0.622rem) rotate(45deg);
	}

	.menu-toggle.is-open .bar-2 {
		opacity: 0;
		transform: scaleX(0.2);
	}

	.menu-toggle.is-open .bar-3 {
		transform: translateY(-0.622rem) rotate(-45deg);
	}

	@media (max-width: 820px) {
		.menu-toggle-bar {
			height: 2.5px;
		}

		.nav-links.is-open {
			display: flex;
		}

		.nav-links .nav-link-text {
			width: 100%;
			font-size: var(--type-hand-size-title-md);
			padding: 0.82rem 0.75rem;
		}

		.nav-brand .nav-link-text {
			font-size: var(--type-hand-size-title-sm);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		nav.nav-fade-in {
			animation: none;
			opacity: 1;
		}
	}
</style>
