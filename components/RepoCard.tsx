"use client";

import { useState, useEffect } from "react";
import { Star, ExternalLink, Images, Sparkles, ZoomOut } from "lucide-react";
import { getCardBackground, getLanguageDotColor } from "@/lib/language-colors";
import type { GitHubRepo } from "@/lib/types";
import { useGalleryModal } from "./GalleryModalProvider";

interface RepoCardProps {
	repo: GitHubRepo;
	owner: string;
	showOwner?: boolean;
	showUsernameInsteadOfDate?: boolean;
	showOwnerAndDate?: boolean;
}

export default function RepoCard({
	repo,
	owner,
	showOwner = false,
	showUsernameInsteadOfDate = false,
	showOwnerAndDate = false,
}: RepoCardProps) {
	const [cardBackground, setCardBackground] = useState<string>("");
	const [languageDotColor, setLanguageDotColor] = useState<string>("");
	const [showGeneratedDescription, setShowGeneratedDescription] =
		useState<boolean>(false);
	const { openGallery } = useGalleryModal();

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
		<div className="border border-muted/70 rounded-lg p-4">
			<div
				className="rounded-md py-2 space-y-2 relative overflow-hidden"
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
				{/* Description - toggles between original and generated */}
				{(repo.description ||
					(showGeneratedDescription &&
						repo.generated_description)) && (
					<div className="text-sm text-muted-foreground leading-relaxed">
						{showGeneratedDescription && repo.generated_description
							? repo.generated_description
							: repo.description}
					</div>
				)}

				{/* Username row */}
				{showOwnerAndDate ? (
					<div className="text-xs text-muted-foreground/60 mt-2">
						<button
							onClick={() => {
								// Navigate to the builder in the hackers tab
								window.location.hash = owner;
								// Switch to hackers tab if not already there
								const hackersTab = document.querySelector(
									'[data-tab="hackers"]'
								) as HTMLButtonElement;
								if (hackersTab) {
									hackersTab.click();
								}
							}}
							className="font-semibold cursor-pointer hover:text-foreground transition-colors"
						>
							{owner}
						</button>
					</div>
				) : (
					<div className="text-xs text-muted-foreground/60 mt-2">
						{showUsernameInsteadOfDate ? (
							<button
								onClick={() => {
									// Navigate to the builder on hackers page
									window.location.href = `/#${owner}`;
								}}
								className="font-semibold cursor-pointer hover:text-foreground transition-colors"
							>
								{owner}
							</button>
						) : (
							`Updated ${formatDate(repo.updated_at)}`
						)}
					</div>
				)}

				{/* Bottom row with metadata on left and action icons on right */}
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

					{/* Action icons in bottom right corner for easy mobile tapping */}
					<div className="flex items-start gap-3">
						{repo.link && (
							<a
								href={repo.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="Visit project link"
							>
								<ExternalLink size={20} />
							</a>
						)}
						{repo.gallery && repo.gallery.length > 0 && (
							<button
								onClick={() => openGallery(repo.gallery!)}
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="View gallery"
							>
								<Images size={20} />
							</button>
						)}
						{repo.generated_description && (
							<button
								onClick={() =>
									setShowGeneratedDescription(
										!showGeneratedDescription
									)
								}
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title={
									showGeneratedDescription
										? "Show concise description"
										: "Show AI-generated description"
								}
							>
								{showGeneratedDescription ? (
									<ZoomOut size={20} />
								) : (
									<Sparkles size={20} />
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
