"use client";

import { useState, useEffect, useCallback } from "react";
import RepoCard from "@/components/RepoCard";

import type { Builder, GitHubRepo } from "@/lib/types";

interface ClusterData {
	domain: string;
	size: number;
	repositories: Array<{
		username: string;
		name: string;
		description?: string;
		updated_at: string;
		stars: number;
		language?: string;
	}>;
}

type RepoWithOwner = GitHubRepo & { owner: string };

export default function ProjectsContent({
	pageUsername,
}: {
	pageUsername?: string;
}) {
	const [builders, setBuilders] = useState<Builder[]>([]);
	const [clusters, setClusters] = useState<ClusterData[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

	useEffect(() => {
		Promise.all([
			fetch("/api/data.json").then((res) => res.json()),
			fetch("/api/clusters.json").then((res) => res.json()),
		])
			.then(
				([buildersData, clustersData]: [Builder[], ClusterData[]]) => {
					setBuilders(buildersData);
					setClusters(clustersData);
					setLoading(false);
				}
			)
			.catch((err) => {
				console.error("Failed to load data:", err);
				setLoading(false);
			});
	}, []);

	// Get all repositories with owner information
	const getAllRepos = useCallback((): RepoWithOwner[] => {
		return builders.flatMap((builder) =>
			builder.repos.map((repo) => {
				const owner = builder.username;
				const id = (repo as GitHubRepo).id || `${owner}/${repo.name}`;
				return { ...(repo as GitHubRepo), id, owner } as RepoWithOwner;
			})
		);
	}, [builders]);

	// Get repositories grouped by domain
	const getReposByDomain = useCallback(() => {
		const allRepos = getAllRepos();
		const reposByDomain: Record<string, RepoWithOwner[]> = {};

		// Group clusters by domain and collect all repositories
		const domainClusters: Record<string, ClusterData[]> = {};
		clusters.forEach((cluster) => {
			if (!domainClusters[cluster.domain]) {
				domainClusters[cluster.domain] = [];
			}
			domainClusters[cluster.domain].push(cluster);
		});

		// For each domain, find matching repositories
		Object.entries(domainClusters).forEach(
			([domain, domainClustersList]) => {
				const clusterRepoSet = new Set(
					domainClustersList.flatMap((cluster) =>
						cluster.repositories.map(
							(repo) => `${repo.username}/${repo.name}`
						)
					)
				);

				reposByDomain[domain] = allRepos.filter((repo) =>
					clusterRepoSet.has(`${repo.owner}/${repo.name}`)
				);
			}
		);

		return reposByDomain;
	}, [getAllRepos, clusters]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	const allRepos = getAllRepos();
	const reposByDomain = getReposByDomain();
	const domains = Object.keys(reposByDomain).sort();
	const categories = ["all", ...domains];

	// Show first 5 categories, then "+X more" option
	const visibleCategories = showAllCategories
		? categories
		: categories.slice(0, 5);
	const hiddenCount = categories.length - 5;

	return (
		<div className="mb-8">
			{/* Category Pills */}
			<div className="flex flex-wrap justify-center gap-3 mb-8">
				{visibleCategories.map((category) => (
					<button
						key={category}
						onClick={() => setActiveCategory(category)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
							activeCategory === category
								? "bg-foreground/70 text-background"
								: "bg-muted/50 text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
						}`}
					>
						{category === "all" ? "All" : category}
					</button>
				))}

				{/* Show more link */}
				{!showAllCategories && hiddenCount > 0 && (
					<button
						onClick={() => setShowAllCategories(true)}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline underline-offset-2"
					>
						+{hiddenCount} more
					</button>
				)}
			</div>

			{/* Category Content */}
			<div className="space-y-6">
				{activeCategory === "all"
					? // Show all repositories
					  allRepos.map((repo) => (
							<RepoCard
								key={`${repo.owner}-${repo.name}`}
								repo={repo}
								owner={repo.owner}
								showOwnerAndDate={true}
								pageUsername={pageUsername || repo.owner}
							/>
					  ))
					: // Show repositories for selected category
					  (reposByDomain[activeCategory] || []).map((repo) => (
							<RepoCard
								key={`${repo.owner}-${repo.name}`}
								repo={repo}
								owner={repo.owner}
								showOwnerAndDate={true}
								pageUsername={pageUsername || repo.owner}
							/>
					  ))}
			</div>
		</div>
	);
}
