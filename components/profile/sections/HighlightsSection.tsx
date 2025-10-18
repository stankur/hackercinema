"use client";

import { useMemo } from "react";
import RepoCard from "@/components/RepoCard";
import SharedSkeletonRows from "./SharedSkeletonRows";
import type { GitHubRepo } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

interface HighlightsSectionProps {
	repos: GitHubRepo[] | null;
	highlightedRepoNames: string[] | undefined;
	username: string;
	aiEnabled?: boolean;
}

export default function HighlightsSection({
	repos,
	highlightedRepoNames,
	username,
	aiEnabled = false,
}: HighlightsSectionProps) {
	const { login } = useAuth();
	const canEdit = login === username;

	// Derive highlighted repos from repos + highlightedRepoNames
	const highlightedRepos = useMemo(() => {
		if (!repos || !highlightedRepoNames) return [];
		const map = new Map(repos.map((r) => [r.name, r]));
		return highlightedRepoNames
			.map((name) => map.get(name))
			.filter(Boolean) as GitHubRepo[];
	}, [repos, highlightedRepoNames]);

	// Still loading
	if (highlightedRepoNames === undefined) {
		return <SharedSkeletonRows count={5} height={100} />;
	}

	// Empty array - check if repos is empty or still processing
	if (highlightedRepoNames.length === 0) {
		// No repos exist - show empty state
		if (repos && repos.length === 0) {
			return (
				<div className="text-sm text-muted-foreground">
					No repositories found.
				</div>
			);
		}
		// Repos exist but highlights still processing - show skeleton
		return <SharedSkeletonRows count={5} height={100} />;
	}

	if (highlightedRepos.length > 0) {
		// Sort highlighted repos by updated_at (most recent first)
		const sortedHighlightedRepos = [...highlightedRepos].sort((a, b) => {
			const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
			const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
			return bTime - aTime;
		});

		return (
			<div className="space-y-6">
				{sortedHighlightedRepos.map((repo) => {
					const ownerFromId = (repo as { id?: string })?.id?.split(
						"/"
					)?.[0] as string;
					return (
						<RepoCard
							key={(repo as { id?: string })?.id || repo.name}
							repo={repo}
							owner={ownerFromId}
							pageUsername={username}
							showOwner={false}
							showUsernameInsteadOfDate={false}
							aiEnabled={aiEnabled}
							aiShowLoadingIfMissing={true}
							canEdit={canEdit}
						/>
					);
				})}
			</div>
		);
	}

	// Fallback loading state
	return <SharedSkeletonRows count={5} height={100} />;
}
