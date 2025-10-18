"use client";

import { SocialIcon } from "@/components/ui/OrganizationIcon";
import { Ghost, RotateCw } from "lucide-react";
import type { Builder } from "@/lib/types";
import EmphasisBelts from "@/components/EmphasisBelts";

interface ProfileHeaderProps {
	data: Builder;
	visibleSections: Set<string>;
}

export default function ProfileHeader({
	data,
	visibleSections,
}: ProfileHeaderProps) {
	// Collect all keywords from repos
	const allKeywords = (data?.repos ?? [])
		.flatMap((r) => r.keywords || [])
		.filter(Boolean);

	// Collect all emphasis from repos
	const allEmphasis = (data?.repos ?? [])
		.flatMap((r) => r.emphasis || [])
		.filter(Boolean);

	if (typeof window !== "undefined") {
		console.log("[Header] allKeywords", {
			count: allKeywords.length,
			sample: allKeywords.slice(0, 10),
		});
	}

	// Handle restart button click
	const handleRestart = async () => {
		try {
			const response = await fetch(
				`/api/backend/users/${data.username}/restart`,
				{
					method: "POST",
				}
			);
			if (!response.ok) {
				console.error("Restart failed:", response.status);
			}
		} catch (error) {
			console.error("Restart error:", error);
		}
	};
	return (
		<header
			data-section="header"
			className={`
				transition-all duration-700 ease-out
				${
					visibleSections.has("header")
						? "opacity-100 blur-0 scale-100"
						: "opacity-0 blur-sm scale-95"
				}
			`}
		>
			<div className="flex-1 min-w-0 space-y-2">
				<div className="flex justify-between items-center">
					<div className="flex gap-4 items-center">
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-semibold text-foreground">
								{data.username}
							</h1>
							{data.profile?.is_ghost && (
								<Ghost size={18} className="text-foreground" />
							)}
						</div>

						{/* Social Links */}
						<div className="flex gap-4 items-center">
							{/* GitHub */}
							<a
								href={`https://github.com/${data.username}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="GitHub"
							>
								<SocialIcon
									platformName="github"
									size={20}
									color="currentColor"
								/>
							</a>
						</div>
					</div>

					{/* Restart Button - only visible when enabled via env var */}
					{process.env.NEXT_PUBLIC_ENABLE_RESTART === "true" && (
						<button
							onClick={handleRestart}
							className="text-muted-foreground hover:text-foreground transition-colors"
							title="Restart"
						>
							<RotateCw size={14} />
						</button>
					)}
				</div>
				{/* Inferred Theme - always at the top when available */}
				{data?.theme && (
					<div className="border border-muted-foreground/20 rounded-lg p-4 bg-gray-500/10 mb-6 mt-6">
						<h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">
							Inferred Interest
						</h3>
						<p className="text-sm font-medium text-muted-foreground">
							{data.theme}
						</p>
					</div>
				)}

				{/* Keywords and Emphasis Belts */}
				{(allKeywords.length > 0 || allEmphasis.length > 0) && (
					<div className="mt-10 space-y-5 md:space-y-5">
						{/* {allKeywords.length > 0 && (
							<KeywordsBelts
								keywords={allKeywords}
								startDirection="left"
							/>
						)} */}
						{allEmphasis.length > 0 && (
							<EmphasisBelts
								emphasis={allEmphasis}
								startDirection={
									// Opposite of the last keywords belt
									// If keywords start left and alternate, last belt index = belts-1
									// Opposite = right when last keywords belt would be ...
									// Simplify: flip based on number of belts derived from count
									(Math.ceil(allKeywords.length / 20) - 1) %
										2 ===
									0
										? "right"
										: "left"
								}
							/>
						)}
					</div>
				)}
			</div>
		</header>
	);
}
