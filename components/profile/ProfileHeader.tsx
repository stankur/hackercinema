"use client";

import type { Builder } from "@/lib/types";
import EmphasisBelts from "@/components/EmphasisBelts";
import UserInfoCard from "@/components/UserInfoCard";

interface ProfileHeaderProps {
	data: Builder;
	visibleSections: Set<string>;
}

export default function ProfileHeader({
	data,
	visibleSections,
}: ProfileHeaderProps) {
	// Collect all keywords from repos
	const allKeywords = (data?.repos ?? [])
		.flatMap((r) => r.keywords || [])
		.filter(Boolean);

	// Collect all emphasis from repos
	const allEmphasis = (data?.repos ?? [])
		.flatMap((r) => r.emphasis || [])
		.filter(Boolean);

	if (typeof window !== "undefined") {
		console.log("[Header] allKeywords", {
			count: allKeywords.length,
			sample: allKeywords.slice(0, 10),
		});
	}

	// Handle restart button click
	const handleRestart = async () => {
		try {
			const response = await fetch(
				`/api/backend/users/${data.username}/restart`,
				{
					method: "POST",
				}
			);
			if (!response.ok) {
				console.error("Restart failed:", response.status);
			}
		} catch (error) {
			console.error("Restart error:", error);
		}
	};
	return (
		<header
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
			<UserInfoCard
				username={data.username}
				is_ghost={data.profile?.is_ghost ?? false}
				theme={data.theme}
				showRestartButton={
					process.env.NEXT_PUBLIC_ENABLE_RESTART === "true"
				}
				onRestart={handleRestart}
			/>

			{/* Keywords and Emphasis Belts */}
			{(allKeywords.length > 0 || allEmphasis.length > 0) && (
				<div className="mt-10 space-y-5 md:space-y-5">
					{/* {allKeywords.length > 0 && (
							<KeywordsBelts
								keywords={allKeywords}
								startDirection="left"
							/>
						)} */}
					{allEmphasis.length > 0 && (
						<EmphasisBelts
							emphasis={allEmphasis}
							startDirection={
								// Opposite of the last keywords belt
								// If keywords start left and alternate, last belt index = belts-1
								// Opposite = right when last keywords belt would be ...
								// Simplify: flip based on number of belts derived from count
								(Math.ceil(allKeywords.length / 20) - 1) % 2 ===
								0
									? "right"
									: "left"
							}
						/>
					)}
				</div>
			)}
		</header>
	);
}
