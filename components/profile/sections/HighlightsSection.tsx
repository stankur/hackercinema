"use client";

import RepoCard from "@/components/RepoCard";
import Skeleton from "react-loading-skeleton";
import type { Builder } from "@/lib/types";

interface HighlightsSectionProps {
	highlightedRepoNames: string[] | undefined;
	highlightedRepos: Builder["repos"];
	username: string;
}

export default function HighlightsSection({
	highlightedRepoNames,
	highlightedRepos,
	username,
}: HighlightsSectionProps) {
	if (highlightedRepoNames === undefined) {
		return (
			<div className="space-y-6">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} height={100} />
				))}
			</div>
		);
	}

	if (highlightedRepoNames.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No repositories found.
			</div>
		);
	}

	if (highlightedRepos.length > 0) {
		return (
			<div className="space-y-6">
				{highlightedRepos.map((repo) => (
					<RepoCard
						key={repo.name}
						repo={repo}
						owner={username}
						showOwner={false}
						showUsernameInsteadOfDate={false}
					/>
				))}
			</div>
		);
	}

	// Fallback loading state
	return (
		<div className="space-y-6">
			{Array.from({ length: 5 }).map((_, i) => (
				<Skeleton key={i} height={100} />
			))}
		</div>
	);
}
