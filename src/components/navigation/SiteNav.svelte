<script>
	import { onMount } from "svelte";

	const links = [
		{ href: "/projects", label: "Projects", variant: "yellow" },
		{ href: "/about", label: "About", variant: "sky" },
		{ href: "/contact", label: "Contact", variant: "lime" },
	];

	const highlightByVariant = {
		yellow: "var(--color-highlight-yellow)",
		lime: "var(--color-highlight-lime)",
		sky: "var(--color-highlight-sky)",
	};

	let isScrolled = false;
	let isMenuOpen = false;

	onMount(() => {
		const syncSiteNavScrollState = () => {
			isScrolled = window.scrollY > 16;
		};

		const syncMenuStateForViewport = () => {
			if (window.innerWidth > 820) {
				isMenuOpen = false;
			}
		};

		window.addEventListener("scroll", syncSiteNavScrollState, {
			passive: true,
		});
		window.addEventListener("resize", syncMenuStateForViewport, {
			passive: true,
		});
		syncSiteNavScrollState();
		syncMenuStateForViewport();

		return () => {
			window.removeEventListener("scroll", syncSiteNavScrollState);
			window.removeEventListener("resize", syncMenuStateForViewport);
		};
	});

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};

	const closeMenu = () => {
		isMenuOpen = false;
	};
</script>

<nav class:is-scrolled={isScrolled}>
	<div
		class="nav-grain"
		aria-hidden="true"></div>

	<div class="nav-brand font-bold">
		<a
			class="nav-link"
			on:click={closeMenu}
			href="/">
			<span
				class="nav-link-text selectable"
				style={`--highlight-colour: ${highlightByVariant.lime};`}>
				Leo Zhou
			</span>
		</a>
	</div>

	<button
		type="button"
		class="menu-toggle"
		class:is-open={isMenuOpen}
		on:click={toggleMenu}
		aria-expanded={isMenuOpen}
		aria-controls="site-nav-links"
		aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}>
		<span class="menu-toggle-icon" aria-hidden="true">
			<span class="menu-toggle-bar bar-1" />
			<span class="menu-toggle-bar bar-2" />
			<span class="menu-toggle-bar bar-3" />
		</span>
	</button>

	<div
		id="site-nav-links"
		class="nav-links"
		class:is-open={isMenuOpen}>
		{#each links as link}
			<a
				class="nav-link"
				on:click={closeMenu}
				href={link.href}>
				<span
					class="nav-link-text"
					style={`--highlight-colour: ${highlightByVariant[link.variant]};`}>
					{link.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		box-sizing: border-box;
		z-index: 50;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-inline: var(--page-gutter);
		isolation: isolate;
	}

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

	.nav-grain {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0.55rem;
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
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23grain)'/%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 160px 160px;
		mix-blend-mode: multiply;
		opacity: 0;
		transform: translateY(-0.4rem);
		transition:
			opacity 220ms ease,
			transform 220ms ease;
		pointer-events: none;
		z-index: 0;
	}

	nav.is-scrolled .nav-grain {
		opacity: 0.3;
		transform: translateY(0);
	}

	nav > :not(.nav-grain) {
		position: relative;
		z-index: 1;
	}

	.nav-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: center;
		gap: clamp(0.25rem, 1.2vw, 2.5rem);
		min-width: 0;
	}

	.menu-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.8rem;
		height: 2.8rem;
		padding: 0.4rem;
		border: none;
		background: transparent;
		color: var(--color-text-handwriting);
		cursor: pointer;
	}

	.menu-toggle:focus-visible {
		outline: 2px solid var(--color-highlight-sky);
		outline-offset: 2px;
	}

	.menu-toggle-icon {
		position: relative;
		display: block;
		width: 1.4rem;
		height: 1.1rem;
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

	.nav-link {
		display: inline-block;
		text-decoration: none;
	}

	.nav-link-text {
		position: relative;
		display: inline-block;
		font-size: clamp(1rem, 1.8vw, 1.75rem);
		line-height: 1.1;
		padding: clamp(0.6rem, 1.4vw, 1.5rem) clamp(0.45rem, 1vw, 1rem);
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
		left: var(--highlight-left, -0.18em);
		right: var(--highlight-right, -0.16em);
		top: var(--highlight-top, 0.4em);
		bottom: var(--highlight-bottom, 0.5em);
		background: var(--highlight-colour);
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
		transform: var(
			--highlight-transform-base,
			scaleX(0.2) skewX(-4deg) rotate(-1.2deg)
		);
		opacity: 0;
		transition:
			transform 220ms ease,
			opacity 100ms ease;
		z-index: -1;
		pointer-events: none;
	}

	.nav-link:hover .nav-link-text::before,
	.nav-link:focus-visible .nav-link-text::before {
		transform: var(
			--highlight-transform-active,
			scaleX(1) skewX(-4deg) rotate(-1.2deg)
		);
		opacity: 1;
	}

	.nav-link:active .nav-link-text {
		transform: scale(0.95);
	}

	@media (max-width: 820px) {
		nav {
			padding-top: 0.25rem;
			padding-bottom: 0.25rem;
			flex-wrap: wrap;
			align-items: center;
		}

		.nav-brand {
			flex: 1 1 auto;
		}

		.menu-toggle {
			display: inline-flex;
			width: 3.05rem;
			height: 3.05rem;
		}

		.menu-toggle-icon {
			width: 1.65rem;
			height: 1.28rem;
		}

		.menu-toggle-bar {
			height: 2.5px;
		}

		.nav-links {
			display: none;
			width: 100%;
			order: 3;
			padding: 0.35rem 0 0.5rem;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-start;
			gap: 0.1rem;
			background: var(--color-surface-page);
			border: 1px solid var(--color-border-soft);
		}

		.nav-links.is-open {
			display: flex;
		}

		.nav-links .nav-link {
			width: 100%;
		}

		.nav-links .nav-link-text {
			width: 100%;
			font-size: clamp(1.56rem, 6.4vw, 2.25rem);
			padding: 0.82rem 0.75rem;
		}

		.nav-brand .nav-link-text {
			font-size: clamp(1.62rem, 6.2vw, 2.2rem);
		}
	}

	@media (max-width: 580px) {
		nav {
			align-items: center;
		}
	}
</style>
