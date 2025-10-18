"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Builder } from "@/lib/types";

interface UseProfileDataReturn {
	data: Builder | null;
	loading: boolean;
	highlightedRepoNames: string[] | undefined;
	visibleTabs: Array<{ id: string; label: string; loading?: boolean }>;
	activeTab: string;
	setActiveTab: (tabId: string) => void;
}

export function useProfileData(username: string): UseProfileDataReturn {
	const [data, setData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);
	const [highlightedRepoNames, setHighlightedRepoNames] = useState<
		string[] | undefined
	>(undefined);
	const [activeTab, setActiveTab] = useState<string>("recent");

	// Function to determine visible tabs - always show both tabs
	const getVisibleTabs = useCallback(() => {
		const repos = data?.repos;
		return [
			{
				id: "highlights",
				label: "HIGHLIGHTS",
				loading:
					repos === null ||
					(repos &&
						repos.length > 0 &&
						(highlightedRepoNames === undefined ||
							highlightedRepoNames.length === 0)),
			},
			{
				id: "recent",
				label: "RECENT PROJECTS",
				loading: repos === null,
			},
		];
	}, [data?.repos, highlightedRepoNames]);

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
		// Load backend data
		const loadData = async () => {
			try {
				// Load builder data from backend
				const response = await fetch(
					`/api/backend/users/${username}/data`
				);
				if (response.ok) {
					const backendData = await response.json();

					if (backendData.user) {
						const mappedBuilder: Builder = {
							username: backendData.user.login,
							theme: backendData.user.theme,
							profile: {
								login: backendData.user.login,
								avatar_url: backendData.user.avatar_url,
								bio: backendData.user.bio,
								location: backendData.user.location,
								blog: backendData.user.blog,
								is_ghost: backendData.user.is_ghost,
							},
							repos: backendData.repos,
						};
						setData(mappedBuilder);
						// Capture highlighted repo names (may be undefined while generating)
						setHighlightedRepoNames(
							backendData.user?.highlighted_repos
						);
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
							repos: backendData.repos,
						};
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
		loading,
		highlightedRepoNames,
		visibleTabs,
		activeTab,
		setActiveTab,
	};
}
