"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import WritingsSection from "@/components/WritingsSection";
import { validateProfileData, type ProfileData } from "@/lib/schemas";
import { Mail, Globe } from "lucide-react";
import { SocialIcon } from "@/components/ui/OrganizationIcon";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);
	const [data, setData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);

	// Animation refs for each section
	const headerRef = useRef<HTMLElement>(null);
	const aboutRef = useRef<HTMLElement>(null);
	const workingOnRef = useRef<HTMLElement>(null);
	const experienceRef = useRef<HTMLDivElement>(null);
	const projectsRef = useRef<HTMLDivElement>(null);
	const writingsRef = useRef<HTMLDivElement>(null);
	const contactsRef = useRef<HTMLElement>(null);

	// Animation states
	const [visibleSections, setVisibleSections] = useState<Set<string>>(
		new Set()
	);

	// Expand/collapse states for each section
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set([
			"about",
			"workingOn",
			"experience",
			"projects",
			"writings",
			"contacts",
		])
	);

	const toggleSection = (sectionName: string) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(sectionName)) {
				newSet.delete(sectionName);
			} else {
				newSet.add(sectionName);
			}
			return newSet;
		});
	};

	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			console.log(
				"Intersection callback triggered:",
				entries.length,
				"entries"
			);
			entries.forEach((entry) => {
				const sectionId = entry.target.getAttribute("data-section");
				console.log(
					"Section:",
					sectionId,
					"isIntersecting:",
					entry.isIntersecting
				);
				if (sectionId) {
					if (entry.isIntersecting) {
						console.log("Setting section visible:", sectionId);
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
		// Only set up observer after data is loaded and components are rendered
		if (!data) return;

		console.log("Setting up intersection observer");
		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: "0px",
			threshold: 0,
		});

		// Small delay to ensure DOM is fully rendered
		setTimeout(() => {
			// Observe all sections
			const refs = [
				headerRef,
				aboutRef,
				workingOnRef,
				experienceRef,
				projectsRef,
				writingsRef,
				contactsRef,
			];

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
		// Load all profiles from the consolidated file
		// Note: We intentionally don't include 'data' in dependencies
		// because we only want to run this effect when username changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
		fetch("/api/profiles.json")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load profiles");
				}
				return res.json();
			})
			.then((profiles) => {
				// Find profile with case-insensitive matching
				const profileKey = Object.keys(profiles).find(
					(key) => key.toLowerCase() === username.toLowerCase()
				);

				// Check if the requested username exists
				if (profileKey) {
					try {
						const validatedData = validateProfileData(
							profiles[profileKey]
						);
						setData(validatedData);
						setLoading(false);
						return; // Exit early, don't continue to fallback
					} catch (validationError) {
						console.error(
							`Validation error for ${username}:`,
							validationError
						);
						// Continue to fallback if validation fails
					}
				}

				// Username not found or validation failed, try sample data as fallback
				return fetch("/api/sample_index.json").then((res) =>
					res.json()
				);
			})
			.then((fallbackJson) => {
				// This will only run if username not found or validation failed above
				if (fallbackJson && !data) {
					try {
						const validatedFallback =
							validateProfileData(fallbackJson);
						setData(validatedFallback);
					} catch (fallbackError) {
						console.error(
							"Fallback data also failed validation:",
							fallbackError
						);
					}
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error(`Failed to load profile for ${username}:`, error);
				// Try sample data as last resort
				fetch("/api/sample_index.json")
					.then((res) => res.json())
					.then((json) => {
						if (json) {
							try {
								const validatedData = validateProfileData(json);
								setData(validatedData);
							} catch (validationError) {
								console.error(
									"Sample data validation failed:",
									validationError
								);
							}
						}
						setLoading(false);
					})
					.catch(() => setLoading(false));
			});
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
				<div className="text-sm text-muted-foreground">No data</div>
			</div>
		);
	}

	const {
		profile,
		about,
		experiences = [],
		projects = [],
		writings = [],
		contacts = {},
		workingOn,
	} = data;

	// Debug logging
	console.log("🔍 Profile Data Debug:");
	console.log("Profile:", profile);
	console.log("Profile Links:", profile.links);
	console.log("X Link:", profile.links?.x);
	console.log("Has X Link:", !!profile.links?.x);

	const hasContacts = contacts && Object.keys(contacts).length > 0;

	return (
		<div className="min-h-screen">
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
							{profile.name}
						</h1>
						{profile.headline && (
							<p className="text-sm font-light mt-1">
								{profile.headline}
							</p>
						)}
						{profile.location && (
							<div className="text-sm font-light mt-3">
								{profile.location}
							</div>
						)}
						{/* Profile Links */}
						{profile.links && (
							<div className="flex gap-4 items-center mt-8">
								{profile.links.email && (
									<a
										href={`mailto:${profile.links.email}`}
										className="text-foreground hover:opacity-80 transition-opacity"
										title="Email"
									>
										<Mail
											className="w-5 h-5"
											strokeWidth={1}
										/>
									</a>
								)}
								{profile.links.github && (
									<a
										href={profile.links.github}
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
								)}
								{profile.links.linkedin && (
									<a
										href={profile.links.linkedin}
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
								{profile.links.x && (
									<a
										href={profile.links.x}
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
								{profile.links.yc && (
									<a
										href={profile.links.yc}
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
								{profile.links.personal && (
									<a
										href={profile.links.personal}
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
						)}
					</div>
				</header>

				{/* About */}
				{about && (
					<section
						ref={aboutRef}
						data-section="about"
						className={`
							transition-all duration-700 ease-out
							${
								visibleSections.has("about")
									? "opacity-100 blur-0 scale-100"
									: "opacity-0 blur-sm scale-95"
							}
						`}
					>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
								ABOUT
							</h2>
							<button
								onClick={() => toggleSection("about")}
								className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
							>
								{expandedSections.has("about") ? "—" : "+"}
							</button>
						</div>
						{expandedSections.has("about") && (
							<div className="space-y-6">
								{about.split("\n\n").map((paragraph, index) => {
									// Check if this paragraph is a list (starts with bullet points)
									if (paragraph.includes("\n- ")) {
										const lines = paragraph.split("\n");
										const beforeList = lines.find(
											(line) =>
												!line.startsWith("- ") &&
												line.trim() !== ""
										);
										const listItems = lines.filter((line) =>
											line.startsWith("- ")
										);

										return (
											<div
												key={index}
												className="pl-4 md:pl-5"
											>
												{beforeList && (
													<p className="text-sm leading-relaxed text-foreground font-light mb-3">
														{beforeList}
													</p>
												)}
												<ul className="text-sm leading-relaxed text-foreground font-light space-y-1 list-disc list-inside">
													{listItems.map(
														(item, itemIndex) => (
															<li key={itemIndex}>
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
											className="text-sm leading-relaxed text-foreground font-light pl-4 md:pl-5"
										>
											{paragraph}
										</p>
									);
								})}
							</div>
						)}
					</section>
				)}

				{/* Working On */}
				{workingOn && (
					<section
						ref={workingOnRef}
						data-section="workingOn"
						className={`
							transition-all duration-700 ease-out
							${
								visibleSections.has("workingOn")
									? "opacity-100 blur-0 scale-100"
									: "opacity-0 blur-sm scale-95"
							}
						`}
					>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
								WORKING ON
							</h2>
							<button
								onClick={() => toggleSection("workingOn")}
								className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
							>
								{expandedSections.has("workingOn") ? "—" : "+"}
							</button>
						</div>
						{expandedSections.has("workingOn") && (
							<div className="space-y-6">
								<p className="text-sm leading-relaxed text-foreground font-light pl-4 md:pl-5">
									{workingOn}
								</p>
							</div>
						)}
					</section>
				)}

				{/* Experience */}
				<div
					ref={experienceRef}
					data-section="experience"
					className={`
						transition-all duration-700 ease-out
						${
							visibleSections.has("experience")
								? "opacity-100 blur-0 scale-100"
								: "opacity-0 blur-sm scale-95"
						}
					`}
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
							EXPERIENCE
						</h2>
						<button
							onClick={() => toggleSection("experience")}
							className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
						>
							{expandedSections.has("experience") ? "—" : "+"}
						</button>
					</div>
					{expandedSections.has("experience") && (
						<ExperienceSection experiences={experiences} />
					)}
				</div>

				{/* Projects */}
				<div
					ref={projectsRef}
					data-section="projects"
					className={`
						transition-all duration-700 ease-out
						${
							visibleSections.has("projects")
								? "opacity-100 blur-0 scale-100"
								: "opacity-0 blur-sm scale-95"
						}
					`}
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
							PROJECTS
						</h2>
						<button
							onClick={() => toggleSection("projects")}
							className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
						>
							{expandedSections.has("projects") ? "—" : "+"}
						</button>
					</div>
					{expandedSections.has("projects") && (
						<ProjectsSection projects={projects} />
					)}
				</div>

				{/* Writings */}
				{writings.length > 0 && (
					<div
						ref={writingsRef}
						data-section="writings"
						className={`
							transition-all duration-700 ease-out
							${
								visibleSections.has("writings")
									? "opacity-100 blur-0 scale-100"
									: "opacity-0 blur-sm scale-95"
							}
						`}
					>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
								WRITINGS
							</h2>
							<button
								onClick={() => toggleSection("writings")}
								className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
							>
								{expandedSections.has("writings") ? "—" : "+"}
							</button>
						</div>
						{expandedSections.has("writings") && (
							<WritingsSection writings={writings} />
						)}
					</div>
				)}

				{/* Contacts (hidden if empty) */}
				{hasContacts && (
					<section
						ref={contactsRef}
						data-section="contacts"
						className={`
							transition-all duration-700 ease-out
							${
								visibleSections.has("contacts")
									? "opacity-100 blur-0 scale-100"
									: "opacity-0 blur-sm scale-95"
							}
						`}
					>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
								CONTACTS
							</h2>
							<button
								onClick={() => toggleSection("contacts")}
								className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
							>
								{expandedSections.has("contacts") ? "—" : "+"}
							</button>
						</div>
						{expandedSections.has("contacts") && (
							<div className="space-y-6">
								<ul className="text-sm text-foreground/90 space-y-1 pl-4 md:pl-5">
									{Object.entries(contacts).map(
										([key, value]) => (
											<li
												key={key}
												className="flex items-center gap-2"
											>
												<span className="text-muted-foreground capitalize">
													{key}:
												</span>
												<a
													href={value}
													className="text-primary hover:underline break-all"
												>
													{value}
												</a>
											</li>
										)
									)}
								</ul>
							</div>
						)}
					</section>
				)}
			</div>
		</div>
	);
}
