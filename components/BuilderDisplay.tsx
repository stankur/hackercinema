"use client";

import { useState, useEffect } from "react";
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
	const [activeTab, setActiveTab] = useState<
		"profile" | "repos" | "similar" | null
	>(null);

	const handleTabClick = (tab: "profile" | "repos" | "similar") => {
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
				{builder.similar_interest &&
					builder.similar_interest.length > 0 && (
						<button
							onClick={() => handleTabClick("similar")}
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

			{activeTab === "similar" && builder.similar_interest && (
				<SimilarInterestsSection
					similarUsernames={builder.similar_interest}
				/>
			)}
		</div>
	);
}

// Similar Interests Section Component
interface SimilarInterestsSectionProps {
	similarUsernames: string[];
}

function SimilarInterestsSection({
	similarUsernames,
}: SimilarInterestsSectionProps) {
	const [userData, setUserData] = useState<Record<string, { repos: any[] }>>(
		{}
	);
	const [showAllRepos, setShowAllRepos] = useState(false);

	// Fetch user data when component mounts
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch("/api/data.json");
				const data = await response.json();

				const userDataMap: Record<string, { repos: any[] }> = {};
				data.forEach((user: any) => {
					if (similarUsernames.includes(user.username)) {
						userDataMap[user.username] = {
							repos: user.repos || [],
						};
					}
				});

				setUserData(userDataMap);
			} catch (error) {
				console.error("Failed to fetch user data:", error);
			}
		};

		fetchUserData();
	}, [similarUsernames]);

	// Collect all repos from all similar users
	const allRepos: Array<{ repo: any; owner: string }> = [];
	similarUsernames.forEach((username) => {
		const userInfo = userData[username];
		if (userInfo && userInfo.repos.length > 0) {
			userInfo.repos.forEach((repo) => {
				allRepos.push({ repo, owner: username });
			});
		}
	});

	const displayedRepos = showAllRepos ? allRepos : allRepos.slice(0, 5);

	return (
		<div className="space-y-4">
			{displayedRepos.length > 0 ? (
				<>
					{displayedRepos.map(({ repo, owner }) => (
						<RepoCard
							key={`${owner}-${repo.name}`}
							repo={repo}
							owner={owner}
							showOwner={false}
							showUsernameInsteadOfDate={true}
						/>
					))}

					{allRepos.length > 5 && (
						<div className="text-center pt-4">
							<button
								onClick={() => setShowAllRepos(!showAllRepos)}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
							>
								{showAllRepos ? "show less" : "show more"}
							</button>
						</div>
					)}
				</>
			) : (
				<div className="text-sm text-muted-foreground">
					No repositories found for similar users.
				</div>
			)}
		</div>
	);
}
