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

	// Simulate cubic-bezier easing with carefully crafted gradient stops
	// Using multiple overlapping gradients with varying opacities and sizes
	const primaryX = 60 + (seed % 40); // Primary blob: 30-70% from left
	const primaryY = 50 + (seed % 50); // Primary blob: 20-80% from top
	const secondaryX = 70 + (seed % 30); // Secondary blob: 70-100% from left
	const secondaryY = 80 + (seed % 20); // Secondary blob: 80-100% from top
	const accentX = 10 + (seed % 20); // Accent blob: 10-30% from left
	const accentY = 60 + (seed % 40); // Accent blob: 60-100% from top

	// Create multiple gradient layers with easing-like falloff
	// Primary gradient with smooth falloff (simulates ease-out)
	const primaryGradient = `radial-gradient(circle at ${primaryX}% ${primaryY}%, rgba(${r}, ${g}, ${b}, ${opacity}) 0%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.8
	}) 15%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.4
	}) 35%, rgba(${r}, ${g}, ${b}, ${opacity * 0.1}) 60%, transparent 80%)`;

	// Secondary gradient with different easing curve (simulates ease-in-out)
	const secondaryGradient = `radial-gradient(circle at ${secondaryX}% ${secondaryY}%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.7
	}) 0%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.5
	}) 20%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.3
	}) 45%, rgba(${r}, ${g}, ${b}, ${opacity * 0.05}) 70%, transparent 85%)`;

	// Accent gradient for subtle depth (simulates ease-in)
	const accentGradient = `radial-gradient(circle at ${accentX}% ${accentY}%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.4
	}) 0%, rgba(${r}, ${g}, ${b}, ${
		opacity * 0.2
	}) 25%, rgba(${r}, ${g}, ${b}, ${opacity * 0.05}) 50%, transparent 70%)`;

	// Combine all gradients for a smooth, easing-like effect
	const gradient = `${primaryGradient}, ${secondaryGradient}, ${accentGradient}`;

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
