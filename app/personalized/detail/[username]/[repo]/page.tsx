"use client";

import { useEffect, useState, use } from "react";
import CursorGradient from "@/components/CursorGradient";
import RepoCard from "@/components/RepoCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Builder, GitHubRepo } from "@/lib/types";

interface PageProps {
	params: Promise<{
		username: string;
		repo: string;
	}>;
}

export default function RepoDetailPage({ params }: PageProps) {
	const { username, repo: repoName } = use(params);
	const [repo, setRepo] = useState<GitHubRepo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load repo data from data.json
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

				if (user && user.repos) {
					// Find the specific repo
					const foundRepo = user.repos.find(
						(r: GitHubRepo) => r.name === repoName
					);
					if (foundRepo) {
						setRepo(foundRepo);
					}
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error(
					`Failed to load repo ${username}/${repoName}:`,
					error
				);
				setLoading(false);
			});
	}, [username, repoName]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	if (!repo) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">
					Repository not found
				</div>
			</div>
		);
	}

	// The markdown content is already a string with literal \n characters
	const techDoc = repo.tech_doc || "";

	return (
		<div className="min-h-screen relative">
			<CursorGradient />

			{/* Content */}
			<div className="max-w-3xl mx-auto px-6 py-10">
				{/* Repo Card with Glow Effect */}
				<div className="relative">
					{/* Glow effect that respects border radius */}
					<div
						className="absolute inset-0 rounded-lg"
						style={{
							background:
								"radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.06) 25%, rgba(99, 102, 241, 0.04) 50%, rgba(99, 102, 241, 0.02) 75%, transparent 100%)",
							filter: "blur(12px)",
							transform: "scale(1.1)",
							zIndex: -1,
						}}
					/>
					{/* Additional outer glow layer */}
					<div
						className="absolute inset-0 rounded-lg"
						style={{
							background:
								"radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.05) 30%, rgba(99, 102, 241, 0.03) 60%, transparent 100%)",
							filter: "blur(20px)",
							transform: "scale(1.2)",
							zIndex: -2,
						}}
					/>
					{/* Card */}
					<div className="relative z-10">
						<RepoCard
							repo={repo}
							owner={username}
							showOwner={false}
							showUsernameInsteadOfDate={true}
							hideDetailIcon={true}
							showGeneratedDescriptionByDefault={true}
						/>
					</div>
				</div>

				{/* Content */}
				<div className="mt-8">
					{techDoc ? (
						<div className="text-sm text-muted-foreground leading-relaxed">
							<MarkdownRenderer content={techDoc} />
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							No technical documentation available.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
