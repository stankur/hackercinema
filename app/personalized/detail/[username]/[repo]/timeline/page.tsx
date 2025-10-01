"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RepoCard from "@/components/RepoCard";
import { useGalleryModal } from "@/components/GalleryModalProvider";
import { History } from "lucide-react";
import type { Builder, GitHubRepo, GalleryImage } from "@/lib/types";
import { groupGalleryByDate, resolveRepoOwner } from "@/lib/repoGallery";
import {
	timelineItemDescClass,
	timelineItemTitleClass,
	repoMetaMutedClass,
} from "@/components/RepoStyles";

interface PageProps {
	params: Promise<{
		username: string;
		repo: string;
	}>;
}

export default function RepoTimelinePage({ params }: PageProps) {
	const { username, repo: repoName } = use(params);
	const [repo, setRepo] = useState<GitHubRepo | null>(null);
	const [gallery, setGallery] = useState<GalleryImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { openGallery } = useGalleryModal();

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				// 1) Load base repo from builders dataset
				const buildersRes = await fetch("/api/data.json");
				if (!buildersRes.ok) throw new Error("Failed to load data");
				const builders = (await buildersRes.json()) as Builder[];
				const user = builders.find(
					(b) => b.username.toLowerCase() === username.toLowerCase()
				);
				const foundRepo =
					user?.repos.find((r) => r.name === repoName) || null;
				if (!foundRepo) {
					if (!cancelled) {
						setRepo(null);
						setGallery([]);
						setLoading(false);
					}
					return;
				}

				// 2) Resolve owner for backend API path
				const repoOwner = resolveRepoOwner(foundRepo.link, username);

				// 3) Fetch gallery from backend ({ gallery })
				const galRes = await fetch(
					`/api/backend/users/${encodeURIComponent(
						username
					)}/repos/${encodeURIComponent(
						repoOwner
					)}/${encodeURIComponent(repoName)}/gallery`,
					{ cache: "no-store" }
				);
				let gal: GalleryImage[] = [];
				if (galRes.ok) {
					const json = (await galRes.json()) as {
						gallery?: GalleryImage[];
					};
					gal = Array.isArray(json.gallery) ? json.gallery : [];
				} else {
					// Fallback to embedded gallery if backend is unavailable
					gal = Array.isArray(foundRepo.gallery)
						? foundRepo.gallery
						: [];
				}

				if (!cancelled) {
					setRepo({ ...foundRepo, gallery: gal });
					setGallery(gal);
					setLoading(false);
				}
			} catch (e) {
				console.error(e);
				if (!cancelled) {
					setError("Failed to load timeline");
					setLoading(false);
				}
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [username, repoName]);

	const grouped = useMemo(() => groupGalleryByDate(gallery), [gallery]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	if (!repo) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">
					Repository not found
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
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
						owner={username}
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
								href={`/personalized/detail/${username}/${repoName}`}
								className="underline hover:text-foreground"
							>
								Back
							</Link>
						</div>
					) : (
						grouped.map(({ dateKey, items }) => (
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
													const owner =
														resolveRepoOwner(
															repo.link,
															username
														);
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
													alt={img.alt || repo.name}
													fill
													className="object-cover"
												/>
												<div className="absolute inset-0 pointer-events-none bg-background/20 dark:bg-background/25 mix-blend-multiply" />
											</div>
											{/* Right: title + caption, reserved spacing */}
											<div className="flex-1 min-w-0 space-y-2 mt-2 md:mt-0">
												<div
													className={
														timelineItemTitleClass
													}
												>
													{img.title || ""}
												</div>
												<div
													className={
														timelineItemDescClass
													}
												>
													{img.caption || ""}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
