"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Builder, Context } from "@/lib/types";

interface UseProfileDataReturn {
	data: Builder | null;
	loading: boolean;
	highlightedRepoNames: string[] | undefined;
	contexts: Context[] | null;
	contextsLoading: boolean;
	visibleTabs: Array<{ id: string; label: string; loading?: boolean }>;
	activeTab: string;
	setActiveTab: (tabId: string) => void;
	addContext: (newContext: Context) => void;
}

export function useProfileData(username: string): UseProfileDataReturn {
	const { login } = useAuth();
	const [data, setData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);
	const [highlightedRepoNames, setHighlightedRepoNames] = useState<
		string[] | undefined
	>(undefined);
	const [contexts, setContexts] = useState<Context[] | null>(null);
	const [contextsLoading, setContextsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("recent");

	const isOwner = login === username;

	// Function to determine visible tabs
	const getVisibleTabs = useCallback(() => {
		const repos = data?.repos;
		const tabs = [
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

		// Add contexts tab only if user is owner
		if (isOwner) {
			tabs.push({
				id: "contexts",
				label: "CONTEXT",
				loading: contextsLoading,
			});
		}

		return tabs;
	}, [data?.repos, highlightedRepoNames, isOwner, contextsLoading]);

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

	// Load contexts for owner only
	useEffect(() => {
		if (!isOwner) return;

		const loadContexts = async () => {
			setContextsLoading(true);
			try {
				const response = await fetch(
					`/api/backend/contexts/${username}`
				);
				if (response.ok) {
					const data = await response.json();
					if (data.contexts && Array.isArray(data.contexts)) {
						setContexts(data.contexts);
					}
				}
			} catch (error) {
				console.error(
					`Failed to load contexts for ${username}:`,
					error
				);
			} finally {
				setContextsLoading(false);
			}
		};

		loadContexts();
	}, [username, isOwner]);

	const addContext = useCallback((newContext: Context) => {
		setContexts((prev) => (prev ? [newContext, ...prev] : [newContext]));
	}, []);

	return {
		data,
		loading,
		highlightedRepoNames,
		contexts,
		contextsLoading,
		visibleTabs,
		activeTab,
		setActiveTab,
		addContext,
	};
}
