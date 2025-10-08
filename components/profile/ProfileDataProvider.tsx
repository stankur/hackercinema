"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { Builder } from "@/lib/types";

interface BackendRepo {
	id?: string;
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
		title?: string;
		caption?: string;
		is_highlight?: boolean;
		taken_at?: number;
	}>;
	/** Words to emphasize in generated_description */
	emphasis?: string[];
	/** New: keywords describing the repo */
	keywords?: string[];
	kind?: string;
}

interface ProfileData {
	profile?: {
		name?: string;
		headline?: string;
		links?: {
			email?: string;
			linkedin?: string;
			x?: string;
			yc?: string;
			personal?: string;
		};
	};
	about?: string;
	projects?: Array<{
		name: string;
		subtitle?: string;
		period?: string;
		tech?: string[];
		details?: string[];
		links?: {
			website?: string;
			youtube?: string;
			github?: string;
		};
	}>;
	workingOn?: string;
	writings?: Array<{
		title: string;
		link: string;
		description?: string;
		date?: string;
	}>;
}

interface UseProfileDataReturn {
	data: Builder | null;
	profileData: ProfileData | null;
	loading: boolean;
	highlightedRepoNames: string[] | undefined;
	highlightedRepos: Builder["repos"];
	visibleTabs: Array<{ id: string; label: string; loading?: boolean }>;
	activeTab: string;
	setActiveTab: (tabId: string) => void;
}

export function useProfileData(username: string): UseProfileDataReturn {
	const [data, setData] = useState<Builder | null>(null);
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [highlightedRepoNames, setHighlightedRepoNames] = useState<
		string[] | undefined
	>(undefined);
	const [activeTab, setActiveTab] = useState<string>("recent");

	// Function to determine visible tabs based on content
	const getVisibleTabs = useCallback(() => {
		const tabs: Array<{ id: string; label: string; loading?: boolean }> =
			[];

		// HIGHLIGHTS - show while generating or when repos exist (shown first)
		if (
			highlightedRepoNames === undefined ||
			(data?.repos && data.repos.length > 0)
		) {
			tabs.push({
				id: "highlights",
				label: "HIGHLIGHTS",
				loading: highlightedRepoNames === undefined,
			});
		}

		// RECENT PROJECTS - always show when we have data; show loading when repos empty (shown second)
		if (data) {
			tabs.push({
				id: "recent",
				label: "RECENT PROJECTS",
				loading: !data.repos || data.repos.length === 0,
			});
		}

		// ABOUT - show if there's about content
		if (profileData?.about && profileData.about.trim()) {
			tabs.push({ id: "about", label: "ABOUT" });
		}

		// PROJECTS - show if there are projects
		if (profileData?.projects && profileData.projects.length > 0) {
			tabs.push({ id: "projects", label: "PROJECTS" });
		}

		// WORKING ON - show if there's current work
		if (profileData?.workingOn && profileData.workingOn.trim()) {
			tabs.push({ id: "workingOn", label: "WORKING ON" });
		}

		// WRITINGS - show if there are writings
		if (profileData?.writings && profileData.writings.length > 0) {
			tabs.push({ id: "writings", label: "WRITINGS" });
		}

		return tabs;
	}, [data, profileData, highlightedRepoNames]);

	const highlightedRepos = useMemo(() => {
		if (!data?.repos) return [] as Builder["repos"];
		if (!highlightedRepoNames) return [] as Builder["repos"];
		const map = new Map<string, (typeof data.repos)[number]>(
			data.repos.map((r) => [r.name, r])
		);
		return highlightedRepoNames
			.map((name) => map.get(name))
			.filter(Boolean) as typeof data.repos;
	}, [data, highlightedRepoNames]);

	const visibleTabs = getVisibleTabs();

	// Auto-switch logic: start on Recent Projects, switch to Highlights once repos load
	const hasAutoSwitchedRef = useRef(false);
	useEffect(() => {
		if (hasAutoSwitchedRef.current) return;
		const reposReady = !!data?.repos && data.repos.length > 0;
		if (activeTab === "recent" && reposReady) {
			// Auto-switch to Highlights once Recent Projects is filled
			setActiveTab("highlights");
			hasAutoSwitchedRef.current = true;
		}
	}, [activeTab, data?.repos]);

	// Reset to Recent Projects on username change (reload/navigation)
	useEffect(() => {
		setActiveTab("recent");
		hasAutoSwitchedRef.current = false;
	}, [username]);

	useEffect(() => {
		// Trigger restart on mount
		fetch(`/api/backend/users/${username}/start`, {
			method: "POST",
		}).catch((error) => {
			console.error(`Failed to restart pipeline for ${username}:`, error);
		});

		// Load both backend data and profiles.json
		const loadData = async () => {
			try {
				// Load builder data from backend
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
								is_ghost: backendData.user.is_ghost,
							},
							repos: (backendData.repos || []).map(
								(repo: BackendRepo) => {
									const mapped = {
										id: repo.id,
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
										emphasis: repo.emphasis,
										keywords: repo.keywords || [],
										kind: repo.kind,
									} as const;
									if (typeof window !== "undefined") {
										console.log(
											"[PDP] mapped repo (initial)",
											{
												name: mapped.name,
												hasGen: !!mapped.generated_description,
												emphasisLen:
													mapped.emphasis?.length,
												keywordsLen:
													mapped.keywords?.length,
												sampleKeywords: (
													mapped.keywords || []
												).slice(0, 5),
												kind: mapped.kind,
											}
										);
									}
									return mapped;
								}
							),
							similar_repos: backendData.similar_repos || [],
						};
						if (typeof window !== "undefined") {
							const reposWithKw = mappedBuilder.repos.filter(
								(r) => (r.keywords || []).length > 0
							).length;
							const totalKw = mappedBuilder.repos.reduce(
								(sum, r) => sum + (r.keywords?.length || 0),
								0
							);
							console.log("[PDP] totals (initial)", {
								reposWithKeywords: reposWithKw,
								totalKeywords: totalKw,
							});
						}
						setData(mappedBuilder);
						// Capture highlighted repo names (may be undefined while generating)
						setHighlightedRepoNames(
							backendData.user?.highlighted_repos
						);
					}
				}

				// Load profile data from profiles.json (keep existing functionality)
				const profileRes = await fetch("/api/profiles.json");
				if (profileRes.ok) {
					const profiles = await profileRes.json();
					const profileKey = Object.keys(profiles).find(
						(key) => key.toLowerCase() === username.toLowerCase()
					);
					if (profileKey) {
						setProfileData(profiles[profileKey]);
					}
				}

				setLoading(false);
			} catch (error) {
				console.error(`Failed to load data for ${username}:`, error);
				setLoading(false);
			}
		};

		// Initial load
		loadData();

		// Set up polling every 4 seconds for backend data
		const interval = setInterval(async () => {
			try {
				const response = await fetch(
					`/api/backend/users/${username}/data`
				);
				if (response.ok) {
					const backendData = await response.json();
					// removed debug logging

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
								is_ghost: backendData.user.is_ghost,
							},
							repos: (backendData.repos || []).map(
								(repo: BackendRepo) => {
									const mapped = {
										id: repo.id,
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
										emphasis: repo.emphasis,
										keywords: repo.keywords || [],
										kind: repo.kind,
									} as const;
									if (typeof window !== "undefined") {
										console.log(
											"[PDP] mapped repo (poll)",
											{
												name: mapped.name,
												hasGen: !!mapped.generated_description,
												emphasisLen:
													mapped.emphasis?.length,
												keywordsLen:
													mapped.keywords?.length,
												sampleKeywords: (
													mapped.keywords || []
												).slice(0, 5),
											}
										);
									}
									return mapped;
								}
							),
							similar_repos: backendData.similar_repos || [],
						};
						if (typeof window !== "undefined") {
							const reposWithKw = mappedBuilder.repos.filter(
								(r) => (r.keywords || []).length > 0
							).length;
							const totalKw = mappedBuilder.repos.reduce(
								(sum, r) => sum + (r.keywords?.length || 0),
								0
							);
							console.log("[PDP] totals (poll)", {
								reposWithKeywords: reposWithKw,
								totalKeywords: totalKw,
							});
						}
						setData(mappedBuilder);
						// Update highlighted repo names during polling
						setHighlightedRepoNames(
							backendData.user?.highlighted_repos
						);
					}
				}
			} catch {
				// Silently handle polling errors
			}
		}, 4000);

		return () => clearInterval(interval);
	}, [username]);

	return {
		data,
		profileData,
		loading,
		highlightedRepoNames,
		highlightedRepos,
		visibleTabs,
		activeTab,
		setActiveTab,
	};
}
