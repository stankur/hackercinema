"use client";

import { useEffect, useState } from "react";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import type { Experience } from "@/components/ExperienceItem";
import type { Project } from "@/components/ProjectItem";

type Profile = {
	id: string;
	name: string;
	headline?: string;
	location?: string;
	avatarEmoji?: string;
};

type ProfileData = {
	profile: Profile;
	contacts?: Record<string, string>;
	experiences?: Experience[];
	projects?: Project[];
	about?: string;
};

export default function TestProfilePage() {
	const [data, setData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/sample_index.json")
			.then((res) => res.json())
			.then((json: ProfileData) => {
				setData(json);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

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
			<div className="max-w-3xl mx-auto py-10 px-6 space-y-10">
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
					<section className="space-y-3">
						<h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
							About
						</h2>
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
					<section className="space-y-3">
						<h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
							Contacts
						</h2>
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
