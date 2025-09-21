"use client";

import { use, useRef, useCallback, useEffect, useState } from "react";
import CursorGradient from "@/components/CursorGradient";
import ProjectsSection from "@/components/ProjectsSection";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNavigation from "@/components/profile/ProfileNavigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import HighlightsSection from "@/components/profile/sections/HighlightsSection";
import AllReposSection from "@/components/profile/sections/AllReposSection";
import AboutSection from "@/components/profile/sections/AboutSection";
import WorkingOnSection from "@/components/profile/sections/WorkingOnSection";
import WritingsSection from "@/components/profile/sections/WritingsSection";
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
		profileData,
		loading,
		highlightedRepoNames,
		highlightedRepos,
		visibleTabs,
		activeTab,
		setActiveTab,
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
	if (loading || !data) {
		return <ProfileSkeleton username={username} />;
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			{/* Navigation */}
			<ProfileNavigation username={username} data={data} />

			<div className="max-w-3xl mx-auto py-10 px-6 space-y-30">
				{/* Header */}
				<header ref={headerRef} data-section="header">
					<ProfileHeader
						data={data}
						profileData={profileData}
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
						{/* When only 1 tab, show content directly without tab switching */}
						{visibleTabs.length === 1 ? (
							<div className="space-y-6">
								{visibleTabs[0].id === "all" && (
									<AllReposSection
										username={data.username}
										repos={data.repos}
										highlightedRepoNames={
											highlightedRepoNames
										}
									/>
								)}
								{visibleTabs[0].id === "highlights" && (
									<HighlightsSection
										highlightedRepoNames={
											highlightedRepoNames
										}
										highlightedRepos={highlightedRepos}
										username={data.username}
										aiEnabled={!!highlightedRepoNames}
									/>
								)}
								{visibleTabs[0].id === "about" &&
									profileData?.about && (
										<AboutSection
											about={profileData.about}
										/>
									)}
								{visibleTabs[0].id === "projects" &&
									profileData?.projects && (
										<ProjectsSection
											projects={profileData.projects}
										/>
									)}
								{visibleTabs[0].id === "workingOn" &&
									profileData?.workingOn && (
										<WorkingOnSection
											workingOn={profileData.workingOn}
										/>
									)}
								{visibleTabs[0].id === "writings" &&
									profileData?.writings && (
										<WritingsSection
											writings={profileData.writings}
										/>
									)}
							</div>
						) : (
							<>
								{/* Normal tab switching for multiple tabs */}
								{activeTab === "all" && (
									<AllReposSection
										username={data.username}
										repos={data.repos}
										highlightedRepoNames={
											highlightedRepoNames
										}
									/>
								)}
								{activeTab === "highlights" && (
									<HighlightsSection
										highlightedRepoNames={
											highlightedRepoNames
										}
										highlightedRepos={highlightedRepos}
										username={data.username}
										aiEnabled={!!highlightedRepoNames}
									/>
								)}
								{activeTab === "about" &&
									profileData?.about && (
										<AboutSection
											about={profileData.about}
										/>
									)}
								{activeTab === "projects" &&
									profileData?.projects && (
										<ProjectsSection
											projects={profileData.projects}
										/>
									)}
								{activeTab === "workingOn" &&
									profileData?.workingOn && (
										<WorkingOnSection
											workingOn={profileData.workingOn}
										/>
									)}
								{activeTab === "writings" &&
									profileData?.writings && (
										<WritingsSection
											writings={profileData.writings}
										/>
									)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
