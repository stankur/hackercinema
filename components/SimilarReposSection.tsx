"use client";

import { useState, useEffect } from "react";
import RepoCard from "./RepoCard";
import type { GitHubRepo } from "@/lib/types";

interface SimilarReposSectionProps {
	similarRepos: Array<{username: string, repo_name: string}>;
}

export default function SimilarReposSection({
	similarRepos,
}: SimilarReposSectionProps) {
	const [foundRepos, setFoundRepos] = useState<Array<{repo: GitHubRepo, owner: string}>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showAllRepos, setShowAllRepos] = useState(false);

	// Fetch and search for repos when component mounts
	useEffect(() => {
		const fetchAndSearchRepos = async () => {
			setIsLoading(true);

			// Add a small delay to prevent flicker
			await new Promise((resolve) => setTimeout(resolve, 100));

			try {
				const response = await fetch("/api/data.json");
				const data = await response.json();

				// Search for each repo in the similar_repos array
				const foundReposData: Array<{repo: GitHubRepo, owner: string}> = [];
				
				similarRepos.forEach(({username, repo_name}) => {
					const user = data.find((u: {username: string, repos?: GitHubRepo[]}) => u.username === username);
					if (user && user.repos) {
						const repo = user.repos.find((r: GitHubRepo) => r.name === repo_name);
						if (repo) {
							foundReposData.push({ repo, owner: username });
						}
					}
				});

				setFoundRepos(foundReposData);
			} catch (error) {
				console.error("Failed to fetch and search repos:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAndSearchRepos();
	}, [similarRepos]);

	const displayedRepos = showAllRepos ? foundRepos : foundRepos.slice(0, 5);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<div className="flex justify-center py-8">
					<div className="relative">
						<div className="w-8 h-8 border-2 border-muted-foreground/30 rounded-full"></div>
						<div className="absolute inset-0 w-8 h-8 border-2 border-foreground rounded-full border-t-transparent animate-spin"></div>
					</div>
				</div>
			) : foundRepos.length > 0 ? (
				<>
					{displayedRepos.map(({ repo, owner }) => (
						<RepoCard
							key={`${owner}-${repo.name}`}
							repo={repo}
							owner={owner}
							showOwner={false}
							showUsernameInsteadOfDate={true}
						/>
					))}

					{foundRepos.length > 5 && (
						<div className="text-center pt-4">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowAllRepos(!showAllRepos);
								}}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
							>
								{showAllRepos ? "show less" : "show more"}
							</button>
						</div>
					)}
				</>
			) : (
				<div className="text-sm text-muted-foreground">
					No similar repositories found.
				</div>
			)}
		</div>
	);
}
