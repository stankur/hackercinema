"use client";

import Image from "next/image";
import { SocialIcon } from "@/components/ui/OrganizationIcon";
import { Mail, Globe } from "lucide-react";
import type { Builder } from "@/lib/types";
import KeywordsBelts from "@/components/KeywordsBelts";
import EmphasisBelts from "@/components/EmphasisBelts";

interface ProfileData {
	profile?: {
		name?: string;
		headline?: string;
		links?: {
			email?: string;
			linkedin?: string;
			x?: string;
			yc?: string;
			personal?: string;
		};
	};
}

interface ProfileHeaderProps {
	data: Builder;
	profileData: ProfileData | null;
	visibleSections: Set<string>;
}

export default function ProfileHeader({
	data,
	profileData,
	visibleSections,
}: ProfileHeaderProps) {
	// Collect all keywords from repos
	const allKeywords = (data?.repos || [])
		.flatMap((r) => r.keywords || [])
		.filter(Boolean);

	// Collect all emphasis from repos
	const allEmphasis = (data?.repos || [])
		.flatMap((r) => r.emphasis || [])
		.filter(Boolean);

	if (typeof window !== "undefined") {
		console.log("[Header] allKeywords", {
			count: allKeywords.length,
			sample: allKeywords.slice(0, 10),
		});
	}
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
				<div className="flex gap-4 items-center">
					<h1 className="text-2xl font-semibold text-foreground">
						{data.username}
					</h1>

					{/* {profileData?.profile?.headline && (
					<p className="text-sm font-light mt-1">
						{profileData.profile.headline}
					</p>
				)} */}

					{/* Social Links */}
					<div className="flex gap-4 items-center">
						{/* GitHub - default from data.json */}
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

						{/* Additional links from profiles.json */}
						{profileData?.profile?.links?.email && (
							<a
								href={`mailto:${profileData.profile.links.email}`}
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="Email"
							>
								<Mail className="w-5 h-5" strokeWidth={1} />
							</a>
						)}

						{profileData?.profile?.links?.linkedin && (
							<a
								href={profileData.profile.links.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="LinkedIn"
							>
								<SocialIcon
									platformName="linkedin"
									size={20}
									color="currentColor"
								/>
							</a>
						)}

						{profileData?.profile?.links?.x && (
							<a
								href={profileData.profile.links.x}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="X (Twitter)"
							>
								<SocialIcon
									platformName="x"
									size={20}
									color="currentColor"
								/>
							</a>
						)}

						{profileData?.profile?.links?.yc && (
							<a
								href={profileData.profile.links.yc}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="Y Combinator"
							>
								<SocialIcon
									platformName="yc"
									size={20}
									color="currentColor"
								/>
							</a>
						)}

						{profileData?.profile?.links?.personal && (
							<a
								href={profileData.profile.links.personal}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:opacity-80 transition-opacity"
								title="Personal Website"
							>
								<Globe className="w-5 h-5" strokeWidth={1} />
							</a>
						)}
					</div>
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
					<div className="mt-10 space-y-10 md:space-y-10">
						{allKeywords.length > 0 && (
							<KeywordsBelts
								keywords={allKeywords}
								startDirection="left"
							/>
						)}
						{allEmphasis.length > 0 && (
							<EmphasisBelts
								emphasis={allEmphasis}
								startDirection={
									// Opposite of the last keywords belt
									// If keywords start left and alternate, last belt index = belts-1
									// Opposite = right when last keywords belt would be ...
									// Simplify: flip based on number of belts derived from count
									(Math.ceil(allKeywords.length / 8) - 1) %
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
