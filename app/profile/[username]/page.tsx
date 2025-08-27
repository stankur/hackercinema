"use client";

import { useEffect, useState, use } from "react";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import { validateProfileData, type ProfileData } from "@/lib/schemas";

interface PageProps {
	params: {
		username: string;
	};
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);
	const [data, setData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// First try to load custom profile data
		fetch(`/api/profiles/${username}.json`)
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				// If custom profile doesn't exist, fall back to sample data
				return fetch("/api/sample_index.json").then((res) =>
					res.json()
				);
			})
			.then((json) => {
				try {
					// Validate the data against our schema
					const validatedData = validateProfileData(json);
					setData(validatedData);
					setLoading(false);
				} catch (validationError) {
					console.error(
						`Validation error for ${username}:`,
						validationError
					);
					// If validation fails, try sample data as fallback
					return fetch("/api/sample_index.json").then((res) =>
						res.json()
					);
				}
			})
			.then((fallbackJson) => {
				// This will only run if validation failed above
				if (!data) {
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
					setLoading(false);
				}
			})
			.catch((error) => {
				console.error(`Failed to load profile for ${username}:`, error);
				// Try sample data as last resort
				fetch("/api/sample_index.json")
					.then((res) => res.json())
					.then((json) => {
						try {
							const validatedData = validateProfileData(json);
							setData(validatedData);
						} catch (validationError) {
							console.error(
								"Sample data validation failed:",
								validationError
							);
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
		<div className="min-h-screen bg-background">
			<div className="max-w-3xl mx-auto py-10 px-6 space-y-16">
				{/* Header */}
				<header>
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl font-bold text-foreground">
							{profile.name}
						</h1>
						{profile.headline && (
							<p className="text-base text-muted-foreground mt-1">
								{profile.headline}
							</p>
						)}
						{profile.location && (
							<div className="text-sm text-muted-foreground mt-3">
								{profile.location}
							</div>
						)}
					</div>
				</header>

				{/* About */}
				{about && (
					<section className="space-y-6">
						<div className="flex gap-4 items-center">
							<h2 className="text-xl font-mono tracking-widest uppercase">
								About
							</h2>
							<div className="h-0 flex-1 border-b-[0.1px] border-slate-600" />
						</div>
						<p className="text-base leading-relaxed text-foreground pl-4 md:pl-5">
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
