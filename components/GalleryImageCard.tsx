"use client";

import { useState, useEffect } from "react";
import SmartImage from "./SmartImage";
import { getLanguageDotColor } from "@/lib/language-colors";
import type { GalleryImage } from "@/lib/types";

interface GalleryImageCardProps {
	image: GalleryImage;
	repoName: string;
	repoId: string;
	kind?: string;
	description?: string;
	language?: string;
	totalImages: number;
}

export default function GalleryImageCard({
	image,
	repoName,
	repoId,
	kind,
	description,
	language,
	totalImages,
}: GalleryImageCardProps) {
	const [languageDotColor, setLanguageDotColor] = useState<string>("");

	useEffect(() => {
		const loadColor = async () => {
			if (language) {
				const color = await getLanguageDotColor(language);
				setLanguageDotColor(color);
			}
		};
		loadColor();
	}, [language]);

	return (
		<div className="group cursor-pointer">
			{/* Image - main focus */}
			<div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
				<SmartImage
					src={image.url}
					alt={image.alt || repoName}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				{/* +n chip overlay */}
				{totalImages > 1 && (
					<div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 text-[11px] font-medium rounded-full bg-background/70 backdrop-blur-md border border-white/10 text-foreground/80">
						+{totalImages - 1}
					</div>
				)}
			</div>

			{/* Metadata below image */}
			<div className="mt-3 space-y-1">
				{/* Repo name */}
				<a
					href={`https://github.com/${repoId}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
				>
					{repoName}
				</a>

				{/* Kind - short blurb */}
				{kind && (
					<p className="text-xs text-muted-foreground/80 line-clamp-1">
						{kind}
					</p>
				)}

				{/* Description */}
				{description && (
					<p className="text-xs text-muted-foreground/60 line-clamp-2">
						{description}
					</p>
				)}

				{/* Language badge */}
				{language && (
					<div className="flex items-center gap-1.5 pt-1">
						<div
							className="w-2 h-2 rounded-full"
							style={{
								backgroundColor: languageDotColor || "#6b7280",
							}}
						/>
						<span className="text-xs text-muted-foreground/60">
							{language}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
