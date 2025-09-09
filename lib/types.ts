export interface GitHubProfile {
	login: string;
	avatar_url: string;
	bio?: string | null;
	location?: string | null;
	blog?: string;
}

export interface GalleryImage {
	alt: string;
	url: string;
	original_url: string;
}

export interface GitHubRepo {
	name: string;
	description?: string | null;
	generated_description?: string | null;
	updated_at: string;
	stars?: number;
	language?: string | null;
	topics?: string[];
	link?: string;
	gallery?: GalleryImage[];
	tech_doc?: string;
	toy_implementation?: string;
}

export interface Builder {
	username: string;
	theme: string;
	profile: GitHubProfile;
	repos: GitHubRepo[];
	similar_repos?: Array<{ username: string; repo_name: string }>;
}
