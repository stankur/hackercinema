"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getCardBackground, getLanguageDotColor } from "@/lib/language-colors";
import type { GitHubRepo } from "@/lib/types";

interface RepoCardProps {
	repo: GitHubRepo;
	owner: string;
	showOwner?: boolean;
	showUsernameInsteadOfDate?: boolean;
}

export default function RepoCard({
	repo,
	owner,
	showOwner = false,
	showUsernameInsteadOfDate = false,
}: RepoCardProps) {
	const [cardBackground, setCardBackground] = useState<string>("");
	const [languageDotColor, setLanguageDotColor] = useState<string>("");

	// Load card background and language dot color
	useEffect(() => {
		const loadStyles = async () => {
			// Generate card background based on repo name
			const background = await getCardBackground(repo.name);
			setCardBackground(background);

			// Get language dot color if language exists
			if (repo.language) {
				const dotColor = await getLanguageDotColor(repo.language);
				setLanguageDotColor(dotColor);
			}
		};
		loadStyles();
	}, [repo.name, repo.language]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<div
			className="border border-slate-800 rounded-md p-4 space-y-2 relative overflow-hidden"
			style={{
				background: cardBackground || undefined,
			}}
		>
			<div>
				<a
					href={`https://github.com/${owner}/${repo.name}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-base font-semibold text-foreground hover:text-primary hover:underline"
				>
					{repo.name}
				</a>
				{showOwner && (
					<span className="text-sm text-muted-foreground ml-2">
						by {owner}
					</span>
				)}
			</div>
			{repo.description && (
				<div className="text-sm text-muted-foreground leading-relaxed">
					{repo.description}
				</div>
			)}
			<div className="flex items-center justify-between mt-3 pt-2">
				<div className="flex items-center gap-3 text-xs text-muted-foreground/60">
					{repo.language && (
						<div className="flex items-center gap-1.5">
							<div
								className="w-2 h-2 rounded-full"
								style={{
									backgroundColor:
										languageDotColor || "#6b7280",
								}}
							></div>
							<span>{repo.language}</span>
						</div>
					)}
					{repo.stars !== undefined && repo.stars > 0 && (
						<div className="flex items-center gap-1.5">
							<Star className="w-3 h-3 text-muted-foreground/40" />
							<span>{repo.stars}</span>
						</div>
					)}
				</div>
				<div className="text-xs text-muted-foreground/60">
					{showUsernameInsteadOfDate
						? owner
						: `Updated ${formatDate(repo.updated_at)}`}
				</div>
			</div>
		</div>
	);
}
