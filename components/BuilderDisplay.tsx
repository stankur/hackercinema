"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Github, MessageSquare } from "lucide-react";
import RepoCard from "./RepoCard";
import SimilarReposSection from "./SimilarReposSection";
import type { Builder } from "@/lib/types";

interface BuilderDisplayProps {
	builder: Builder;
	showOwner?: boolean;
	className?: string;
	autoExpand?: boolean;
}

export default function BuilderDisplay({
	builder,
	showOwner = false,
	className = "py-8",
	autoExpand = false,
}: BuilderDisplayProps) {
	const [isExpanded, setIsExpanded] = useState(!!autoExpand);
	const [activeTab, setActiveTab] = useState<
		"profile" | "repos" | "similar" | null
	>(
		"repos" // Default to Highlights tab when expanded
	);
	const [isFlashing, setIsFlashing] = useState(false);

	const handleCardClick = () => {
		// Trigger flash effect
		setIsFlashing(true);
		setTimeout(() => setIsFlashing(false), 200);

		setIsExpanded(!isExpanded);
		if (!isExpanded) {
			setActiveTab("repos"); // Set to Highlights tab when expanding
		}
	};

	const handleTabClick = (tab: "profile" | "repos" | "similar") => {
		if (activeTab === tab) {
			setActiveTab(null);
			setIsExpanded(false); // Collapse when deselecting the active tab
		} else {
			setActiveTab(tab);
		}
	};

	return (
		<div
			className={`${className} transition-all px-4 duration-700 ease-out cursor-pointer ${
				isExpanded
					? "opacity-100 blur-0 scale-100"
					: "opacity-100 blur-0 scale-100"
			} ${isFlashing ? "bg-muted/40" : ""}`}
			style={{
				transition: isFlashing
					? "background-color 0.2s ease-out"
					: "background-color 0.3s ease-out, opacity 0.7s ease-out, filter 0.7s ease-out, transform 0.7s ease-out",
			}}
			onClick={handleCardClick}
		>
			{/* Header with avatar, name, theme */}
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
							onClick={(e) => e.stopPropagation()}
						>
							{builder.username}
						</Link>
					</div>
					<div className="text-sm font-light">{builder.theme}</div>
				</div>
			</div>

			{/* Collapsed state - show + button */}
			{!isExpanded && (
				<div className="flex justify-end">
					<button
						className="text-lg text-muted-foreground hover:text-foreground transition-colors"
						onClick={(e) => {
							e.stopPropagation();
							// Trigger flash effect
							setIsFlashing(true);
							setTimeout(() => setIsFlashing(false), 200);
							setIsExpanded(true);
						}}
					>
						+
					</button>
				</div>
			)}

			{/* Expanded state - show tabs and content */}
			{isExpanded && (
				<>
					{/* Tabs - full width below the header */}
					<div
						className="flex gap-10 mb-12"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleTabClick("profile");
							}}
							className={`text-xs transition-colors ${
								activeTab === "profile"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Profile
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleTabClick("repos");
							}}
							className={`text-xs transition-colors ${
								activeTab === "repos"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Highlights
						</button>
						{builder.similar_repos &&
							builder.similar_repos.length > 0 && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleTabClick("similar");
									}}
									className={`text-xs transition-colors ${
										activeTab === "similar"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Similar
								</button>
							)}
					</div>

					{/* Tab content - full width */}
					{activeTab === "profile" && (
						<div
							className="space-y-4"
							onClick={(e) => e.stopPropagation()}
						>
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
												builder.profile.blog.startsWith(
													"http"
												)
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
						<div
							className="space-y-6"
							onClick={(e) => e.stopPropagation()}
						>
							{builder.repos.length > 0 ? (
								builder.repos.map((repo) => (
									<RepoCard
										key={repo.name}
										repo={repo}
										owner={builder.username}
										showOwner={showOwner}
										showUsernameInsteadOfDate={false}
									/>
								))
							) : (
								<div className="text-sm text-muted-foreground">
									No repositories found.
								</div>
							)}
						</div>
					)}

					{activeTab === "similar" && builder.similar_repos && (
						<div onClick={(e) => e.stopPropagation()}>
							<SimilarReposSection
								similarRepos={builder.similar_repos}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
