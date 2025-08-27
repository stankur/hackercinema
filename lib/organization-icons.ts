// Mapping of social media and platform names to Simple Icons names
export const socialIcons: Record<string, string> = {
	// Social Media & Platforms
	github: "github",
	x: "x",
	twitter: "x", // Alias for backward compatibility
	instagram: "instagram",
	facebook: "facebook",
	youtube: "youtube",
	discord: "discord",
	slack: "slack",
	telegram: "telegram",
	whatsapp: "whatsapp",
	reddit: "reddit",
	twitch: "twitch",
	tiktok: "tiktok",
	snapchat: "snapchat",
	pinterest: "pinterest",

	// Tech Platforms
	stackoverflow: "stackoverflow",
	"dev.to": "devdotto",
	medium: "medium",
	hashnode: "hashnode",
	producthunt: "producthunt",
	behance: "behance",
	dribbble: "dribbble",
	figma: "figma",
	notion: "notion",
	airtable: "airtable",
	trello: "trello",
	asana: "asana",
	monday: "monday",

	// Development & Code
	gitlab: "gitlab",
	bitbucket: "bitbucket",
	codepen: "codepen",
	codesandbox: "codesandbox",
	replit: "replit",
	glitch: "glitch",
	jsfiddle: "jsfiddle",
	plunker: "plunker",

	// Cloud & Hosting
	vercel: "vercel",
	netlify: "netlify",
	heroku: "heroku",
	digitalocean: "digitalocean",
	aws: "amazonaws",
	azure: "microsoftazure",
	gcp: "googlecloud",

	// Communication
	zoom: "zoom",
	teams: "microsoftteams",
	skype: "skype",
	wechat: "wechat",
	line: "line",
	kakao: "kakao",
	viber: "viber",

	// Other Common Platforms
	spotify: "spotify",
	apple: "apple",
	google: "google",
	microsoft: "microsoft",
	dropbox: "dropbox",
	box: "box",
	onedrive: "microsoftonedrive",
	icloud: "icloud",
	yc: "ycombinator",
	ycombinator: "ycombinator",
};

// Helper function to get icon name for a social platform
export function getSocialIcon(platformName: string): string | null {
	const normalizedName = platformName.toLowerCase().replace(/[^a-z0-9]/g, "");

	// Try exact match first
	if (socialIcons[normalizedName]) {
		return socialIcons[normalizedName];
	}

	// Try partial match
	for (const [key, value] of Object.entries(socialIcons)) {
		if (normalizedName.includes(key) || key.includes(normalizedName)) {
			return value;
		}
	}

	return null;
}
