export interface GitHubProfile {
	login: string;
	avatar_url: string;
	bio?: string | null;
	location?: string | null;
	blog?: string;
	is_ghost?: boolean;
}

export interface GalleryImage {
	alt: string;
	url: string;
	original_url: string;
	/** Optional title for the image */
	title?: string;
	/** Optional caption for the image */
	caption?: string;
	/** Whether this image is a highlight */
	is_highlight?: boolean;
	/** Epoch milliseconds when the image was taken */
	taken_at?: number;
}

export interface GitHubRepo {
	id: string;
	name: string;
	description?: string | null;
	generated_description?: string | null;
	updated_at: string | null;
	stars?: number;
	language?: string | null;
	topics?: string[];
	link?: string;
	gallery?: GalleryImage[];
	tech_doc?: string;
	toy_implementation?: string;
	emphasis?: string[];
	keywords?: string[];
	kind?: string;
	is_ghost?: boolean;
}

export interface Builder {
	username: string;
	theme: string;
	profile: GitHubProfile;
	repos: GitHubRepo[] | null;
	similar_repos?: Array<{ username: string; repo_name: string }>;
}

export interface HackerNewsStory {
	by: string;
	descendants: number;
	extracted_at: string;
	hn_url: string;
	id: string;
	score: number;
	time: number;
	title: string;
	url?: string;
}
