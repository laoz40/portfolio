export const encodeHtmlEntities = (value: string) =>
	Array.from(value, (character) => `&#${character.charCodeAt(0)};`).join("");

export const encodeEmailHref = (email: string) =>
	encodeHtmlEntities(`mailto:${email}`);
