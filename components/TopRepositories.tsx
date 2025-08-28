"use client";

import { useState, useEffect } from "react";
import RepoCard from "./RepoCard";
import type { Builder, GitHubRepo } from "@/lib/types";

interface TopRepositoriesProps {
	builders: Builder[];
}

interface RepositoryWithOwner extends GitHubRepo {
	owner: string;
}

export default function TopRepositories({ builders }: TopRepositoriesProps) {
	const [topRepos, setTopRepos] = useState<RepositoryWithOwner[]>([]);
	const [isSectionExpanded, setIsSectionExpanded] = useState(true);
	const [showAllRepos, setShowAllRepos] = useState(false);

	// Extract all repositories and sort by stars
	useEffect(() => {
		const allRepos: RepositoryWithOwner[] = [];

		builders.forEach((builder) => {
			builder.repos.forEach((repo) => {
				if (repo.stars && repo.stars > 0) {
					allRepos.push({
						...repo,
						owner: builder.username,
					});
				}
			});
		});

		// Sort by stars (descending) and take top 10
		const sortedRepos = allRepos
			.sort((a, b) => (b.stars || 0) - (a.stars || 0))
			.slice(0, 10);

		setTopRepos(sortedRepos);
	}, [builders]);

	const displayedRepos = showAllRepos ? topRepos : topRepos.slice(0, 3);

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
					TOP REPOSITORIES
				</h2>
				<button
					onClick={() => setIsSectionExpanded(!isSectionExpanded)}
					className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
				>
					{isSectionExpanded ? "—" : "+"}
				</button>
			</div>

			{isSectionExpanded && (
				<>
					<div className="space-y-4">
						{displayedRepos.map((repo) => (
							<RepoCard
								key={`${repo.owner}-${repo.name}`}
								repo={repo}
								owner={repo.owner}
								showOwner={false}
							/>
						))}
					</div>

					{topRepos.length > 5 && (
						<div className="text-center pt-4">
							<button
								onClick={() => setShowAllRepos(!showAllRepos)}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
							>
								{showAllRepos ? "show less" : "show more"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
