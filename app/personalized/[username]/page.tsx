"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import RepoCard from "@/components/RepoCard";
import UserInfoCard from "@/components/UserInfoCard";
import CursorGradient from "@/components/CursorGradient";
import ForYouTabs from "@/components/ForYouTabs";
import { useAuth } from "@/hooks/useAuth";
import type { GitHubRepo, GalleryImage } from "@/lib/types";

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
		"community" | "trending" | "people"
	>("community");
	const [communityFeed, setCommunityFeed] = useState<
		Array<{ owner: string; repo: GitHubRepo }>
	>([]);
	const [trendingFeed, setTrendingFeed] = useState<
		Array<{ owner: string; repo: GitHubRepo }>
	>([]);
	const [peopleFeed, setPeopleFeed] = useState<ForYouUser[]>([]);
	const [communityLoading, setCommunityLoading] = useState<boolean>(true);
	const [trendingLoading, setTrendingLoading] = useState<boolean>(false);
	const [peopleLoading, setPeopleLoading] = useState<boolean>(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

	// Single fetch for user avatar (no polling)
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/backend/users/${username}/data`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				const url = data?.user?.avatar_url;
				if (typeof url !== "string") throw new Error("Invalid avatar");
				setAvatarUrl(url);
			} catch (e) {
				console.error("Failed to load profile avatar", e);
			}
		})();
	}, [username]);

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
					</div>

					{/* Avatar on right within content width */}
					<Link
						href={`/personalized/${username}/profile`}
						className="cursor-pointer"
					>
						<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt={`${username}'s avatar`}
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
									is_ghost={user.is_ghost}
									theme={user.theme}
									clickable={true}
								/>
							))}
						</div>
					))}
			</div>
		</div>
	);
}
