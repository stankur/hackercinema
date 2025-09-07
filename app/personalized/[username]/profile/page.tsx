"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RepoCard from "@/components/RepoCard";
import { SocialIcon } from "@/components/ui/OrganizationIcon";
import type { Builder } from "@/lib/types";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const [data, setData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);

	// Animation refs for each section
	const headerRef = useRef<HTMLElement>(null);
	const highlightsRef = useRef<HTMLDivElement>(null);

	// Animation states
	const [visibleSections, setVisibleSections] = useState<Set<string>>(
		new Set()
	);

	// Expand/collapse states for each section
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(["highlights"])
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
			const refs = [headerRef, highlightsRef];

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
		// Load user data from data.json
		fetch("/api/data.json")
			.then((res) => {
				if (!res.ok) {
					throw new Error("Failed to load data");
				}
				return res.json();
			})
			.then((builders: Builder[]) => {
				// Find user with case-insensitive matching
				const user = builders.find(
					(builder) =>
						builder.username.toLowerCase() ===
						username.toLowerCase()
				);

				if (user) {
					setData(user);
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error(`Failed to load data for ${username}:`, error);
				setLoading(false);
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
				<div className="text-sm text-muted-foreground">
					User not found
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
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
								<img
									src={data.profile.avatar_url}
									alt={`${data.username}'s avatar`}
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
						{data.theme && (
							<p className="text-sm font-light mt-1">
								{data.theme}
							</p>
						)}

						{/* GitHub Link */}
						<div className="flex gap-4 items-center mt-8">
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
						</div>
					</div>
				</header>

				{/* Highlights Section */}
				<div
					ref={highlightsRef}
					data-section="highlights"
					className={`
						transition-all duration-700 ease-out
						${
							visibleSections.has("highlights")
								? "opacity-100 blur-0 scale-100"
								: "opacity-0 blur-sm scale-95"
						}
					`}
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
							HIGHLIGHTS
						</h2>
						<button
							onClick={() => toggleSection("highlights")}
							className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
						>
							{expandedSections.has("highlights") ? "—" : "+"}
						</button>
					</div>
					{expandedSections.has("highlights") && (
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
											showUsernameInsteadOfDate={false}
										/>
									))
							) : (
								<div className="text-sm text-muted-foreground pl-4 md:pl-5">
									No repositories found.
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
