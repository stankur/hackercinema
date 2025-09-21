"use client";

import RepoCard from "@/components/RepoCard";
import SharedSkeletonRows from "./SharedSkeletonRows";
import type { Builder } from "@/lib/types";

interface AllReposSectionProps {
	username: string;
	repos: Builder["repos"];
	highlightedRepoNames: string[] | undefined;
}

export default function AllReposSection({
	username,
	repos,
	highlightedRepoNames,
}: AllReposSectionProps) {
	const isGeneratingHighlights = highlightedRepoNames === undefined;

	if (!repos || repos.length === 0) {
		return <SharedSkeletonRows count={5} height={100} />;
	}

	// Sort repos by updated_at (most recent first)
	const sortedRepos = [...repos].sort(
		(a, b) =>
			new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
	);

	return (
		<div className="space-y-6">
			{sortedRepos.map((repo) => {
				const isHighlighted = highlightedRepoNames?.includes(repo.name);
				const aiEnabled = !isGeneratingHighlights && !!isHighlighted;
				return (
					<RepoCard
						key={repo.name}
						repo={repo}
						owner={username}
						showOwner={false}
						showUsernameInsteadOfDate={false}
						aiEnabled={aiEnabled}
						aiShowLoadingIfMissing={false}
					/>
				);
			})}
		</div>
	);
}
