"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ProjectsContent from "@/components/ProjectsContent";
import CursorGradient from "@/components/CursorGradient";
import type { Builder } from "@/lib/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface BackendRepo {
	name: string;
	description?: string | null;
	generated_description?: string | null;
	updated_at?: string;
	pushed_at?: string;
	stargazers_count?: number;
	language?: string | null;
	topics?: string[];
	link?: string;
	gallery?: Array<{
		alt: string;
		url: string;
		original_url: string;
	}>;
	kind?: string;
}

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ExplorePage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const [userData, setUserData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Trigger restart on mount
		fetch(`/api/backend/users/${username}/start`, {
			method: "POST",
		}).catch((error) => {
			console.error(`Failed to restart pipeline for ${username}:`, error);
		});

		// Polling function to get data
		const pollData = async () => {
			try {
				const response = await fetch(
					`/api/backend/users/${username}/data`
				);
				if (response.ok) {
					const backendData = await response.json();

					// Map backend data to Builder format
					if (backendData.user) {
						const mappedBuilder: Builder = {
							username: backendData.user.login,
							theme: backendData.user.theme || "",
							profile: {
								login: backendData.user.login,
								avatar_url: backendData.user.avatar_url,
								bio: backendData.user.bio,
								location: backendData.user.location,
								blog: backendData.user.blog || "",
							},
							repos: (backendData.repos || []).map(
								(repo: BackendRepo) => ({
									name: repo.name,
									description: repo.description,
									generated_description:
										repo.generated_description,
									updated_at:
										repo.updated_at || repo.pushed_at,
									stars: repo.stargazers_count,
									language: repo.language,
									topics: repo.topics || [],
									link: repo.link,
									gallery: repo.gallery || [],
									kind: repo.kind,
								})
							),
							similar_repos: backendData.similar_repos || [],
						};
						setUserData(mappedBuilder);
					}
				}
				setLoading(false);
			} catch (error) {
				console.error(`Failed to load data for ${username}:`, error);
				setLoading(false);
			}
		};

		// Initial poll
		pollData();

		// Set up polling every 4 seconds
		const interval = setInterval(pollData, 4000);

		return () => clearInterval(interval);
	}, [username]);

	// Show skeleton loading state
	if (loading || !userData) {
		return (
			<div className="min-h-screen relative">
				<CursorGradient />
				{/* Navigation skeleton */}
				<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
					<div className="flex justify-between items-center relative z-20">
						<div></div>
						<div className="flex gap-10">
							<Link
								href={`/personalized/${username}`}
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								For You
							</Link>
							<Link
								href={`/personalized/${username}/explore`}
								className="text-sm text-foreground"
							>
								Explore
							</Link>
						</div>
						<div className="w-8 h-8 rounded-full bg-muted">
							<Skeleton circle height={32} width={32} />
						</div>
					</div>
				</div>

				{/* Content skeleton */}
				<div className="max-w-3xl mx-auto px-6">
					<div className="space-y-6">
						<Skeleton height={100} />
						<Skeleton height={100} />
						<Skeleton height={100} />
						<Skeleton height={100} />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			{/* Navigation */}
			<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
				<div className="flex justify-between items-center relative z-20">
					{/* Empty left space */}
					<div></div>

					{/* Centered tabs */}
					<div className="flex gap-10">
						<Link
							href={`/personalized/${username}`}
							className={`text-sm transition-colors ${
								pathname === `/personalized/${username}`
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							For You
						</Link>

						<Link
							href={`/personalized/${username}/explore`}
							className={`text-sm transition-colors ${
								pathname === `/personalized/${username}/explore`
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Explore
						</Link>
					</div>

					{/* Avatar on right within content width */}
					<Link
						href={`/personalized/${username}/profile`}
						className="cursor-pointer"
					>
						<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
							{userData.profile?.avatar_url ? (
								<Image
									src={userData.profile.avatar_url}
									alt={`${userData.username}'s avatar`}
									width={32}
									height={32}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
							)}
						</div>
					</Link>
				</div>
			</div>

			{/* Projects Content - Exact same as projects page */}
			<div className="max-w-3xl mx-auto px-6">
				<ProjectsContent />
			</div>
		</div>
	);
}
