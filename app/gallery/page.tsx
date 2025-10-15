"use client";

import { useEffect, useState } from "react";
import GalleryImageCard from "@/components/GalleryImageCard";
import type { GitHubRepo, GalleryImage } from "@/lib/types";

interface GalleryCardData {
	image: GalleryImage;
	repoName: string;
	repoId: string;
	kind?: string;
	description?: string;
	language?: string;
	totalImages: number;
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
				const repos: GitHubRepo[] = data.repos || [];

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
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">
						Gallery
					</h1>
					<p className="text-muted-foreground mt-2">
						Explore repositories with visual previews
					</p>
				</div>

				{/* Grid of images */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
						/>
					))}
				</div>
			</div>
		</div>
	);
}
