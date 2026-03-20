export function encodeHtmlEntities(value: string): string {
	return Array.from(value, (character) => `&#${character.charCodeAt(0)};`).join(
		"",
	);
}

export function encodeEmailHref(email: string): string {
	return encodeHtmlEntities(`mailto:${email}`);
}
