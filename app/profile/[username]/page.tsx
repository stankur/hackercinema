"use client";

import { useEffect, useState, use } from "react";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import { validateProfileData, type ProfileData } from "@/lib/schemas";
import { Mail, Globe, ExternalLink, Github, Linkedin } from "lucide-react";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);
	const [data, setData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load all profiles from the consolidated file
		fetch("/api/profiles.json")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load profiles");
				}
				return res.json();
			})
			.then((profiles) => {
				// Find profile with case-insensitive matching
				const profileKey = Object.keys(profiles).find(
					(key) => key.toLowerCase() === username.toLowerCase()
				);

				// Check if the requested username exists
				if (profileKey) {
					try {
						const validatedData = validateProfileData(
							profiles[profileKey]
						);
						setData(validatedData);
						setLoading(false);
						return; // Exit early, don't continue to fallback
					} catch (validationError) {
						console.error(
							`Validation error for ${username}:`,
							validationError
						);
						// Continue to fallback if validation fails
					}
				}

				// Username not found or validation failed, try sample data as fallback
				return fetch("/api/sample_index.json").then((res) =>
					res.json()
				);
			})
			.then((fallbackJson) => {
				// This will only run if username not found or validation failed above
				if (fallbackJson && !data) {
					try {
						const validatedFallback =
							validateProfileData(fallbackJson);
						setData(validatedFallback);
					} catch (fallbackError) {
						console.error(
							"Fallback data also failed validation:",
							fallbackError
						);
					}
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error(`Failed to load profile for ${username}:`, error);
				// Try sample data as last resort
				fetch("/api/sample_index.json")
					.then((res) => res.json())
					.then((json) => {
						if (json) {
							try {
								const validatedData = validateProfileData(json);
								setData(validatedData);
							} catch (validationError) {
								console.error(
									"Sample data validation failed:",
									validationError
								);
							}
						}
						setLoading(false);
					})
					.catch(() => setLoading(false));
			});
	}, [username]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">No data</div>
			</div>
		);
	}

	const {
		profile,
		about,
		experiences = [],
		projects = [],
		contacts = {},
	} = data;

	const hasContacts = contacts && Object.keys(contacts).length > 0;

	return (
		<div className="min-h-screen">
			<div className="max-w-3xl mx-auto py-10 px-6 space-y-16">
				{/* Header */}
				<header>
					<div className="flex-1 min-w-0 space-y-2">
						<h1 className="text-2xl font-semibold text-foreground">
							{profile.name}
						</h1>
						{profile.headline && (
							<p className="text-sm font-light mt-1">
								{profile.headline}
							</p>
						)}
						{profile.location && (
							<div className="text-sm font-light mt-3">
								{profile.location}
							</div>
						)}
						{/* Profile Links */}
						{profile.links && (
							<div className="flex gap-4 items-center mt-8">
								{profile.links.email && (
									<a
										href={`mailto:${profile.links.email}`}
										className="text-foreground hover:opacity-80 transition-opacity"
									>
										<Mail
											className="w-5 h-5"
											strokeWidth={1}
										/>
									</a>
								)}
								{profile.links.github && (
									<a
										href={profile.links.github}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:opacity-80 transition-opacity"
									>
										<Github
											className="w-5 h-5"
											strokeWidth={1}
										/>
									</a>
								)}
								{profile.links.linkedin && (
									<a
										href={profile.links.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:opacity-80 transition-opacity"
									>
										<Linkedin
											className="w-5 h-5"
											strokeWidth={1}
										/>
									</a>
								)}
								{profile.links.personal && (
									<a
										href={profile.links.personal}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:opacity-80 transition-opacity"
									>
										<Globe
											className="w-5 h-5"
											strokeWidth={1}
										/>
									</a>
								)}
							</div>
						)}
					</div>
				</header>

				{/* About */}
				{about && (
					<section className="space-y-6">
						<div className="flex gap-2 items-center">
							<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
								About
							</h2>
							<div className="h-0 flex-1 border-b-[0.1px] border-slate-600" />
						</div>
						<p className="text-sm leading-relaxed text-foreground font-light pl-4 md:pl-5">
							{about}
						</p>
					</section>
				)}

				{/* Experience */}
				<ExperienceSection experiences={experiences} />

				{/* Projects */}
				<ProjectsSection projects={projects} />

				{/* Contacts (hidden if empty) */}
				{hasContacts && (
					<section className="space-y-6">
						<div className="flex gap-4 items-center">
							<h2 className="text-lg font-mono tracking-wide uppercase">
								Contacts
							</h2>
							<div className="h-0 flex-1 border-b-[0.1px] border-slate-300" />
						</div>
						<ul className="text-sm text-foreground/90 space-y-1 pl-4 md:pl-5">
							{Object.entries(contacts).map(([key, value]) => (
								<li
									key={key}
									className="flex items-center gap-2"
								>
									<span className="text-muted-foreground capitalize">
										{key}:
									</span>
									<a
										href={value}
										className="text-primary hover:underline break-all"
									>
										{value}
									</a>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</div>
	);
}
