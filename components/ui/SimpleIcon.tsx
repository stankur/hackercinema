import * as SimpleIcons from "simple-icons";

// Define the type for individual icons from the simple-icons package
interface SimpleIconData {
	title: string;
	slug: string;
	svg: string;
	path: string;
	source: string;
	hex: string;
	guidelines?: string;
}

interface SimpleIconProps {
	name: string;
	size?: number;
	color?: string;
	className?: string;
	title?: string;
}

export function SimpleIcon({
	name,
	size = 24,
	color = "currentColor",
	className = "",
	title,
}: SimpleIconProps) {
	// Convert name to the correct format (e.g., "github" -> "siGithub")
	const iconKey = `si${name.charAt(0).toUpperCase() + name.slice(1)}`;
	const icon = (SimpleIcons as unknown as Record<string, SimpleIconData>)[
		iconKey
	];

	if (!icon) {
		console.warn(`SimpleIcon: Icon "${name}" not found`);
		return null;
	}

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			className={className}
			style={{ fill: color }}
			role="img"
			aria-label={title || icon.title}
		>
			<title>{title || icon.title}</title>
			<path d={icon.path} />
		</svg>
	);
}

// Helper function to get available icon names
export function getAvailableIconNames(): string[] {
	return Object.keys(SimpleIcons as unknown as Record<string, SimpleIconData>)
		.filter((key) => key.startsWith("si"))
		.map((key) => key.slice(2).toLowerCase());
}

// Helper function to search icons by name
export function searchIcons(query: string): string[] {
	const searchTerm = query.toLowerCase();
	return getAvailableIconNames().filter((name) => name.includes(searchTerm));
}
