"use client";

import { useState, useEffect } from "react";
import RepoCard from "@/components/RepoCard";
import Navigation from "@/components/Navigation";

import type { Builder } from "@/lib/types";
import { preloadGitHubImages } from "@/lib/imageCache";

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

export default function ProjectsPage() {
	const [builders, setBuilders] = useState<Builder[]>([]);
	const [clusters, setClusters] = useState<ClusterData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCluster, setSelectedCluster] = useState<string>("all");
	const [showAllTabs, setShowAllTabs] = useState(false);

	useEffect(() => {
		Promise.all([
			fetch("/api/data.json").then((res) => res.json()),
			fetch("/api/clusters.json").then((res) => res.json()),
		])
			.then(
				async ([buildersData, clustersData]: [
					Builder[],
					ClusterData[]
				]) => {
					setBuilders(buildersData);
					setClusters(clustersData);
					setLoading(false);

					// Preload GitHub images in the background
					try {
						const galleries = buildersData.flatMap((builder) =>
							builder.repos.map((repo) => repo.gallery || [])
						);
						await preloadGitHubImages(galleries);
					} catch (error) {
						console.warn("Failed to preload some images:", error);
					}
				}
			)
			.catch((err) => {
				console.error("Failed to load data:", err);
				setLoading(false);
			});
	}, []);

	// Get filtered repositories based on selected cluster
	const getFilteredRepos = () => {
		if (selectedCluster === "all") {
			return builders.flatMap((builder) =>
				builder.repos.map((repo) => ({
					...repo,
					owner: builder.username,
				}))
			);
		}

		// Find all clusters with the selected domain and combine their repositories
		const selectedClusters = clusters.filter(
			(cluster) => cluster.domain === selectedCluster
		);
		if (selectedClusters.length === 0) return [];

		// Create a set of repo identifiers from all clusters with the selected domain
		const clusterRepoSet = new Set(
			selectedClusters.flatMap((cluster) =>
				cluster.repositories.map(
					(repo) => `${repo.username}/${repo.name}`
				)
			)
		);

		// Filter builders' repos to only include those in the selected cluster
		return builders.flatMap((builder) =>
			builder.repos
				.filter((repo) =>
					clusterRepoSet.has(`${builder.username}/${repo.name}`)
				)
				.map((repo) => ({
					...repo,
					owner: builder.username,
				}))
		);
	};

	// Get unique domains for tabs
	const domains = [
		...new Set(clusters.map((cluster) => cluster.domain)),
	].sort();

	// Determine which domains to show
	const maxVisibleTabs = 5;
	const visibleDomains = showAllTabs
		? domains
		: domains.slice(0, maxVisibleTabs);
	const hiddenDomainsCount = domains.length - maxVisibleTabs;

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	const filteredRepos = getFilteredRepos();

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-3xl mx-auto py-12 px-6">
				<Navigation />

				{/* Cluster Tabs */}
				<div className="mb-8">
					<div className="flex flex-wrap gap-5 justify-center font-mono text-sm mb-8">
						<button
							onClick={() => setSelectedCluster("all")}
							className={`transition-colors cursor-pointer tracking-tight text-xs capitalize ${
								selectedCluster === "all"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							All
						</button>
						{visibleDomains.map((domain) => (
							<button
								key={domain}
								onClick={() => setSelectedCluster(domain)}
								className={`transition-colors cursor-pointer tracking-tight text-xs capitalize ${
									selectedCluster === domain
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{domain}
							</button>
						))}
						{!showAllTabs && hiddenDomainsCount > 0 && (
							<button
								onClick={() => setShowAllTabs(true)}
								className="transition-colors cursor-pointer tracking-tight text-xs text-foreground/70 hover:text-foreground"
							>
								+{hiddenDomainsCount} more
							</button>
						)}
						{showAllTabs && domains.length > maxVisibleTabs && (
							<button
								onClick={() => setShowAllTabs(false)}
								className="transition-colors cursor-pointer tracking-tight text-xs text-foreground/70 hover:text-foreground"
							>
								Show less
							</button>
						)}
					</div>

					<div className="space-y-4">
						{filteredRepos.map((repo) => (
							<RepoCard
								key={`${repo.owner}-${repo.name}`}
								repo={repo}
								owner={repo.owner}
								showOwnerAndDate={true}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
