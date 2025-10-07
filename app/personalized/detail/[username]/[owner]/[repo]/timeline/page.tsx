"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RepoCard from "@/components/RepoCard";
import { useGalleryModal } from "@/components/GalleryModalProvider";
import { History, Check, Pin } from "lucide-react";
import type { GitHubRepo, GalleryImage } from "@/lib/types";
import EditableText from "@/components/EditableText";
import {
	groupGalleryByDate,
	persistImageHighlight,
	persistImageMetadata,
} from "@/lib/repoGallery";
import { useAuth } from "@/hooks/useAuth";
import {
	timelineItemTitleClass,
	repoMetaMutedClass,
	timelineItemDescClass,
} from "@/components/RepoStyles";
import CursorGradient from "@/components/CursorGradient";

interface PageProps {
	params: Promise<{
		username: string;
		owner: string;
		repo: string;
	}>;
}

export default function RepoTimelinePage({ params }: PageProps) {
	const { username, owner, repo: repoName } = use(params);
	const [repo, setRepo] = useState<GitHubRepo | null>(null);
	const [gallery, setGallery] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [pendingEdits, setPendingEdits] = useState<Set<string>>(new Set());
	const { openGallery } = useGalleryModal();
	const { login } = useAuth();

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				// Load backend user data and select repo by id owner/repo
				const resp = await fetch(
					`/api/backend/users/${encodeURIComponent(username)}/data`
				);
				if (!resp.ok) throw new Error("Failed to load backend data");
				const backendData = await resp.json();
				const foundRepo = (backendData.repos || []).find(
					(r: GitHubRepo) =>
						typeof r.id === "string" &&
						r.id.toLowerCase() ===
							`${owner}/${repoName}`.toLowerCase()
				);
				if (!foundRepo) {
					if (!cancelled) {
						setRepo(null);
						setGallery([]);
						setLoading(false);
					}
					return;
				}

				// Fetch gallery from backend ({ gallery }) using explicit owner
				const galRes = await fetch(
					`/api/backend/users/${encodeURIComponent(
						username
					)}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
						repoName
					)}/gallery`,
					{ cache: "no-store" }
				);
				let gal: GalleryImage[] = [];
				if (galRes.ok) {
					const json = (await galRes.json()) as {
						gallery?: GalleryImage[];
					};
					gal = Array.isArray(json.gallery) ? json.gallery : [];
				}

				if (!cancelled) {
					setRepo({ ...(foundRepo as GitHubRepo), gallery: gal });
					setGallery(gal);
					setLoading(false);
				}
			} catch (e) {
				console.error(e);
				if (!cancelled) {
					setLoading(false);
				}
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [username, owner, repoName]);

	const grouped = useMemo(() => groupGalleryByDate(gallery), [gallery]);

	const isOwner = Boolean(
		login && login.toLowerCase() === username.toLowerCase()
	);

	const handleSaveTitle = async (img: GalleryImage, newTitle: string) => {
		if (!repo) return;
		const editKey = `${img.url}-title`;
		setPendingEdits((prev) => new Set(prev).add(editKey));

		// Optimistic update
		setGallery((prev) =>
			prev.map((g) => (g.url === img.url ? { ...g, title: newTitle } : g))
		);
		setRepo((r) =>
			r
				? {
						...r,
						gallery: (r.gallery || []).map((g) =>
							g.url === img.url ? { ...g, title: newTitle } : g
						),
				  }
				: r
		);

		try {
			await persistImageMetadata({
				username,
				owner,
				repoName: repo.name,
				url: img.url,
				title: newTitle,
			});
		} catch {
			// Revert on error
			setGallery((prev) =>
				prev.map((g) =>
					g.url === img.url ? { ...g, title: img.title } : g
				)
			);
			setRepo((r) =>
				r
					? {
							...r,
							gallery: (r.gallery || []).map((g) =>
								g.url === img.url
									? { ...g, title: img.title }
									: g
							),
					  }
					: r
			);
		} finally {
			setPendingEdits((prev) => {
				const next = new Set(prev);
				next.delete(editKey);
				return next;
			});
		}
	};

	const handleSaveCaption = async (img: GalleryImage, newCaption: string) => {
		if (!repo) return;
		const editKey = `${img.url}-caption`;
		setPendingEdits((prev) => new Set(prev).add(editKey));

		// Optimistic update
		setGallery((prev) =>
			prev.map((g) =>
				g.url === img.url ? { ...g, caption: newCaption } : g
			)
		);
		setRepo((r) =>
			r
				? {
						...r,
						gallery: (r.gallery || []).map((g) =>
							g.url === img.url
								? { ...g, caption: newCaption }
								: g
						),
				  }
				: r
		);

		try {
			await persistImageMetadata({
				username,
				owner,
				repoName: repo.name,
				url: img.url,
				caption: newCaption,
			});
		} catch {
			// Revert on error
			setGallery((prev) =>
				prev.map((g) =>
					g.url === img.url ? { ...g, caption: img.caption } : g
				)
			);
			setRepo((r) =>
				r
					? {
							...r,
							gallery: (r.gallery || []).map((g) =>
								g.url === img.url
									? { ...g, caption: img.caption }
									: g
							),
					  }
					: r
			);
		} finally {
			setPendingEdits((prev) => {
				const next = new Set(prev);
				next.delete(editKey);
				return next;
			});
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen relative flex items-center justify-center">
				<CursorGradient />
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	if (!repo) {
		return (
			<div className="min-h-screen relative flex items-center justify-center">
				<CursorGradient />
				<div className="text-sm text-muted-foreground">
					Repository not found
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			<div className="max-w-3xl mx-auto px-6 py-10">
				{/* Timeline label (styled like tabs) at the top */}
				<div className="mb-2">
					<div role="tablist" className="flex justify-start gap-4">
						<div className="relative inline-flex items-center gap-2 text-xs md:text-xs px-1 py-2 text-foreground/60">
							<History size={14} className="md:hidden" />
							<History size={16} className="hidden md:inline" />
							<span>Timeline</span>
						</div>
					</div>
				</div>

				{/* Header Repo Card */}
				<div className="relative z-10">
					<RepoCard
						repo={repo}
						owner={owner}
						pageUsername={username}
						showOwner={false}
						hideHeroImage={true}
					/>
				</div>

				{/* Timeline */}
				<div className="mt-8">
					{grouped.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							No images yet.{" "}
							<Link
								href={`/personalized/detail/${username}/${owner}/${repoName}`}
								className="underline hover:text-foreground"
							>
								Back
							</Link>
						</div>
					) : (
						<>
							{grouped.map(({ dateKey, items }) => (
								<div key={dateKey} className="mb-6">
									<div
										className={`text-xs ${repoMetaMutedClass} mt-6 mb-2`}
									>
										{dateKey}
									</div>
									<div className="space-y-4">
										{items.map((img, idx) => (
											<div
												key={`${img.url}-${idx}`}
												className="md:flex md:items-start md:gap-4 rounded-md py-2"
											>
												{/* Left: small thumbnail with overlay, consistent with RepoCard */}
												<div
													className="relative w-full md:w-[28%] md:min-w-[280px] md:max-w-[420px] md:h-[144px] lg:h-[160px] md:shrink-0 md:self-start rounded-md overflow-hidden"
													style={{
														aspectRatio: `${
															1899 / 1165
														}`,
													}}
													onClick={() => {
														if (!repo) return;
														openGallery([img], 0, {
															username,
															owner,
															repoName: repo.name,
															repoLink: repo.link,
															canEdit: false,
															showAllImages: true,
														});
													}}
												>
													<Image
														src={img.url}
														alt={
															img.alt || repo.name
														}
														fill
														className="object-cover"
													/>
													<div className="absolute inset-0 pointer-events-none bg-background/20 dark:bg-background/25 mix-blend-multiply" />

													{/* Pin overlay (top-right) */}
													{(login &&
														login.toLowerCase() ===
															username.toLowerCase()) ||
													img.is_highlight ? (
														<button
															onClick={(e) => {
																e.stopPropagation();
																if (!repo)
																	return;
																const next =
																	!img.is_highlight;
																// Optimistic update
																setGallery(
																	(prev) =>
																		prev.map(
																			(
																				g
																			) =>
																				g.url ===
																				img.url
																					? {
																							...g,
																							is_highlight:
																								next,
																					  }
																					: g
																		)
																);
																// Also keep repo.gallery in sync for header
																setRepo((r) =>
																	r
																		? {
																				...r,
																				gallery:
																					(
																						r.gallery ||
																						[]
																					).map(
																						(
																							g
																						) =>
																							g.url ===
																							img.url
																								? {
																										...g,
																										is_highlight:
																											next,
																								  }
																								: g
																					),
																		  }
																		: r
																);
																persistImageHighlight(
																	{
																		username,
																		owner,
																		repoName:
																			repo.name,
																		url: img.url,
																		isHighlight:
																			next,
																	}
																)
																	.then(
																		() => {
																			console.debug(
																				"[pin] persist success",
																				{
																					url: img.url,
																					is_highlight:
																						next,
																				}
																			);
																		}
																	)
																	.catch(
																		(
																			err
																		) => {
																			console.error(
																				"[pin] persist failed",
																				err
																			);
																			// Revert on failure
																			setGallery(
																				(
																					prev
																				) =>
																					prev.map(
																						(
																							g
																						) =>
																							g.url ===
																							img.url
																								? {
																										...g,
																										is_highlight:
																											!next,
																								  }
																								: g
																					)
																			);
																			setRepo(
																				(
																					r
																				) =>
																					r
																						? {
																								...r,
																								gallery:
																									(
																										r.gallery ||
																										[]
																									).map(
																										(
																											g
																										) =>
																											g.url ===
																											img.url
																												? {
																														...g,
																														is_highlight:
																															!next,
																												  }
																												: g
																									),
																						  }
																						: r
																			);
																		}
																	);
															}}
															className={`absolute top-2 right-2 z-10 p-1 rounded-full border ${
																img.is_highlight
																	? "bg-background/70 backdrop-blur-md border-white/10 text-white cursor-pointer"
																	: login &&
																	  login.toLowerCase() ===
																			username.toLowerCase()
																	? "bg-background/70 backdrop-blur-md border-white/10 text-muted-foreground/40 cursor-pointer"
																	: "bg-transparent border-transparent text-transparent cursor-default"
															}`}
															title={
																img.is_highlight
																	? "Unpin"
																	: "Pin"
															}
															aria-pressed={
																!!img.is_highlight
															}
															aria-label={
																img.is_highlight
																	? "Unpin image"
																	: "Pin image"
															}
														>
															<Pin size={16} />
														</button>
													) : null}
												</div>
												{/* Right: title + caption, reserved spacing */}
												<div className="flex-1 min-w-0 space-y-2 mt-2 md:mt-0">
													<EditableText
														value={img.title || ""}
														placeholder="what is this?"
														className={
															timelineItemTitleClass
														}
														onSave={(newTitle) =>
															handleSaveTitle(
																img,
																newTitle
															)
														}
														canEdit={isOwner}
														showPlaceholder={
															isOwner &&
															!img.title
														}
													/>
													<EditableText
														value={
															img.caption || ""
														}
														placeholder="What improvement did it bring? How did you do it?"
														className={
															timelineItemDescClass
														}
														onSave={(newCaption) =>
															handleSaveCaption(
																img,
																newCaption
															)
														}
														canEdit={isOwner}
														showPlaceholder={
															isOwner &&
															!img.caption
														}
													/>
													{/* Save indicator */}
													{(pendingEdits.has(
														`${img.url}-title`
													) ||
														pendingEdits.has(
															`${img.url}-caption`
														)) && (
														<div className="flex justify-end mt-1">
															<Check
																size={14}
																className="text-muted-foreground/60"
															/>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
