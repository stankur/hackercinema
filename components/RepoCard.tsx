"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Sparkles, ZoomOut, ZoomIn, Pencil } from "lucide-react";
import Image from "next/image";
import { getCardBackground, getLanguageDotColor } from "@/lib/language-colors";
import type { GitHubRepo, GalleryImage } from "@/lib/types";
import { useGalleryModal } from "./GalleryModalProvider";
import EmphasizedText from "./EmphasizedText";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
	uploadRepoImageAndPersist,
	parseOwnerRepoFromLink,
} from "@/lib/repoGallery";

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
	const [localGallery, setLocalGallery] = useState<
		GalleryImage[] | undefined
	>(repo.gallery && Array.isArray(repo.gallery) ? [...repo.gallery] : []);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const { openGallery } = useGalleryModal();

	// Enable image drop only when the viewer can edit this repo (profile owner)
	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		disabled: !canEdit,
		noClick: true,
		noKeyboard: true,
		multiple: false,
		accept: { "image/*": [] },
		onDrop: async (acceptedFiles) => {
			const file = acceptedFiles?.[0];
			if (!file || isUploading) return;
			try {
				setIsUploading(true);
				// Resolve repo owner for subject id
				const parsed = parseOwnerRepoFromLink(repo.link || "");
				const repoOwner = parsed?.owner || owner;
				const repoName = repo.name;
				const username = owner; // page username when canEdit is true

				const shouldBeHighlight = (localGallery?.length || 0) === 0;

				const { secureUrl } = await uploadRepoImageAndPersist({
					username,
					owner: repoOwner,
					repoName,
					file,
					alt: repo.name,
					isHighlight: shouldBeHighlight,
					title: "",
					caption: "",
				});

				// Update local gallery
				setLocalGallery((prev) => [
					...(prev || []),
					{
						url: secureUrl,
						original_url: secureUrl,
						alt: repo.name,
						title: "",
						caption: "",
						is_highlight: shouldBeHighlight,
						taken_at: Date.now(),
					},
				]);
			} catch (e) {
				console.error("Failed to upload/persist image", e);
				if (typeof window !== "undefined") {
					try {
						console.error("Failed to add image. Please try again.");
					} catch {}
				}
			} finally {
				setIsUploading(false);
			}
		},
	});

	// Keep local gallery in sync when repo prop changes
	useEffect(() => {
		setLocalGallery(
			repo.gallery && Array.isArray(repo.gallery) ? [...repo.gallery] : []
		);
	}, [repo.gallery]);

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
			kind: repo.kind,
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
				{...(canEdit ? getRootProps() : {})}
				className="rounded-md py-1.5 md:py-2 space-y-2 md:space-y-0 relative overflow-hidden md:flex md:items-start md:gap-4"
				style={{
					background: cardBackground || undefined,
				}}
			>
				{canEdit && <input {...getInputProps()} />}
				{/* Hero thumbnail with +N badge */}
				{(() => {
					const highlightGallery = (localGallery || []).filter(
						(img) => img.is_highlight
					);
					if (highlightGallery.length === 0) return null;
					return (
						<button
							onClick={() => {
								// Determine repo owner for delete functionality
								const parsed = parseOwnerRepoFromLink(
									repo.link || ""
								);
								const repoOwner = parsed?.owner || owner;

								openGallery(highlightGallery, 0, {
									username: owner, // page username when canEdit is true
									owner: repoOwner,
									repoName: repo.name,
									repoLink: repo.link,
									canEdit,
									onImageDeleted: (deletedUrl: string) => {
										// Remove from local gallery
										setLocalGallery(
											(prev) =>
												prev?.filter(
													(img) =>
														img.url !== deletedUrl
												) || []
										);
									},
								});
							}}
							className="relative w-full md:w-[28%] md:min-w-[280px] md:max-w-[420px] md:h-[144px] lg:h-[160px] md:shrink-0 md:self-start rounded-md overflow-hidden group"
							title={highlightGallery[0].alt || repo.name}
							style={{ aspectRatio: `${1899 / 1165}` }}
						>
							<Image
								src={highlightGallery[0].url}
								alt={highlightGallery[0].alt || repo.name}
								fill
								className="object-cover"
							/>
							<div className="absolute inset-0 pointer-events-none bg-background/20 dark:bg-background/25 mix-blend-multiply" />
							{highlightGallery.length > 1 && (
								<div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 text-[11px] font-medium rounded-full bg-background/70 backdrop-blur-md border border-white/10 text-foreground/80">
									+{highlightGallery.length - 1}
								</div>
							)}
						</button>
					);
				})()}

				{/* Content column */}
				<div className="flex-1 min-w-0 space-y-2">
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
							{/* Kind info */}
							{repo.kind && (
								<div className="text-xs text-muted-foreground/80">
									<span>{repo.kind}</span>
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
											disabled={
												!repo.generated_description
											}
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

					{/* Language info - only show when not showing AI description */}
					{!showGeneratedDescription && repo.language && (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-4">
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
											disabled={
												!repo.generated_description
											}
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

				{/* Drag-and-drop overlay (visible only while dragging files) */}
				{canEdit && (isDragActive || isUploading) && (
					<div
						className={[
							"absolute inset-0 z-20 flex items-center justify-center",
							"rounded-md",
							"bg-neutral-200/70 dark:bg-neutral-700/60 backdrop-blur-sm",
							"border-2 border-dashed",
							isDragReject
								? "border-red-500 text-red-500"
								: "border-neutral-400 dark:border-neutral-500 text-foreground/80",
						].join(" ")}
						onClick={(e) => e.stopPropagation()}
					>
						<span className="text-sm font-medium">
							{isUploading
								? "Uploading..."
								: isDragReject
								? "Only images supported"
								: isDragAccept
								? "Drop to add image to gallery"
								: "Drop image to add to gallery"}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
