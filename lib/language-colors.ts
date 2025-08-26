// Simple seeded RNG for consistent results
function simpleHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
	let current = seed;
	return function () {
		current = (current * 9301 + 49297) % 233280;
		return current / 233280;
	};
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const cleanHex = hex.replace("#", "");
	const r = parseInt(cleanHex.substring(0, 2), 16);
	const g = parseInt(cleanHex.substring(2, 4), 16);
	const b = parseInt(cleanHex.substring(4, 6), 16);
	return { r, g, b };
}

function getBrightness(hex: string): number {
	const rgb = hexToRgb(hex);
	return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

// Convert percentage (0-100) to hex opacity format (00-FF)
function percentageToHexOpacity(percentage: number): string {
	const clampedPercentage = Math.max(0, Math.min(100, percentage));
	const alpha = Math.round((clampedPercentage / 100) * 255);
	return alpha.toString(16).padStart(2, "0").toUpperCase();
}

// Generate subtle grayscale gradient for card backgrounds (not language-dependent)
export function generateCardBackground(seed: string): string {
	const seedNumber = simpleHash(seed);
	const rng = seededRandom(seedNumber);

	// Generate random positions for subtle grayscale gradients
	const x1 = Math.floor(rng() * 100);
	const y1 = Math.floor(rng() * 100);
	const x2 = Math.floor(rng() * 100);
	const y2 = Math.floor(rng() * 100);

	// Very subtle grayscale colors with low opacity
	const lightness1 = 20 + rng() * 30; // 20-50% lightness
	const lightness2 = 20 + rng() * 30; // 20-50% lightness
	const opacity = percentageToHexOpacity(3 + rng() * 4); // 3-7% opacity

	const color1 = `hsl(0, 0%, ${lightness1}%)`;
	const color2 = `hsl(0, 0%, ${lightness2}%)`;

	// SVG noise filter - very subtle
	const noiseSvg = `data:image/svg+xml;base64,${btoa(`
    <svg viewBox="0 0 200 200" xmlns='http://www.w3.org/2000/svg'>
      <filter id='noiseFilter'>
        <feTurbulence type='fractalNoise' baseFrequency='0.3' numOctaves='1' stitchTiles='stitch'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#noiseFilter)' opacity='0.02'/>
    </svg>
  `)}`;

	return `
    radial-gradient(circle at ${x1}% ${y1}%, ${color1}${opacity} 0%, transparent 50%), 
    radial-gradient(circle at ${x2}% ${y2}%, ${color2}${opacity} 0%, transparent 50%),
    url("${noiseSvg}")
  `;
}

// Get language color for the dot indicator
export function getLanguageColor(
	language: string,
	languageColors?: Record<string, string[]>
): string {
	if (languageColors && languageColors[language]) {
		return languageColors[language][0]; // Use first color from colors.json
	}
	// Fallback: generate a color based on language name
	const hue = simpleHash(language) % 360;
	return `hsl(${hue}, 60%, 50%)`;
}

// Load language colors from colors.json
let languageColorsCache: Record<string, string[]> | null = null;

async function loadLanguageColors(): Promise<Record<string, string[]>> {
	if (languageColorsCache) return languageColorsCache;

	try {
		const response = await fetch("/api/colors.json");
		languageColorsCache = await response.json();
		return languageColorsCache || {};
	} catch (error) {
		console.warn("Failed to load language colors:", error);
		return {};
	}
}

// Get card background (grayscale, seeded by repo name)
export async function getCardBackground(repoName: string): Promise<string> {
	return generateCardBackground(repoName);
}

// Get language color for dot indicator
export async function getLanguageDotColor(language: string): Promise<string> {
	const colors = await loadLanguageColors();
	return getLanguageColor(language, colors);
}
