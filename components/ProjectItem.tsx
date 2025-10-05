export type Project = {
	emoji?: string;
	name: string;
	subtitle?: string;
	period?: string;
	tech?: string[];
	details?: string[];
	links?: {
		website?: string;
		youtube?: string;
		github?: string;
	};
};