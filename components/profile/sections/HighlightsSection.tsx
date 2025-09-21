"use client";

import RepoCard from "@/components/RepoCard";
import SharedSkeletonRows from "./SharedSkeletonRows";
import type { Builder } from "@/lib/types";

interface HighlightsSectionProps {
	highlightedRepoNames: string[] | undefined;
	highlightedRepos: Builder["repos"];
	username: string;
	aiEnabled?: boolean;
}

export default function HighlightsSection({
	highlightedRepoNames,
	highlightedRepos,
	username,
	aiEnabled = false,
}: HighlightsSectionProps) {
	if (highlightedRepoNames === undefined) {
		return <SharedSkeletonRows count={5} height={100} />;
	}

	if (highlightedRepoNames.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No repositories found.
			</div>
		);
	}

	if (highlightedRepos.length > 0) {
		// Sort highlighted repos by updated_at (most recent first)
		const sortedHighlightedRepos = [...highlightedRepos].sort(
			(a, b) =>
				new Date(b.updated_at).getTime() -
				new Date(a.updated_at).getTime()
		);

		return (
			<div className="space-y-6">
				{sortedHighlightedRepos.map((repo) => (
					<RepoCard
						key={repo.name}
						repo={repo}
						owner={username}
						showOwner={false}
						showUsernameInsteadOfDate={false}
						aiEnabled={aiEnabled && !!repo.generated_description}
					/>
				))}
			</div>
		);
	}

	// Fallback loading state
	return <SharedSkeletonRows count={5} height={100} />;
}
