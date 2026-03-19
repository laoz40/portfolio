<script lang="ts">
	import { onMount } from "svelte";

	export let rootSelector = "[data-scrollspy-root]";
	export let headingSelector = "h2";

	type ScrollSpyItem = {
		id: string;
		label: string;
		target: HTMLElement;
	};

	const slugifyHeadingText = (textValue: string) =>
		String(textValue)
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

	const isValidHeading = (headingNode: Element): headingNode is HTMLElement =>
		headingNode instanceof HTMLElement &&
		typeof headingNode.textContent === "string" &&
		headingNode.textContent.trim().length > 0;

	const ensureHeadingId = (headingNode: HTMLElement, usedIds: Set<string>) => {
		if (headingNode.id) {
			usedIds.add(headingNode.id);
			return headingNode.id;
		}

		const baseId =
			slugifyHeadingText(headingNode.textContent ?? "") || "section";
		let nextId = baseId;
		let suffix = 2;

		while (document.getElementById(nextId) || usedIds.has(nextId)) {
			nextId = `${baseId}-${suffix}`;
			suffix += 1;
		}

		headingNode.id = nextId;
		usedIds.add(nextId);
		return nextId;
	};

	const getItemsFromHeadings = (
		contentRoot: Element,
		headingSelectorValue: string,
	): ScrollSpyItem[] => {
		const usedIds = new Set<string>();
		const seenTargets = new Set<HTMLElement>();
		const nextItems: ScrollSpyItem[] = [];

		const headings = Array.from(
			contentRoot.querySelectorAll(headingSelectorValue),
		).filter(isValidHeading);

		for (const heading of headings) {
			const id = ensureHeadingId(heading, usedIds);
			const nearestSection = heading.closest("section");
			const target =
				nearestSection instanceof HTMLElement ? nearestSection : heading;

			if (seenTargets.has(target)) {
				continue;
			}

			seenTargets.add(target);
			nextItems.push({
				id,
				label: heading.textContent?.trim() ?? "",
				target,
			});
		}

		return nextItems;
	};

	const pickActiveTarget = (
		entriesByTarget: Map<HTMLElement, IntersectionObserverEntry>,
		anchorY: number,
	) => {
		const visibleEntries = Array.from(entriesByTarget.values());
		if (visibleEntries.length === 0) {
			return null;
		}

		const sortedByTopDesc = visibleEntries.sort(
			(entryA, entryB) =>
				entryB.boundingClientRect.top - entryA.boundingClientRect.top,
		);

		const crossingEntry = sortedByTopDesc.find(
			(entry) =>
				entry.boundingClientRect.top <= anchorY &&
				entry.boundingClientRect.bottom >= anchorY,
		);
		if (crossingEntry) {
			return crossingEntry.target instanceof HTMLElement
				? crossingEntry.target
				: null;
		}

		const nearestAboveEntry = sortedByTopDesc.find(
			(entry) => entry.boundingClientRect.top <= anchorY,
		);
		const fallbackTarget = (nearestAboveEntry || sortedByTopDesc[0]).target;

		return fallbackTarget instanceof HTMLElement ? fallbackTarget : null;
	};

	let items: ScrollSpyItem[] = [];
	let activeId = "";

	onMount(() => {
		let observer: IntersectionObserver | null = null;

		const cleanupObserver = () => {
			observer?.disconnect();
			observer = null;
		};

		const syncScrollSpy = () => {
			cleanupObserver();

			const contentRoot = document.querySelector(rootSelector);

			if (!contentRoot) {
				items = [];
				activeId = "";
				return;
			}

			items = getItemsFromHeadings(contentRoot, headingSelector);
			activeId = items[0]?.id ?? "";

			if (items.length === 0 || !("IntersectionObserver" in window)) {
				return;
			}

			const targetIdByElement = new Map(
				items.map((item) => [item.target, item.id] as const),
			);
			const intersectingTargets = new Map<
				HTMLElement,
				IntersectionObserverEntry
			>();

			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!(entry.target instanceof HTMLElement)) {
							continue;
						}

						if (entry.isIntersecting) {
							intersectingTargets.set(entry.target, entry);
						} else {
							intersectingTargets.delete(entry.target);
						}
					}

					const anchorY = window.innerHeight * 0.2;
					const nextActiveTarget = pickActiveTarget(
						intersectingTargets,
						anchorY,
					);
					if (!nextActiveTarget) {
						return;
					}

					const nextActiveId = targetIdByElement.get(nextActiveTarget);
					if (nextActiveId) {
						activeId = nextActiveId;
					}
				},
				{
					rootMargin: "-20% 0px -60% 0px",
					threshold: [0, 0.25, 0.5],
				},
			);

			for (const item of items) {
				observer.observe(item.target);
			}
		};

		syncScrollSpy();
		document.addEventListener("astro:page-load", syncScrollSpy);

		return () => {
			cleanupObserver();
			document.removeEventListener("astro:page-load", syncScrollSpy);
		};
	});
</script>

{#if items.length > 0}
	<aside class="scrollspy">
		<nav aria-label="On this page">
			<ul class="scrollspy-list">
				{#each items as item}
					<li>
						<a
							class:is-active={item.id === activeId}
							class="scrollspy-link"
							href={`#${item.id}`}
							aria-current={item.id === activeId ? "location" : undefined}>
							<span
								class="scrollspy-link-text highlight-text"
								style="--highlight-colour: var(--color-highlight-yellow-strong);">
								{item.label}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>
{/if}

<style>
	.scrollspy {
		position: sticky;
		top: calc(var(--nav-offset) + 1rem);
		align-self: start;
		padding-top: 0.5rem;
		padding-left: 0.75rem;
	}

	.scrollspy-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.22rem;
	}

	.scrollspy-link {
		display: inline-flex;
		padding: 0.2rem 0;
		font-size: 1.5rem;
		font-weight: 400;
		line-height: 1.25;
		text-decoration: none;
		transition:
			color 180ms ease,
			transform 180ms ease;
	}

	.scrollspy-link:hover,
	.scrollspy-link:focus-visible {
		transform: translateX(0.12rem);
	}

	.scrollspy-link.is-active {
		font-weight: 700;
	}

	.scrollspy-link-text {
		--highlight-top: 0.1em;
		--highlight-bottom: 0.1em;
	}

	.scrollspy-link:hover .scrollspy-link-text::before,
	.scrollspy-link:focus-visible .scrollspy-link-text::before,
	.scrollspy-link.is-active .scrollspy-link-text::before {
		transform: var(
			--highlight-transform-active,
			scaleX(1) skewX(-4deg) rotate(-1.2deg)
		);
		opacity: 1;
	}

	@media (max-width: 1142px) {
		.scrollspy {
			display: none;
		}
	}

	@media (max-width: 980px) {
		.scrollspy {
			display: none;
		}
	}
</style>
