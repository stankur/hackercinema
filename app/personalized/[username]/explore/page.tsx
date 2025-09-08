"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ProjectsContent from "@/components/ProjectsContent";
import CursorGradient from "@/components/CursorGradient";
import type { Builder } from "@/lib/types";

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default function ExplorePage({ params }: PageProps) {
	const { username } = use(params);
	const pathname = usePathname();
	const [userData, setUserData] = useState<Builder | null>(null);
	const [loading, setLoading] = useState(true);

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

				setUserData(user || null);
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

	if (!userData) {
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

					{/* Avatar on right within content width */}
					<Link
						href={`/personalized/${username}/profile`}
						className="cursor-pointer"
					>
						<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
							{userData.profile?.avatar_url ? (
								<Image
									src={userData.profile.avatar_url}
									alt={`${userData.username}'s avatar`}
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

			{/* Projects Content - Exact same as projects page */}
			<div className="max-w-3xl mx-auto px-6">
				<ProjectsContent />
			</div>
		</div>
	);
}
