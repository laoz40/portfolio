import type { NodeAssert } from "./animation-recipes.ts";

export type StyleSnap = {
	opacity: string;
	clipPath: string;
	transform: string;
};

function parseInset(clipPath: string): string[] | undefined {
	if (clipPath === "none") {
		return ["0px", "0px", "0px", "0px"];
	}

	const match = /^inset\(\s*([^)]+)\)/.exec(clipPath);
	if (match === null) {
		return undefined;
	}

	const parts = match[1].trim().split(/\s+/);
	if (parts.length === 1) {
		return [parts[0], parts[0], parts[0], parts[0]];
	}

	if (parts.length === 2) {
		return [parts[0], parts[1], parts[0], parts[1]];
	}

	if (parts.length === 3) {
		return [parts[0], parts[1], parts[2], parts[1]];
	}

	if (parts.length === 4) {
		return parts;
	}

	return undefined;
}

function isPercent100(value: string): boolean {
	return value === "100%" || Number.parseFloat(value) === 100;
}

function opacityOk(value: string, expect: "hidden" | "revealed"): boolean {
	const opacity = Number(value);
	if (expect === "hidden") {
		return opacity <= 0.05;
	}

	return opacity >= 0.95;
}

function clipOk(clipPath: string, expect: NonNullable<NodeAssert["clip"]>): boolean {
	const inset = parseInset(clipPath);
	if (expect === "revealed") {
		if (clipPath === "none") {
			return true;
		}

		if (inset === undefined) {
			return false;
		}

		return !isPercent100(inset[1]) && !isPercent100(inset[2]);
	}

	if (inset === undefined) {
		return false;
	}

	if (expect === "hidden-right") {
		return isPercent100(inset[1]);
	}

	return isPercent100(inset[2]);
}

function readTranslateY(transform: string): number {
	if (transform === "none" || transform === "") {
		return 0;
	}

	const translateY = /translateY\(\s*(-?[\d.]+)(px|rem|em)?/i.exec(transform);
	if (translateY !== null) {
		const value = Number(translateY[1]);
		const unit = translateY[2];
		if (unit === "rem" || unit === "em") {
			return value * 16;
		}

		return value;
	}

	const matrix3d = /^matrix3d\((.+)\)$/.exec(transform);
	if (matrix3d !== null) {
		const parts = matrix3d[1].split(",").map((part) => Number(part.trim()));
		return parts[13] ?? 0;
	}

	const matrix = /^matrix\((.+)\)$/.exec(transform);
	if (matrix === null) {
		return 0;
	}

	const parts = matrix[1].split(",").map((part) => Number(part.trim()));
	return parts[5] ?? 0;
}

function translateYOk(transform: string, expect: NonNullable<NodeAssert["translateY"]>): boolean {
	const y = Math.abs(readTranslateY(transform));
	if (expect.hiddenMin !== undefined && y < expect.hiddenMin) {
		return false;
	}

	if (expect.revealedMax !== undefined && y > expect.revealedMax) {
		return false;
	}

	return true;
}

export function snapRevealed(snap: StyleSnap, how: "clip" | "opacity"): boolean {
	if (how === "clip") {
		return clipOk(snap.clipPath, "revealed");
	}

	return opacityOk(snap.opacity, "revealed");
}

export function assertSnap(
	selector: string,
	index: number,
	snap: StyleSnap,
	expect: NodeAssert,
): void {
	if (expect.opacity !== undefined && !opacityOk(snap.opacity, expect.opacity)) {
		throw new Error(
			`${selector}[${index}] opacity expected ${expect.opacity}, got ${snap.opacity}`,
		);
	}

	if (expect.clip !== undefined && !clipOk(snap.clipPath, expect.clip)) {
		throw new Error(`${selector}[${index}] clip expected ${expect.clip}, got ${snap.clipPath}`);
	}

	if (expect.translateY !== undefined && !translateYOk(snap.transform, expect.translateY)) {
		throw new Error(
			`${selector}[${index}] translateY expected ${JSON.stringify(expect.translateY)}, got ${snap.transform}`,
		);
	}
}
