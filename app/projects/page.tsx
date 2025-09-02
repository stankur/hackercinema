"use client";

import { useState, useEffect, useCallback } from "react";
import RepoCard from "@/components/RepoCard";
import Navigation from "@/components/Navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Builder } from "@/lib/types";
import { preloadGitHubImages } from "@/lib/imageCache";
import { getLanguageDotColor } from "@/lib/language-colors";

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

interface RepoWithOwner {
	name: string;
	description?: string | null;
	updated_at: string;
	stars?: number;
	language?: string | null;
	topics?: string[];
	link?: string;
	gallery?: Array<{
		alt: string;
		url: string;
		original_url: string;
	}>;
	owner: string;
}

export default function ProjectsPage() {
	const [builders, setBuilders] = useState<Builder[]>([]);
	const [clusters, setClusters] = useState<ClusterData[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<"all" | "by-topic">("by-topic");

	// State for collapsible sections (all expanded by default)
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set()
	);

	// State for show more/less per section (all showing limited by default)
	const [showMoreSections, setShowMoreSections] = useState<Set<string>>(
		new Set()
	);

	// State for language colors cache
	const [languageColors, setLanguageColors] = useState<
		Record<string, string>
	>({});

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

					// Initialize all sections as collapsed by default
					setExpandedSections(new Set());

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

	// Get all repositories with owner information
	const getAllRepos = useCallback((): RepoWithOwner[] => {
		return builders.flatMap((builder) =>
			builder.repos.map((repo) => ({
				...repo,
				owner: builder.username,
			}))
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

	// Toggle section expand/collapse
	const toggleSection = (domain: string) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(domain)) {
				newSet.delete(domain);
			} else {
				newSet.add(domain);
			}
			return newSet;
		});
	};

	// Toggle show more/less for a section
	const toggleShowMore = (domain: string) => {
		setShowMoreSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(domain)) {
				newSet.delete(domain);
			} else {
				newSet.add(domain);
			}
			return newSet;
		});
	};

	// Get top 3 languages for a domain
	const getTopLanguages = (repos: RepoWithOwner[]) => {
		const languageCounts: Record<string, number> = {};

		repos.forEach((repo) => {
			if (repo.language) {
				languageCounts[repo.language] =
					(languageCounts[repo.language] || 0) + 1;
			}
		});

		return Object.entries(languageCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([language]) => language);
	};

	// Preload language colors
	useEffect(() => {
		const loadLanguageColors = async () => {
			const allRepos = getAllRepos();
			const allLanguages = new Set<string>();

			// Collect all unique languages
			allRepos.forEach((repo) => {
				if (repo.language) {
					allLanguages.add(repo.language);
				}
			});

			// Preload colors for all languages
			const colorPromises = Array.from(allLanguages).map(
				async (language) => {
					const color = await getLanguageDotColor(language);
					return [language, color];
				}
			);

			const colors = await Promise.all(colorPromises);
			const colorMap = Object.fromEntries(colors);
			setLanguageColors(colorMap);
		};

		if (builders.length > 0 && clusters.length > 0) {
			loadLanguageColors();
		}
	}, [builders, clusters, getAllRepos]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	const allRepos = getAllRepos();
	const reposByDomain = getReposByDomain();
	const domains = Object.keys(reposByDomain).sort();

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-3xl mx-auto py-12 px-6">
				<Navigation />

				{/* Main Tabs - Only ALL and BY TOPIC */}
				<div className="mb-8">
					<div className="flex gap-5 justify-center font-mono text-sm mb-8">
						<button
							onClick={() => setViewMode("all")}
							className={`transition-colors cursor-pointer tracking-tight text-xs uppercase ${
								viewMode === "all"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							All
						</button>
						<button
							onClick={() => setViewMode("by-topic")}
							className={`transition-colors cursor-pointer tracking-tight text-xs uppercase ${
								viewMode === "by-topic"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							By Topic
						</button>
					</div>

					{/* All Repositories View */}
					{viewMode === "all" && (
						<div className="space-y-4">
							{allRepos.map((repo) => (
								<RepoCard
									key={`${repo.owner}-${repo.name}`}
									repo={repo}
									owner={repo.owner}
									showOwnerAndDate={true}
								/>
							))}
						</div>
					)}

					{/* By Topic View - Collapsible Categories */}
					{viewMode === "by-topic" && (
						<div className="space-y-8">
							{domains.map((domain) => {
								const domainRepos = reposByDomain[domain] || [];
								const isExpanded = expandedSections.has(domain);
								const showingMore =
									showMoreSections.has(domain);
								const reposToShow = showingMore
									? domainRepos
									: domainRepos.slice(0, 5);
								const hasMore = domainRepos.length > 5;
								const topLanguages =
									getTopLanguages(domainRepos);

								return (
									<div key={domain} className="space-y-4">
										{/* Section Header - Clickable */}
										<div
											className="space-y-3 mb-10 cursor-pointer"
											onClick={() =>
												toggleSection(domain)
											}
										>
											<div className="flex justify-between items-center">
												<h2 className="text-xl font-mono text-foreground">
													{domain}
												</h2>
												<span className="text-lg text-muted-foreground font-mono">
													{isExpanded ? "—" : "+"}
												</span>
											</div>

											{/* Language Circles */}
											{topLanguages.length > 0 && (
												<div className="flex items-center gap-3">
													<span className="text-xs text-muted-foreground">
														Top Languages:
													</span>
													<div className="flex gap-1.5">
														{topLanguages.map(
															(language) => (
																<Tooltip
																	key={
																		language
																	}
																>
																	<TooltipTrigger
																		asChild
																	>
																		<div
																			className="w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125 active:scale-110"
																			style={{
																				backgroundColor:
																					languageColors[
																						language
																					] ||
																					"#666",
																			}}
																			onClick={(
																				e
																			) =>
																				e.stopPropagation()
																			}
																		/>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>
																			{
																				language
																			}
																		</p>
																	</TooltipContent>
																</Tooltip>
															)
														)}
													</div>
												</div>
											)}
										</div>

										{/* Section Content */}
										{isExpanded && (
											<div className="space-y-4">
												{/* Repositories */}
												{reposToShow.map((repo) => (
													<RepoCard
														key={`${repo.owner}-${repo.name}`}
														repo={repo}
														owner={repo.owner}
														showOwnerAndDate={true}
													/>
												))}

												{/* Show More/Less Button */}
												{hasMore && (
													<div className="flex justify-center pt-4">
														<button
															onClick={() =>
																toggleShowMore(
																	domain
																)
															}
															className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline mb-16 underline-offset-2"
														>
															{showingMore
																? "Show less"
																: "Show more"}
														</button>
													</div>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
