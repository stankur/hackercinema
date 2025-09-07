"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SimilarReposSection from "@/components/SimilarReposSection";
import type { Builder } from "@/lib/types";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ForYouPage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const [data, setData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load user data from data.json
		fetch("/api/data.json")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load data");
				}
				return res.json();
			})
			.then((builders: Builder[]) => {
				// Find user with case-insensitive matching
				const user = builders.find(
					(builder) =>
						builder.username.toLowerCase() ===
						username.toLowerCase()
				);

				if (user) {
					setData(user);
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error(`Failed to load data for ${username}:`, error);
				setLoading(false);
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
				<div className="text-sm text-muted-foreground">
					User not found
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
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
							{data.profile?.avatar_url ? (
								<img
									src={data.profile.avatar_url}
									alt={`${data.username}'s avatar`}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
							)}
						</div>
					</Link>
				</div>
			</div>

			{/* For You Content */}
			<div className="max-w-3xl mx-auto px-6">
				{data.similar_repos && data.similar_repos.length > 0 ? (
					<SimilarReposSection similarRepos={data.similar_repos} />
				) : (
					<div className="text-sm text-muted-foreground text-center py-20">
						No recommendations found.
					</div>
				)}
			</div>
		</div>
	);
}
