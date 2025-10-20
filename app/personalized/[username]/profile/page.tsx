"use client";

import { use, useRef, useCallback, useEffect, useState } from "react";
import CursorGradient from "@/components/CursorGradient";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import HighlightsSection from "@/components/profile/sections/HighlightsSection";
import AllReposSection from "@/components/profile/sections/AllReposSection";
import ContextsSection from "@/components/profile/sections/ContextsSection";
import { useProfileData } from "@/components/profile/ProfileDataProvider";
import "react-loading-skeleton/dist/skeleton.css";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ProfilePage({ params }: PageProps) {
	const { username } = use(params);

	// Use the custom hook for all data management
	const {
		data,
		loading,
		highlightedRepoNames,
		contexts,
		contextsLoading,
		visibleTabs,
		activeTab,
		setActiveTab,
		addContext,
	} = useProfileData(username);

	// Animation refs for each section
	const headerRef = useRef<HTMLElement>(null);
	const tabsRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	// Animation states
	const [visibleSections, setVisibleSections] = useState<Set<string>>(
		new Set()
	);

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

	// Show skeleton loading state
	if (loading) {
		return <ProfileSkeleton username={username} />;
	}

	// User not found
	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<CursorGradient />
				<div className="text-center relative z-10">
					<h1 className="text-2xl font-semibold text-foreground mb-2">
						User not found
					</h1>
					<p className="text-muted-foreground">
						@{username} doesn&apos;t exist
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			{/* Navigation */}
			<ProfileNavigation username={username} />

			<div className="max-w-3xl mx-auto py-10 px-6 space-y-20">
				{/* Header */}
				<header ref={headerRef} data-section="header">
					<ProfileHeader
						data={data}
						visibleSections={visibleSections}
					/>
				</header>

				<div className="flex flex-col gap-12">
					{/* Tab Navigation */}
					<div ref={tabsRef} data-section="tabs">
						<ProfileTabs
							visibleTabs={visibleTabs}
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							visibleSections={visibleSections}
						/>
					</div>

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
						{activeTab === "recent" && (
							<AllReposSection
								username={data.profile.login}
								repos={data.repos}
								highlightedRepoNames={highlightedRepoNames}
							/>
						)}
						{activeTab === "highlights" && (
							<HighlightsSection
								repos={data.repos}
								highlightedRepoNames={highlightedRepoNames}
								username={data.profile.login}
								aiEnabled={!!highlightedRepoNames}
							/>
						)}
						{activeTab === "contexts" && (
							<ContextsSection
								contexts={contexts}
								loading={contextsLoading}
								username={username}
								onContextAdded={addContext}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
