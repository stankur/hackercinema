"use client";

import { useState, useEffect } from "react";
import {
	ExternalLink,
	Images,
	Sparkles,
	ZoomOut,
	ZoomIn,
	Pencil,
} from "lucide-react";
import { getCardBackground, getLanguageDotColor } from "@/lib/language-colors";
import type { GitHubRepo } from "@/lib/types";
import { useGalleryModal } from "./GalleryModalProvider";
import EmphasizedText from "./EmphasizedText";
import Link from "next/link";

interface RepoCardProps {
	repo: GitHubRepo;
	owner: string;
	showOwner?: boolean;
	showUsernameInsteadOfDate?: boolean;
	showOwnerAndDate?: boolean;
	hideDetailIcon?: boolean;
	showGeneratedDescriptionByDefault?: boolean;
	aiEnabled?: boolean;
	aiShowLoadingIfMissing?: boolean;
	canEdit?: boolean;
}

export default function RepoCard({
	repo,
	owner,
	showOwner = false,
	showUsernameInsteadOfDate = false,
	showOwnerAndDate = false,
	hideDetailIcon = false,
	showGeneratedDescriptionByDefault = false,
	aiEnabled = true,
	aiShowLoadingIfMissing = true,
	canEdit = false,
}: RepoCardProps) {
	const [cardBackground, setCardBackground] = useState<string>("");
	const [languageDotColor, setLanguageDotColor] = useState<string>("");
	const [showGeneratedDescription, setShowGeneratedDescription] =
		useState<boolean>(showGeneratedDescriptionByDefault);
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

	// Debug: log incoming props and repo emphasis/generation
	if (typeof window !== "undefined") {
		console.debug("[RepoCard] props", {
			name: repo.name,
			aiEnabled,
			hasGen: !!repo.generated_description,
			emphasisLen: repo.emphasis?.length,
		});
	}

	useEffect(() => {
		console.debug("[RepoCard] repo changed", {
			name: repo.name,
			hasGen: !!repo.generated_description,
			emphasisLen: repo.emphasis?.length,
		});
	}, [repo]);

	useEffect(() => {
		console.debug("[RepoCard] toggle", {
			name: repo.name,
			showGeneratedDescription,
		});
	}, [showGeneratedDescription, repo.name]);

	const isShowingGenerated =
		showGeneratedDescription && !!repo.generated_description;
	if (typeof window !== "undefined") {
		console.debug("[RepoCard] render", {
			name: repo.name,
			isShowingGenerated,
			emphasisLen: repo.emphasis?.length,
			showGeneratedDescription,
		});
	}

	return (
		<div className="border border-muted rounded-lg p-3 md:border-0 md:p-0">
			<div
				className="rounded-md py-1.5 md:py-2 space-y-2 relative overflow-hidden"
				style={{
					background: cardBackground || undefined,
				}}
			>
				{/* Top row with repo title, language info, and desktop action icons */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<a
							href={`https://github.com/${owner}/${repo.name}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-base font-semibold text-foreground hover:text-primary hover:underline"
						>
							{repo.name}
						</a>
						{/* Language info */}
						{repo.language && (
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
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
					</div>

					{/* Desktop action icons in top right */}
					<div className="hidden md:flex items-center gap-2 ml-4">
						{repo.link && (
							<a
								href={repo.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="Visit project link"
							>
								<ExternalLink size={14} />
							</a>
						)}
						{repo.gallery && repo.gallery.length > 0 && (
							<button
								onClick={() => openGallery(repo.gallery!)}
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="View gallery"
							>
								<Images size={14} />
							</button>
						)}
						{aiEnabled && (
							<>
								{(repo.generated_description ||
									aiShowLoadingIfMissing) && (
									<button
										onClick={() => {
											if (!repo.generated_description)
												return;
											if (
												hideDetailIcon &&
												showGeneratedDescription
											) {
												window.history.back();
											} else {
												setShowGeneratedDescription(
													!showGeneratedDescription
												);
											}
										}}
										disabled={!repo.generated_description}
										className={`cursor-pointer transition-colors p-1 ${
											!repo.generated_description
												? "text-muted-foreground/40 animate-pulse cursor-not-allowed"
												: "text-muted-foreground hover:text-foreground"
										}`}
										title={
											!repo.generated_description
												? "AI description generating..."
												: hideDetailIcon &&
												  showGeneratedDescription
												? "Go back"
												: showGeneratedDescription
												? "Show concise description"
												: "Show AI-generated description"
										}
									>
										{showGeneratedDescription ? (
											<ZoomOut size={14} />
										) : (
											<Sparkles size={14} />
										)}
									</button>
								)}
								{!hideDetailIcon &&
									showGeneratedDescription &&
									repo.tech_doc && (
										<Link
											href={`/personalized/detail/${owner}/${repo.name}`}
											className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
											title="View detailed explanation"
										>
											<ZoomIn size={14} />
										</Link>
									)}
							</>
						)}
						{canEdit && (
							<button
								onClick={() => {
									// Placeholder: open edit UI; to be implemented
									console.debug("Edit repo", {
										owner,
										name: repo.name,
									});
								}}
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="Edit repository"
							>
								<Pencil size={14} />
							</button>
						)}
					</div>
				</div>
				{/* Description - toggles between original and generated */}
				{(repo.description ||
					(showGeneratedDescription &&
						repo.generated_description)) && (
					<div className="text-sm text-muted-foreground leading-relaxed">
						{showGeneratedDescription &&
						repo.generated_description ? (
							<EmphasizedText
								text={repo.generated_description}
								emphasisWords={repo.emphasis || []}
							/>
						) : (
							repo.description
						)}
					</div>
				)}

				{/* Username row - only show for explore/for you pages with clickable usernames */}
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
				) : showUsernameInsteadOfDate ? (
					<div className="text-xs text-muted-foreground/60 mt-2">
						<button
							onClick={() => {
								// Navigate to the builder on hackers page
								window.location.href = `/#${owner}`;
							}}
							className="font-semibold cursor-pointer hover:text-foreground transition-colors"
						>
							{owner}
						</button>
					</div>
				) : null}

				{/* Mobile action icons in bottom right corner for easy mobile tapping */}
				<div className="flex items-center justify-end mt-3 pt-2 md:hidden">
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
						{aiEnabled && (
							<>
								{(repo.generated_description ||
									aiShowLoadingIfMissing) && (
									<button
										onClick={() => {
											if (!repo.generated_description)
												return;
											if (
												hideDetailIcon &&
												showGeneratedDescription
											) {
												window.history.back();
											} else {
												setShowGeneratedDescription(
													!showGeneratedDescription
												);
											}
										}}
										disabled={!repo.generated_description}
										className={`cursor-pointer transition-colors p-1 ${
											!repo.generated_description
												? "text-muted-foreground/40 animate-pulse cursor-not-allowed"
												: "text-muted-foreground hover:text-foreground"
										}`}
										title={
											!repo.generated_description
												? "AI description generating..."
												: hideDetailIcon &&
												  showGeneratedDescription
												? "Go back"
												: showGeneratedDescription
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
								{!hideDetailIcon &&
									showGeneratedDescription &&
									repo.tech_doc && (
										<Link
											href={`/personalized/detail/${owner}/${repo.name}`}
											className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
											title="View detailed explanation"
										>
											<ZoomIn size={20} />
										</Link>
									)}
							</>
						)}
						{canEdit && (
							<button
								onClick={() => {
									console.debug("Edit repo", {
										owner,
										name: repo.name,
									});
								}}
								className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors p-1"
								title="Edit repository"
							>
								<Pencil size={20} />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
