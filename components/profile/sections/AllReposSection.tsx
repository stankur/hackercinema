"use client";

import RepoCard from "@/components/RepoCard";
import SharedSkeletonRows from "./SharedSkeletonRows";
import type { Builder } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

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
	const { login } = useAuth();
	const canEdit = login === username;
	const isGeneratingHighlights = highlightedRepoNames === undefined;

	// removed debug logging

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
				const ownerFromId = repo?.id?.split("/")?.[0];
				return (
					<RepoCard
						key={repo.id}
						repo={repo}
						owner={ownerFromId as string}
						pageUsername={username}
						showOwner={false}
						showUsernameInsteadOfDate={false}
						aiEnabled={aiEnabled}
						aiShowLoadingIfMissing={false}
						canEdit={canEdit}
					/>
				);
			})}
		</div>
	);
}
