export interface GitHubProfile {
	login: string;
	avatar_url: string;
	bio?: string | null;
	location?: string | null;
	blog?: string;
}

export interface GitHubRepo {
	name: string;
	description?: string | null;
	updated_at: string;
	stars?: number;
	language?: string | null;
	topics?: string[];
}

export interface Builder {
	username: string;
	theme: string;
	profile: GitHubProfile;
	repos: GitHubRepo[];
}
