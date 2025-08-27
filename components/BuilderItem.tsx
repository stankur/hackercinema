"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Github, MessageSquare, Star } from "lucide-react";
import { getCardBackground, getLanguageDotColor } from "@/lib/language-colors";

interface GitHubProfile {
	login: string;
	avatar_url: string;
	bio?: string | null;
	location?: string | null;
	blog?: string;
}

interface GitHubRepo {
	name: string;
	description?: string | null;
	updated_at: string;
	stars?: number;
	language?: string | null;
	topics?: string[];
}

interface Builder {
	username: string;
	theme: string;
	profile: GitHubProfile;
	repos: GitHubRepo[];
}

interface BuilderItemProps {
	builder: Builder;
}

export default function BuilderItem({ builder }: BuilderItemProps) {
	const [activeTab, setActiveTab] = useState<"profile" | "repos" | null>(
		null
	);
	const [cardBackgrounds, setCardBackgrounds] = useState<
		Record<string, string>
	>({});
	const [languageDotColors, setLanguageDotColors] = useState<
		Record<string, string>
	>({});

	const handleTabClick = (tab: "profile" | "repos") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Load card backgrounds and language dot colors for all repos
	useEffect(() => {
		const loadStyles = async () => {
			const backgrounds: Record<string, string> = {};
			const dotColors: Record<string, string> = {};

			for (const repo of builder.repos) {
				// Generate card background based on repo name (not language)
				backgrounds[repo.name] = await getCardBackground(repo.name);

				// Get language dot color if language exists
				if (repo.language && !dotColors[repo.language]) {
					dotColors[repo.language] = await getLanguageDotColor(
						repo.language
					);
				}
			}

			setCardBackgrounds(backgrounds);
			setLanguageDotColors(dotColors);
		};
		loadStyles();
	}, [builder.repos]);

	return (
		<div className="py-8">
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
					<div className="text-2xl font-bold text-foreground mb-1">
						<Link
							href={`/profile/${builder.username}`}
							className="hover:text-primary transition-colors"
						>
							{builder.username}
						</Link>
					</div>
					<div className="text-base text-muted-foreground">
						{builder.theme}
					</div>
				</div>
			</div>

			{/* Tabs - full width below the header */}
			<div className="flex gap-8 mb-6">
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
								<div
									key={repo.name}
									className="border border-slate-800 rounded-md p-4 space-y-2 relative overflow-hidden"
									style={{
										background:
											cardBackgrounds[repo.name] ||
											undefined,
									}}
								>
									<div>
										<a
											href={`https://github.com/${builder.username}/${repo.name}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-base font-semibold text-foreground hover:text-primary hover:underline"
										>
											{repo.name}
										</a>
									</div>
									{repo.description && (
										<div className="text-sm text-muted-foreground leading-relaxed">
											{repo.description}
										</div>
									)}
									<div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/30">
										<div className="flex items-center gap-3 text-xs text-muted-foreground/60">
											{repo.language && (
												<div className="flex items-center gap-1.5">
													<div
														className="w-2 h-2 rounded-full"
														style={{
															backgroundColor:
																languageDotColors[
																	repo
																		.language
																] || "#6b7280",
														}}
													></div>
													<span>{repo.language}</span>
												</div>
											)}
											{repo.stars !== undefined &&
												repo.stars > 0 && (
													<div className="flex items-center gap-1.5">
														<Star className="w-3 h-3 text-muted-foreground/40" />
														<span>
															{repo.stars}
														</span>
													</div>
												)}
										</div>
										<div className="text-xs text-muted-foreground/60">
											Updated{" "}
											{formatDate(repo.updated_at)}
										</div>
									</div>
								</div>
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
