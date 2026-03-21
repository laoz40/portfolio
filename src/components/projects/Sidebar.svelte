<script lang="ts">
	import { onMount } from "svelte";

	export let rootSelector = "[data-scrollspy-root]";
	export let headingSelector = "h2";

	type ScrollSpyItem = {
		id: string;
		label: string;
		target: HTMLElement;
	};

	function slugifyHeadingText(textValue: string): string {
		return String(textValue)
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
	}

	function isValidHeading(headingNode: Element): headingNode is HTMLElement {
		return (
			headingNode instanceof HTMLElement &&
			typeof headingNode.textContent === "string" &&
			headingNode.textContent.trim().length > 0
		);
	}

	function ensureHeadingId(
		headingNode: HTMLElement,
		usedIds: Set<string>,
	): string {
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
	}

	function getScrollSpyTarget(heading: HTMLElement): HTMLElement {
		const nearestSection = heading.closest("section");

		return nearestSection instanceof HTMLElement ? nearestSection : heading;
	}

	function getItemsFromHeadings(
		contentRoot: Element,
		headingSelectorValue: string,
	): ScrollSpyItem[] {
		const usedIds = new Set<string>();
		const seenTargets = new Set<HTMLElement>();
		const nextItems: ScrollSpyItem[] = [];

		const headings = Array.from(
			contentRoot.querySelectorAll(headingSelectorValue),
		).filter(isValidHeading);

		for (const heading of headings) {
			const id = ensureHeadingId(heading, usedIds);
			const target = getScrollSpyTarget(heading);

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
	}

	function getVisibleEntries(
		entriesByTarget: Map<HTMLElement, IntersectionObserverEntry>,
	): IntersectionObserverEntry[] {
		return Array.from(entriesByTarget.values()).sort(
			(entryA, entryB) =>
				entryB.boundingClientRect.top - entryA.boundingClientRect.top,
		);
	}

	function findCrossingEntry(
		entries: IntersectionObserverEntry[],
		anchorY: number,
	): IntersectionObserverEntry | undefined {
		return entries.find(
			(entry) =>
				entry.boundingClientRect.top <= anchorY &&
				entry.boundingClientRect.bottom >= anchorY,
		);
	}

	function pickActiveTarget(
		entriesByTarget: Map<HTMLElement, IntersectionObserverEntry>,
		anchorY: number,
	): HTMLElement | null {
		const visibleEntries = getVisibleEntries(entriesByTarget);
		if (visibleEntries.length === 0) {
			return null;
		}

		const crossingEntry = findCrossingEntry(visibleEntries, anchorY);
		if (crossingEntry) {
			return crossingEntry.target instanceof HTMLElement
				? crossingEntry.target
				: null;
		}

		const nearestAboveEntry = visibleEntries.find(
			(entry) => entry.boundingClientRect.top <= anchorY,
		);
		const fallbackTarget = (nearestAboveEntry ?? visibleEntries[0]).target;

		return fallbackTarget instanceof HTMLElement ? fallbackTarget : null;
	}

	function isIntersectionObserverSupported(): boolean {
		return "IntersectionObserver" in window;
	}

	function createTargetIdMap(items: ScrollSpyItem[]): Map<HTMLElement, string> {
		return new Map(items.map((item) => [item.target, item.id] as const));
	}

	let items: ScrollSpyItem[] = [];
	let activeId = "";

	onMount(() => {
		let observer: IntersectionObserver | null = null;

		function cleanupObserver(): void {
			observer?.disconnect();
			observer = null;
		}

		function syncActiveId(
			targetIdByElement: Map<HTMLElement, string>,
			intersectingTargets: Map<HTMLElement, IntersectionObserverEntry>,
		): void {
			const anchorY = window.innerHeight * 0.2;
			const nextActiveTarget = pickActiveTarget(intersectingTargets, anchorY);

			if (!nextActiveTarget) {
				return;
			}

			const nextActiveId = targetIdByElement.get(nextActiveTarget);
			if (nextActiveId) {
				activeId = nextActiveId;
			}
		}

		function createObserver(items: ScrollSpyItem[]): IntersectionObserver {
			const targetIdByElement = createTargetIdMap(items);
			const intersectingTargets = new Map<
				HTMLElement,
				IntersectionObserverEntry
			>();

			return new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!(entry.target instanceof HTMLElement)) {
							continue;
						}

						if (entry.isIntersecting) {
							intersectingTargets.set(entry.target, entry);
							continue;
						}

						intersectingTargets.delete(entry.target);
					}

					syncActiveId(targetIdByElement, intersectingTargets);
				},
				{
					rootMargin: "-20% 0px -60% 0px",
					threshold: [0, 0.25, 0.5],
				},
			);
		}

		function observeItems(nextItems: ScrollSpyItem[]): void {
			observer = createObserver(nextItems);

			for (const item of nextItems) {
				observer.observe(item.target);
			}
		}

		function syncScrollSpy(): void {
			cleanupObserver();

			const contentRoot = document.querySelector(rootSelector);

			if (!contentRoot) {
				items = [];
				activeId = "";
				return;
			}

			items = getItemsFromHeadings(contentRoot, headingSelector);
			activeId = items[0]?.id ?? "";

			if (items.length === 0 || !isIntersectionObserverSupported()) {
				return;
			}

			observeItems(items);
		}

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
								style="--highlight-color: var(--color-highlight-yellow-strong);">
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
		font-family: var(--font-handwriting);
		font-size: var(--type-hand-size-label);
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
