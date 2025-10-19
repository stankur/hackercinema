"use client";

import { useEffect, useState } from "react";
import GalleryImageCard from "@/components/GalleryImageCard";
import type { GitHubRepo, GalleryImage } from "@/lib/types";
import { Pixelify_Sans } from "next/font/google";
import { Film } from "lucide-react";
import { SimpleIcon } from "@/components/ui/SimpleIcon";
import { signIn } from "next-auth/react";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

interface GalleryCardData {
	image: GalleryImage;
	repoName: string;
	repoId: string;
	kind?: string;
	description?: string;
	language?: string;
	totalImages: number;
	allImages: GalleryImage[];
	username: string;
}

export default function GalleryPage() {
	const [cards, setCards] = useState<GalleryCardData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchGallery() {
			try {
				const response = await fetch("/api/backend/gallery");
				if (!response.ok) {
					throw new Error("Failed to fetch gallery");
				}

				const data = await response.json();
				// Backend returns repos with username field
				const repos: Array<GitHubRepo & { username: string }> =
					data.repos || [];

				// One card per repo (not flattened)
				const galleryCards: GalleryCardData[] = repos
					.filter(
						(repo) =>
							repo.gallery &&
							Array.isArray(repo.gallery) &&
							repo.gallery.length > 0
					)
					.map((repo) => ({
						image: repo.gallery![0], // Show first image
						repoName: repo.name,
						repoId: repo.id,
						kind: repo.kind,
						description: repo.description || undefined,
						language: repo.language || undefined,
						totalImages: repo.gallery!.length,
						allImages: repo.gallery!,
						username: repo.username,
					}));

				setCards(galleryCards);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		}

		fetchGallery();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading gallery...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-500">Error: {error}</p>
			</div>
		);
	}

	if (cards.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">No images found</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen py-8 px-4 md:px-8 lg:px-12">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex items-start justify-between gap-4">
					<div>
						<h1
							className={`${pixelFont.className} text-4xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2 mb-4`}
						>
							<Film size={24} />
							<span>Gallery</span>
						</h1>
						<p className="text-lg md:text-base text-muted-foreground">
							Welcome to the cinema of our projects. Enjoy the
							show.
						</p>
					</div>
					<button
						onClick={() =>
							signIn("github", { callbackUrl: "/auth/callback" })
						}
						className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
					>
						<SimpleIcon name="github" size={16} />
						Join
					</button>
				</div>

				{/* Grid of images */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
					{cards.map((card) => (
						<GalleryImageCard
							key={card.repoId}
							image={card.image}
							repoName={card.repoName}
							repoId={card.repoId}
							kind={card.kind}
							description={card.description}
							language={card.language}
							totalImages={card.totalImages}
							allImages={card.allImages}
							username={card.username}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
