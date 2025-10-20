"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RepoCard from "@/components/RepoCard";
import UserInfoCard from "@/components/UserInfoCard";
import CursorGradient from "@/components/CursorGradient";
import ForYouTabs from "@/components/ForYouTabs";
import HackerNewsStoryCard from "@/components/HackerNewsStoryCard";
import { useAuth } from "@/hooks/useAuth";
import type { GitHubRepo, GalleryImage, HackerNewsStory } from "@/lib/types";
import { Pixelify_Sans } from "next/font/google";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

// No local BackendRepo type; reuse GitHubRepo for mapping
type ForYouItem = {
	username: string;
	id: string;
	name: string;
	description?: string | null;
	generated_description?: string | null;
	updated_at: string | null;
	stargazers_count?: number;
	language?: string | null;
	topics?: string[];
	link?: string;
	gallery?: GalleryImage[];
	tech_doc?: string;
	toy_implementation?: string;
	emphasis?: string[];
	keywords?: string[];
	kind?: string;
	is_ghost?: boolean;
};

type ForYouUser = {
	login: string;
	avatar_url: string;
	theme: string;
	is_ghost: boolean;
	bio?: string | null;
	blog?: string;
	location?: string | null;
	highlighted_repos?: string[];
};

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ForYouPage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const router = useRouter();
	const { login, loading } = useAuth();
	const [activeTab, setActiveTab] = useState<
		"community" | "trending" | "people" | "hackernews"
	>("community");
	const [communityFeed, setCommunityFeed] = useState<
		Array<{ owner: string; repo: GitHubRepo }>
	>([]);
	const [trendingFeed, setTrendingFeed] = useState<
		Array<{ owner: string; repo: GitHubRepo }>
	>([]);
	const [peopleFeed, setPeopleFeed] = useState<ForYouUser[]>([]);
	const [hackerNewsFeed, setHackerNewsFeed] = useState<HackerNewsStory[]>([]);
	const [communityLoading, setCommunityLoading] = useState<boolean>(true);
	const [trendingLoading, setTrendingLoading] = useState<boolean>(false);
	const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
	const [hackerNewsLoading, setHackerNewsLoading] = useState<boolean>(false);

	// Redirect if user is not the owner of this "for you" page
	useEffect(() => {
		if (!loading && login && login !== username) {
			router.push(`/personalized/${username}/profile`);
		}
	}, [loading, login, username, router]);

	// Helper function to map backend items to feed format
	const mapReposToFeed = (repos: ForYouItem[]) => {
		return repos.map((item) => {
			if (
				!item ||
				typeof item.username !== "string" ||
				typeof item.id !== "string" ||
				!item.id.includes("/") ||
				typeof item.name !== "string"
			) {
				throw new Error("Invalid repo item in feed");
			}
			return {
				owner: item.username,
				repo: {
					id: item.id,
					name: item.name,
					description: item.description ?? undefined,
					generated_description:
						item.generated_description ?? undefined,
					updated_at: item.updated_at,
					stars: item.stargazers_count,
					language: item.language ?? undefined,
					topics: item.topics,
					link: item.link,
					gallery: item.gallery,
					tech_doc: item.tech_doc,
					toy_implementation: item.toy_implementation,
					emphasis: item.emphasis,
					keywords: item.keywords,
					kind: item.kind,
					is_ghost: item.is_ghost,
				},
			};
		});
	};

	// Load Community feed from backend
	useEffect(() => {
		setCommunityLoading(true);
		(async () => {
			const res = await fetch(`/api/backend/for-you/${username}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const { repos } = (await res.json()) as { repos: ForYouItem[] };
			if (!Array.isArray(repos))
				throw new Error(
					"Invalid response shape: expected { repos: [] }"
				);

			const mapped = mapReposToFeed(repos);
			setCommunityFeed(mapped);
			setCommunityLoading(false);
		})().catch((e) => {
			// Surface hard failures
			throw e;
		});
	}, [username]);

	// Load Trending feed from backend (lazy load when tab is clicked)
	useEffect(() => {
		if (activeTab !== "trending" || trendingFeed.length > 0) return;

		setTrendingLoading(true);
		(async () => {
			const res = await fetch(
				`/api/backend/for-you-trending/${username}`
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const { repos } = (await res.json()) as { repos: ForYouItem[] };
			if (!Array.isArray(repos))
				throw new Error(
					"Invalid response shape: expected { repos: [] }"
				);

			const mapped = mapReposToFeed(repos);
			setTrendingFeed(mapped);
			setTrendingLoading(false);
		})().catch((e) => {
			// Surface hard failures
			throw e;
		});
	}, [activeTab, username, trendingFeed.length]);

	// Load People feed from backend (lazy load when tab is clicked)
	useEffect(() => {
		if (activeTab !== "people" || peopleFeed.length > 0) return;

		setPeopleLoading(true);
		(async () => {
			const res = await fetch(`/api/backend/for-you-users/${username}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const { users } = (await res.json()) as { users: ForYouUser[] };
			if (!Array.isArray(users))
				throw new Error(
					"Invalid response shape: expected { users: [] }"
				);

			setPeopleFeed(users);
			setPeopleLoading(false);
		})().catch((e) => {
			// Surface hard failures
			throw e;
		});
	}, [activeTab, username, peopleFeed.length]);

	// Load Hacker News feed from backend (lazy load when tab is clicked)
	useEffect(() => {
		if (activeTab !== "hackernews" || hackerNewsFeed.length > 0) return;

		setHackerNewsLoading(true);
		(async () => {
			const res = await fetch(
				`/api/backend/for-you-hackernews/${username}`
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const { stories } = (await res.json()) as {
				stories: HackerNewsStory[];
			};
			if (!Array.isArray(stories))
				throw new Error(
					"Invalid response shape: expected { stories: [] }"
				);

			setHackerNewsFeed(stories);
			setHackerNewsLoading(false);
		})().catch((e) => {
			// Surface hard failures
			throw e;
		});
	}, [activeTab, username, hackerNewsFeed.length]);

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen relative flex items-center justify-center">
				<CursorGradient />
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// If user is not logged in or not the owner, don't render (redirect will handle it)
	if (!login || login !== username) {
		return (
			<div className="min-h-screen relative flex items-center justify-center">
				<CursorGradient />
				<div className="text-sm text-muted-foreground">
					Redirecting...
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<CursorGradient />
			{/* Navigation */}
			<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
				<div className="flex justify-center items-center relative z-20">
					<div className="flex items-center gap-6">
						<Link
							href={`/personalized/${username}`}
							className={`text-lg md:text-xl transition-colors relative ${
								pathname === `/personalized/${username}`
									? "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-foreground after:rounded"
									: ""
							}`}
						>
							<span
								className={`${pixelFont.className} font-bold`}
							>
								{Array.from("FOR YOU").map((char, idx) => {
									const colors = [
										"text-rose-500",
										"text-orange-500",
										"text-amber-500",
										"text-lime-500",
										"text-emerald-500",
										"text-teal-500",
										"text-sky-500",
									];
									return (
										<span
											key={idx}
											className={
												char === " "
													? ""
													: colors[
															idx % colors.length
													  ]
											}
										>
											{char}
										</span>
									);
								})}
							</span>
						</Link>
						<Link
							href={`/personalized/${username}/profile`}
							className={`text-sm transition-colors relative ${
								pathname === `/personalized/${username}/profile`
									? "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-foreground after:rounded"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Me
						</Link>
					</div>
				</div>
			</div>

			{/* For You Content */}
			<div className="max-w-3xl mx-auto px-6">
				<ForYouTabs activeTab={activeTab} setActiveTab={setActiveTab} />

				{activeTab === "community" &&
					(communityLoading ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							Loading feed...
						</div>
					) : communityFeed.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							No feed yet.
						</div>
					) : (
						<div className="space-y-6">
							{communityFeed.map(({ owner, repo }) => (
								<RepoCard
									key={`${repo.id}`}
									repo={repo}
									owner={owner}
									showUsernameInsteadOfDate
									pageUsername={username}
									hideHeroImage={false}
									aiShowLoadingIfMissing={false}
								/>
							))}
						</div>
					))}

				{activeTab === "trending" &&
					(trendingLoading ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							Loading trending...
						</div>
					) : trendingFeed.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							No trending repos yet.
						</div>
					) : (
						<div className="space-y-6">
							{trendingFeed.map(({ owner, repo }) => (
								<RepoCard
									key={`${repo.id}`}
									repo={repo}
									owner={owner}
									showUsernameInsteadOfDate
									pageUsername={username}
									hideHeroImage={false}
									aiShowLoadingIfMissing={false}
								/>
							))}
						</div>
					))}

				{activeTab === "people" &&
					(peopleLoading ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							Loading people...
						</div>
					) : peopleFeed.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							No people to show yet.
						</div>
					) : (
						<div className="space-y-8">
							{peopleFeed.map((user) => (
								<UserInfoCard
									key={user.login}
									username={user.login}
									avatarUrl={user.avatar_url}
									is_ghost={user.is_ghost}
									theme={user.theme}
									clickable={true}
								/>
							))}
						</div>
					))}

				{activeTab === "hackernews" &&
					(hackerNewsLoading ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							Loading stories...
						</div>
					) : hackerNewsFeed.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-20">
							No stories to show yet.
						</div>
					) : (
						<div className="divide-y divide-border/40">
							{hackerNewsFeed.map((story) => (
								<HackerNewsStoryCard
									key={story.id}
									title={story.title}
									url={story.url}
									hnUrl={story.hn_url}
								/>
							))}
						</div>
					))}
			</div>
		</div>
	);
}
