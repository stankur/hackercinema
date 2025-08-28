"use client";

import { useState, useEffect, useMemo } from "react";
import { getLanguageDotColor } from "@/lib/language-colors";
import BuilderDisplay from "./BuilderDisplay";
import type { Builder } from "@/lib/types";

interface ByLanguagesProps {
	builders: Builder[];
}

interface LanguageData {
	name: string;
	count: number;
	color: string;
	builders: Array<{
		username: string;
		profile: Builder["profile"];
		theme: string;
		repoCount: number;
		repos: Builder["repos"];
	}>;
}

export default function ByLanguages({ builders }: ByLanguagesProps) {
	const [isSectionExpanded, setIsSectionExpanded] = useState(true);
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
		null
	);
	const [languageColors, setLanguageColors] = useState<
		Record<string, string>
	>({});
	const [showAllLanguages, setShowAllLanguages] = useState(false);

	// Process data to get language statistics
	const languageData = useMemo(() => {
		const languageMap = new Map<string, Set<string>>();
		const builderRepoCounts = new Map<string, Map<string, number>>();

		// Count repositories per language per builder
		builders.forEach((builder) => {
			builder.repos.forEach((repo) => {
				if (repo.language) {
					if (!languageMap.has(repo.language)) {
						languageMap.set(repo.language, new Set());
					}
					languageMap.get(repo.language)!.add(builder.username);

					// Count repos per language per builder
					if (!builderRepoCounts.has(builder.username)) {
						builderRepoCounts.set(builder.username, new Map());
					}
					const userLangCounts = builderRepoCounts.get(
						builder.username
					)!;
					userLangCounts.set(
						repo.language,
						(userLangCounts.get(repo.language) || 0) + 1
					);
				}
			});
		});

		// Convert to array and sort by count
		const languages: LanguageData[] = Array.from(languageMap.entries())
			.map(([language, usernames]) => {
				const buildersForLanguage = Array.from(usernames).map(
					(username) => {
						const builder = builders.find(
							(b) => b.username === username
						)!;
						const repoCount =
							builderRepoCounts.get(username)?.get(language) || 0;
						return {
							username: builder.username,
							profile: builder.profile,
							theme: builder.theme,
							repoCount,
							repos: builder.repos,
						};
					}
				);

				// Sort builders by repo count (descending)
				buildersForLanguage.sort((a, b) => b.repoCount - a.repoCount);

				return {
					name: language,
					count: usernames.size,
					color: "#6b7280", // Default color, will be updated
					builders: buildersForLanguage,
				};
			})
			.sort((a, b) => b.count - a.count);

		return languages;
	}, [builders]);

	// Load language colors
	useEffect(() => {
		const loadColors = async () => {
			const colors: Record<string, string> = {};
			for (const language of languageData) {
				const color = await getLanguageDotColor(language.name);
				colors[language.name] = color;
			}
			setLanguageColors(colors);
		};
		loadColors();
	}, [languageData]);

	// Calculate chart dimensions and angles
	const chartSize = 200;
	const trackWidth = 8;
	const radius = (chartSize - trackWidth) / 2;
	const center = chartSize / 2;

	// Calculate angles for each language segment
	const totalCount = languageData.reduce((sum, lang) => sum + lang.count, 0);
	let currentAngle = -Math.PI / 2; // Start from top

	const languageSegments = languageData.map((language) => {
		const angle = (language.count / totalCount) * 2 * Math.PI;
		const startAngle = currentAngle;
		const endAngle = currentAngle + angle;
		currentAngle = endAngle;

		// Calculate path for the track segment
		const innerRadius = radius - trackWidth / 2;
		const outerRadius = radius + trackWidth / 2;

		const x1 = center + innerRadius * Math.cos(startAngle);
		const y1 = center + innerRadius * Math.sin(startAngle);
		const x2 = center + innerRadius * Math.cos(endAngle);
		const y2 = center + innerRadius * Math.sin(endAngle);

		const x3 = center + outerRadius * Math.cos(endAngle);
		const y3 = center + outerRadius * Math.sin(endAngle);
		const x4 = center + outerRadius * Math.cos(startAngle);
		const y4 = center + outerRadius * Math.sin(startAngle);

		const largeArcFlag = angle > Math.PI ? 1 : 0;

		const path = [
			`M ${x1} ${y1}`,
			`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
			`L ${x3} ${y3}`,
			`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
			`Z`,
		].join(" ");

		return {
			...language,
			path,
			startAngle,
			endAngle,
			centerAngle: (startAngle + endAngle) / 2,
		};
	});

	const handleLanguageClick = (languageName: string) => {
		setSelectedLanguage(
			selectedLanguage === languageName ? null : languageName
		);
	};

	const selectedLanguageData = selectedLanguage
		? languageData.find((lang) => lang.name === selectedLanguage)
		: null;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
					BY LANGUAGES
				</h2>
				<button
					onClick={() => setIsSectionExpanded(!isSectionExpanded)}
					className="text-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
				>
					{isSectionExpanded ? "—" : "+"}
				</button>
			</div>

			{isSectionExpanded && (
				<div className="space-y-6">
					{/* Circular Track Chart */}
					<div className="flex justify-center">
						<div className="relative">
							<svg
								width={chartSize}
								height={chartSize}
								className="cursor-pointer"
								viewBox={`0 0 ${chartSize} ${chartSize}`}
							>
								{/* Background circle */}
								<circle
									cx={center}
									cy={center}
									r={radius}
									fill="none"
									stroke="rgb(51 65 85 / 0.3)"
									strokeWidth={trackWidth}
								/>

								{/* Language segments */}
								{languageSegments.map((segment) => (
									<g key={segment.name}>
										<path
											d={segment.path}
											fill={
												languageColors[segment.name] ||
												"#6b7280"
											}
											opacity={
												selectedLanguage &&
												selectedLanguage !==
													segment.name
													? 0.3
													: 1
											}
											className="transition-all duration-200 hover:opacity-80 cursor-pointer"
											onClick={() =>
												handleLanguageClick(
													segment.name
												)
											}
										/>

										{/* No labels on track - only show in center */}
									</g>
								))}
							</svg>

							{/* Center info */}
							{!selectedLanguage && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
									<div className="text-center">
										<div className="text-2xl font-mono text-foreground">
											{totalCount}
										</div>
										<div className="text-xs text-muted-foreground font-mono">
											languages
										</div>
									</div>
								</div>
							)}

							{/* Selected language info */}
							{selectedLanguage && (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
									<div className="text-center">
										<div className="text-lg font-mono text-foreground">
											{selectedLanguage}
										</div>
										<div className="text-xs text-muted-foreground font-mono">
											{selectedLanguageData?.count}{" "}
											builders
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Language Legend */}
					<div className="space-y-3">
						<div className="flex justify-center flex-wrap gap-4">
							{(showAllLanguages
								? languageData
								: languageData.slice(0, 10)
							).map((language) => (
								<div
									key={language.name}
									className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
									onClick={() =>
										handleLanguageClick(language.name)
									}
								>
									<div
										className="w-2 h-2 rounded-full"
										style={{
											backgroundColor:
												languageColors[language.name] ||
												"#6b7280",
										}}
									/>
									<span className="text-xs text-muted-foreground/60 font-mono">
										{language.name}
									</span>
									<span className="text-xs text-muted-foreground/40">
										({language.count})
									</span>
								</div>
							))}
						</div>

						{languageData.length > 5 && (
							<div className="text-center pt-2">
								<button
									onClick={() =>
										setShowAllLanguages(!showAllLanguages)
									}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
								>
									{showAllLanguages
										? "show less"
										: "show more"}
								</button>
							</div>
						)}
					</div>

					{/* Selected Language Builders */}
					{selectedLanguage && selectedLanguageData && (
						<div className="space-y-6">
							{/* Builders list with individual tabs */}
							<div className="divide-y">
								{selectedLanguageData.builders.map(
									(builderData) => {
										// Create a full Builder object for the BuilderDisplay component
										const fullBuilder: Builder = {
											username: builderData.username,
											theme: builderData.theme,
											profile: builderData.profile,
											repos: builderData.repos.filter(
												(repo) =>
													repo.language ===
													selectedLanguage
											),
										};

										return (
											<BuilderDisplay
												key={builderData.username}
												builder={fullBuilder}
												showOwner={false}
												className="py-6"
											/>
										);
									}
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
