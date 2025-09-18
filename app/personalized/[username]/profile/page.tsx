"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import RepoCard from "@/components/RepoCard";
import ProjectsSection from "@/components/ProjectsSection";
import { SocialIcon } from "@/components/ui/OrganizationIcon";
import CursorGradient from "@/components/CursorGradient";
import { Mail, Globe } from "lucide-react";
import type { Builder } from "@/lib/types";

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
	about?: string;
	projects?: Array<{
		name: string;
		subtitle?: string;
		period?: string;
		tech?: string[];
		details?: string[];
		links?: {
			website?: string;
			youtube?: string;
			github?: string;
		};
	}>;
	workingOn?: string;
	writings?: Array<{
		title: string;
		link: string;
		description?: string;
		date?: string;
	}>;
}

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const [data, setData] = useState<Builder | null>(null);
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);

	// Animation refs for each section
	const headerRef = useRef<HTMLElement>(null);
	const tabsRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	// Animation states
	const [visibleSections, setVisibleSections] = useState<Set<string>>(
		new Set()
	);

	// Active tab state
	const [activeTab, setActiveTab] = useState<string>("highlights");

	// Function to determine visible tabs based on content
	const getVisibleTabs = useCallback(() => {
		const tabs = [];

		// HIGHLIGHTS - always show if there are repos
		if (data?.repos && data.repos.length > 0) {
			tabs.push({ id: "highlights", label: "HIGHLIGHTS" });
		}

		// ABOUT - show if there's about content
		if (profileData?.about && profileData.about.trim()) {
			tabs.push({ id: "about", label: "ABOUT" });
		}

		// PROJECTS - show if there are projects
		if (profileData?.projects && profileData.projects.length > 0) {
			tabs.push({ id: "projects", label: "PROJECTS" });
		}

		// WORKING ON - show if there's current work
		if (profileData?.workingOn && profileData.workingOn.trim()) {
			tabs.push({ id: "workingOn", label: "WORKING ON" });
		}

		// WRITINGS - show if there are writings
		if (profileData?.writings && profileData.writings.length > 0) {
			tabs.push({ id: "writings", label: "WRITINGS" });
		}

		return tabs;
	}, [data, profileData]);

	const visibleTabs = getVisibleTabs();

	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				const sectionId = entry.target.getAttribute("data-section");
				if (sectionId) {
					if (entry.isIntersecting) {
						setVisibleSections(
							(prev) => new Set([...prev, sectionId])
						);
					}
				}
			});
		},
		[]
	);

	useEffect(() => {
		if (!data) return;

		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: "0px",
			threshold: 0,
		});

		setTimeout(() => {
			const refs = [headerRef, tabsRef, contentRef];

			refs.forEach((ref) => {
				if (ref.current) {
					observer.observe(ref.current);
				}
			});

			// Immediately mark sections visible if already in viewport
			refs.forEach((ref) => {
				const el = ref.current;
				if (!el) return;
				const rect = el.getBoundingClientRect();
				const isPartiallyVisible =
					rect.top < window.innerHeight && rect.bottom > 0;
				if (isPartiallyVisible) {
					const sectionId = el.getAttribute("data-section");
					if (sectionId) {
						setVisibleSections(
							(prev) => new Set([...prev, sectionId])
						);
					}
				}
			});
		}, 100);

		return () => observer.disconnect();
	}, [handleIntersection, data]);

	useEffect(() => {
		// Load both data.json and profiles.json
		const loadData = async () => {
			try {
				// Load builder data from data.json
				const dataRes = await fetch("/api/data.json");
				if (dataRes.ok) {
					const builders: Builder[] = await dataRes.json();
					const user = builders.find(
						(builder) =>
							builder.username.toLowerCase() ===
							username.toLowerCase()
					);
					if (user) {
						setData(user);
					}
				}

				// Load profile data from profiles.json
				const profileRes = await fetch("/api/profiles.json");
				if (profileRes.ok) {
					const profiles = await profileRes.json();
					const profileKey = Object.keys(profiles).find(
						(key) => key.toLowerCase() === username.toLowerCase()
					);
					if (profileKey) {
						setProfileData(profiles[profileKey]);
					}
				}

				setLoading(false);
			} catch (error) {
				console.error(`Failed to load data for ${username}:`, error);
				setLoading(false);
			}
		};

		loadData();
	}, [username]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading…</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">
					User not found
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			{/* Navigation */}
			<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
				<div className="flex justify-between items-center relative z-20">
					{/* Empty left space */}
					<div></div>

					{/* Centered tabs */}
					<div className="flex gap-10">
						<Link
							href={`/personalized/${username}`}
							className={`text-sm transition-colors ${
								pathname === `/personalized/${username}`
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							For You
						</Link>

						<Link
							href={`/personalized/${username}/explore`}
							className={`text-sm transition-colors ${
								pathname === `/personalized/${username}/explore`
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Explore
						</Link>
					</div>

					{/* Avatar on right within content width - active state */}
					<Link
						href={`/personalized/${username}/profile`}
						className="cursor-pointer"
					>
						<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-foreground">
							{data.profile?.avatar_url ? (
								<Image
									src={data.profile.avatar_url}
									alt={`${data.username}'s avatar`}
									width={32}
									height={32}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
							)}
						</div>
					</Link>
				</div>
			</div>

			<div className="max-w-3xl mx-auto py-10 px-6 space-y-16">
				{/* Header */}
				<header
					ref={headerRef}
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
						<h1 className="text-2xl font-semibold text-foreground">
							{data.username}
						</h1>

						{profileData?.profile?.headline && (
							<p className="text-sm font-light mt-1">
								{profileData.profile.headline}
							</p>
						)}

						{/* Social Links */}
						<div className="flex gap-4 items-center mt-8">
							{/* GitHub - default from data.json */}
							<a
								href={`https://github.com/${data.username}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground hover:opacity-80 transition-opacity"
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
									className="text-foreground hover:opacity-80 transition-opacity"
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
									className="text-foreground hover:opacity-80 transition-opacity"
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
									className="text-foreground hover:opacity-80 transition-opacity"
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
									className="text-foreground hover:opacity-80 transition-opacity"
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
									className="text-foreground hover:opacity-80 transition-opacity"
									title="Personal Website"
								>
									<Globe
										className="w-5 h-5"
										strokeWidth={1}
									/>
								</a>
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
					</div>
				</header>

				{/* Tab Navigation - only show when there are 2+ tabs */}
				{visibleTabs.length > 1 && (
					<div
						ref={tabsRef}
						data-section="tabs"
						className={`
							mb-16 transition-all duration-700 ease-out
							${
								visibleSections.has("tabs")
									? "opacity-100 blur-0 scale-100"
									: "opacity-0 blur-sm scale-95"
							}
						`}
					>
						<div className="flex flex-wrap gap-6 sm:gap-10">
							{visibleTabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`text-xs font-mono tracking-widest uppercase transition-all px-3 py-2 rounded-full border ${
										activeTab === tab.id
											? "text-foreground border-foreground"
											: "text-muted-foreground border-muted-foreground/30 hover:text-foreground hover:border-foreground/50"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Tab Content */}
				<div
					ref={contentRef}
					data-section="content"
					className={`
						transition-all duration-700 ease-out
						${
							visibleSections.has("content")
								? "opacity-100 blur-0 scale-100"
								: "opacity-0 blur-sm scale-95"
						}
					`}
				>
					{/* When only 1 tab, show content directly without tab switching */}
					{visibleTabs.length === 1 ? (
						<div className="space-y-6">
							{/* Show the single tab's content directly */}
							{visibleTabs[0].id === "highlights" && (
								<>
									{data?.repos && data.repos.length > 0 ? (
										data.repos
											.slice(0, 5)
											.map((repo) => (
												<RepoCard
													key={repo.name}
													repo={repo}
													owner={data.username}
													showOwner={false}
													showUsernameInsteadOfDate={
														false
													}
												/>
											))
									) : (
										<div className="text-sm text-muted-foreground">
											No repositories found.
										</div>
									)}
								</>
							)}
							{visibleTabs[0].id === "about" &&
								profileData?.about && (
									<div>
										{profileData.about
											.split("\n\n")
											.map((paragraph, index) => (
												<p
													key={index}
													className="text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0"
												>
													{paragraph}
												</p>
											))}
									</div>
								)}
							{visibleTabs[0].id === "projects" &&
								profileData?.projects && (
									<ProjectsSection
										projects={profileData.projects}
									/>
								)}
							{visibleTabs[0].id === "workingOn" &&
								profileData?.workingOn && (
									<div>
										<p className="text-sm text-muted-foreground leading-relaxed">
											{profileData.workingOn}
										</p>
									</div>
								)}
							{visibleTabs[0].id === "writings" &&
								profileData?.writings && (
									<div className="space-y-4">
										{profileData.writings.map(
											(writing, index) => (
												<div
													key={index}
													className="border-b border-muted pb-4 last:border-b-0"
												>
													<a
														href={writing.link}
														target="_blank"
														rel="noopener noreferrer"
														className="block group"
													>
														<h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
															{writing.title}
														</h3>
														{writing.description && (
															<p className="text-xs text-muted-foreground leading-relaxed mb-2">
																{
																	writing.description
																}
															</p>
														)}
														{writing.date && (
															<p className="text-xs text-muted-foreground/60">
																{writing.date}
															</p>
														)}
													</a>
												</div>
											)
										)}
									</div>
								)}
						</div>
					) : (
						<>
							{/* Normal tab switching for multiple tabs */}
							{/* Highlights Content */}
							{activeTab === "highlights" && (
								<div className="space-y-6">
									{data.repos.length > 0 ? (
										data.repos
											.slice(0, 5)
											.map((repo) => (
												<RepoCard
													key={repo.name}
													repo={repo}
													owner={data.username}
													showOwner={false}
													showUsernameInsteadOfDate={
														false
													}
												/>
											))
									) : (
										<div className="text-sm text-muted-foreground">
											No repositories found.
										</div>
									)}
								</div>
							)}

							{/* About Content */}
							{activeTab === "about" && profileData?.about && (
								<div className="space-y-6">
									{profileData.about
										.split("\n\n")
										.map(
											(
												paragraph: string,
												index: number
											) => {
												// Check if this paragraph is a list (starts with bullet points)
												if (
													paragraph.includes("\n- ")
												) {
													const lines =
														paragraph.split("\n");
													const beforeList =
														lines.find(
															(line) =>
																!line.startsWith(
																	"- "
																) &&
																line.trim() !==
																	""
														);
													const listItems =
														lines.filter((line) =>
															line.startsWith(
																"- "
															)
														);

													return (
														<div key={index}>
															{beforeList && (
																<p className="text-sm leading-relaxed text-foreground font-light mb-3">
																	{beforeList}
																</p>
															)}
															<ul className="text-sm leading-relaxed text-foreground font-light space-y-1 list-disc list-inside">
																{listItems.map(
																	(
																		item,
																		itemIndex
																	) => (
																		<li
																			key={
																				itemIndex
																			}
																		>
																			{item.substring(
																				2
																			)}
																		</li>
																	)
																)}
															</ul>
														</div>
													);
												}

												// Regular paragraph
												return (
													<p
														key={index}
														className="text-sm leading-relaxed text-foreground font-light"
													>
														{paragraph}
													</p>
												);
											}
										)}
								</div>
							)}

							{/* Projects Content */}
							{activeTab === "projects" &&
								profileData?.projects &&
								profileData.projects.length > 0 && (
									<div>
										<ProjectsSection
											projects={profileData.projects}
										/>
									</div>
								)}

							{/* Working On Content */}
							{activeTab === "workingOn" &&
								profileData?.workingOn && (
									<div className="space-y-6">
										<p className="text-sm leading-relaxed text-foreground font-light">
											{profileData.workingOn}
										</p>
									</div>
								)}

							{/* Writings Content */}
							{activeTab === "writings" &&
								profileData?.writings &&
								profileData.writings.length > 0 && (
									<div className="space-y-6">
										{profileData.writings.map(
											(
												writing: {
													title: string;
													link: string;
													description?: string;
													date?: string;
												},
												index: number
											) => (
												<div
													key={index}
													className="space-y-2"
												>
													<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
														<div className="flex-1 min-w-0">
															<h3 className="text-sm font-medium text-foreground leading-tight">
																<a
																	href={
																		writing.link
																	}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="hover:opacity-80 transition-opacity"
																>
																	{
																		writing.title
																	}
																</a>
															</h3>
															{writing.description && (
																<p className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">
																	{
																		writing.description
																	}
																</p>
															)}
														</div>
														{writing.date && (
															<div className="text-xs text-muted-foreground font-mono sm:whitespace-nowrap">
																{writing.date}
															</div>
														)}
													</div>
												</div>
											)
										)}
									</div>
								)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
