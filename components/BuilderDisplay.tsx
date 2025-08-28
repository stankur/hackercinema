"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Github, MessageSquare } from "lucide-react";
import RepoCard from "./RepoCard";
import type { Builder } from "@/lib/types";

interface BuilderDisplayProps {
	builder: Builder;
	showOwner?: boolean;
	className?: string;
}

export default function BuilderDisplay({
	builder,
	showOwner = false,
	className = "py-8",
}: BuilderDisplayProps) {
	const [activeTab, setActiveTab] = useState<"profile" | "repos" | null>(
		null
	);

	const handleTabClick = (tab: "profile" | "repos") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<div className={className}>
			{/* Header with avatar, name, theme - flexbox only for this section */}
			<div className="flex items-start gap-4 mb-8">
				<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
					{builder.profile?.avatar_url ? (
						<Image
							src={builder.profile.avatar_url}
							alt={`${builder.username}'s avatar`}
							width={48}
							height={48}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="text-xl font-semibold text-foreground mb-2">
						<Link
							href={`/profile/${builder.username}`}
							className="hover:text-primary transition-colors"
						>
							{builder.username}
						</Link>
					</div>
					<div className="text-sm font-light">{builder.theme}</div>
				</div>
			</div>

			{/* Tabs - full width below the header */}
			<div className="flex gap-10 mb-6">
				<button
					onClick={() => handleTabClick("profile")}
					className={`text-xs transition-colors ${
						activeTab === "profile"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Profile
				</button>
				<button
					onClick={() => handleTabClick("repos")}
					className={`text-xs transition-colors ${
						activeTab === "repos"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Highlights
				</button>
			</div>

			{/* Tab content - full width */}
			{activeTab === "profile" && (
				<div className="space-y-4">
					<div className="space-y-4">
						{builder.profile.bio && (
							<div className="flex items-baseline gap-4">
								<MessageSquare className="w-4 h-4 pt-1 text-muted-foreground mt-0.5 flex-shrink-0" />
								<div className="text-base text-foreground leading-relaxed">
									{builder.profile.bio}
								</div>
							</div>
						)}
						{builder.profile.location && (
							<div className="flex items-center gap-4">
								<MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
								<div className="text-base text-muted-foreground">
									{builder.profile.location}
								</div>
							</div>
						)}
						{builder.profile.blog && (
							<div className="flex items-center gap-4">
								<Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
								<a
									href={
										builder.profile.blog.startsWith("http")
											? builder.profile.blog
											: `https://${builder.profile.blog}`
									}
									target="_blank"
									rel="noopener noreferrer"
									className="text-base text-primary hover:underline"
								>
									{builder.profile.blog}
								</a>
							</div>
						)}
						<div className="flex items-center gap-4">
							<Github className="w-4 h-4 text-muted-foreground flex-shrink-0" />
							<a
								href={`https://github.com/${builder.username}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-base text-primary hover:underline"
							>
								GitHub Profile
							</a>
						</div>
					</div>
				</div>
			)}

			{activeTab === "repos" && (
				<div className="space-y-6">
					{builder.repos.length > 0 ? (
						<div className="space-y-4">
							{builder.repos.map((repo) => (
								<RepoCard
									key={repo.name}
									repo={repo}
									owner={builder.username}
									showOwner={showOwner}
								/>
							))}
						</div>
					) : (
						<div className="text-sm text-muted-foreground">
							No repositories available
						</div>
					)}
				</div>
			)}
		</div>
	);
}
