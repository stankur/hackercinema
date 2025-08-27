export function generateGradientBackground(
	hexColor: string,
	opacity: number = 0.2
): string {
	// Convert hex to RGB
	const hex = hexColor.replace("#", "");
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);

	// Generate seeded random positions based on color values
	const seed = (r + g + b) % 1000; // Create a seed from color values
	const leftX = 0 + (seed % 50); // Left blob: 15-35% from left
	const leftY = 50 + (seed % 50); // Left blob: 70-90% from top
	const rightX = 50 + (seed % 50); // Right blob: 65-85% from left
	const rightY = 0 + (seed % 100); // Right blob: 10-30% from top

	// Create the gradient with seeded random positions
	const gradient = `radial-gradient(circle at ${rightX}% ${rightY}%, rgba(${r}, ${g}, ${b}, ${opacity}) 0%, transparent 50%), radial-gradient(circle at ${leftX}% ${leftY}%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.7
	}) 0%, transparent 50%)`;

	// Base64 encoded SVG noise texture with more grain
	const noiseTexture =
		"data:image/svg+xml;base64,CiAgICA8c3ZnIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPgogICAgICA8ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+CiAgICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuNCcgbnVtT2N0YXZlcz0nMycgc3RpdGNoVGlsZXM9J3N0aXRjaCcgc2VlZD0nMTIzJy8+CiAgICAgIDwvZmlsdGVyPgogICAgICA8cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9J3VybCgjbm9pc2VGaWx0ZXIpJyBvcGFjaXR5PScwLjA2Jy8+CiAgICA8L3N2Zz4KICA=";

	// Combine gradient, noise texture, and dark background
	return `${gradient}, url("${noiseTexture}")`;
}

export function generateGradientStyle(
	hexColor: string,
	opacity: number = 0.2
): React.CSSProperties {
	return {
		background: generateGradientBackground(hexColor, opacity),
		filter: "contrast(150%) brightness(70%)",
	};
}
