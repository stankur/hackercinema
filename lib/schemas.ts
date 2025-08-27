import { z } from "zod";

// Basic, pragmatic schema that matches the sample data

export const ProfileSchema = z.object({
	id: z.string(),
	name: z.string(),
	headline: z.string().optional(),
	location: z.string().optional(),
	links: z
		.object({
			personal: z.string().optional(),
			github: z.string().optional(),
			linkedin: z.string().optional(),
			x: z.string().optional(),
			yc: z.string().optional(),
			email: z.string().optional(),
		})
		.optional(),
});

export const ExperienceSchema = z.object({
	org: z.string(),
	role: z.string(),
	location: z.string(),
	period: z.string(),
	tech: z.array(z.string()),
	highlights: z.array(z.string()),
});

export const ProjectSchema = z.object({
	name: z.string(),
	subtitle: z.string(),
	period: z.string(),
	tech: z.array(z.string()),
	details: z.array(z.string()),
});

export const WritingSchema = z.object({
	title: z.string(),
	link: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
});

export const IndexSchema = z.object({
	profile: ProfileSchema,
	contacts: z.record(z.string(), z.string()),
	experiences: z.array(ExperienceSchema),
	projects: z.array(ProjectSchema),
	writings: z.array(WritingSchema).optional(),
	about: z.string(),
	workingOn: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Writing = z.infer<typeof WritingSchema>;
export type IndexJson = z.infer<typeof IndexSchema>;

export function validateIndexJson(data: unknown): IndexJson {
	return IndexSchema.parse(data);
}

// Legacy type alias for backward compatibility
export type ProfileData = IndexJson;
export const ProfileDataSchema = IndexSchema;

// Validation function that throws on error (legacy name)
export function validateProfileData(data: unknown): ProfileData {
	return validateIndexJson(data);
}
