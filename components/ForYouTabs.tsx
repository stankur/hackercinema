"use client";

import { Users, TrendingUp, User, Newspaper } from "lucide-react";
import { Pixelify_Sans } from "next/font/google";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

interface ForYouTabsProps {
	activeTab: "community" | "trending" | "people" | "hackernews";
	setActiveTab: (
		tab: "community" | "trending" | "people" | "hackernews"
	) => void;
}

export default function ForYouTabs({
	activeTab,
	setActiveTab,
}: ForYouTabsProps) {
	const tabs = [
		{
			id: "community" as const,
			label: "Community",
			Icon: Users,
			isPrimary: true,
		},
		{ id: "people" as const, label: "People", Icon: User, isPrimary: true },
		{
			id: "trending" as const,
			label: "Trending",
			Icon: TrendingUp,
			isPrimary: false,
		},
		{
			id: "hackernews" as const,
			label: "Hacker News",
			Icon: Newspaper,
			isPrimary: false,
		},
	];

	const renderRainbowText = (text: string) => {
		const colors = [
			"text-rose-500",
			"text-orange-500",
			"text-amber-500",
			"text-lime-500",
			"text-emerald-500",
			"text-teal-500",
			"text-sky-500",
		];

		return Array.from(text).map((char, idx) => (
			<span
				key={idx}
				className={char === " " ? "" : colors[idx % colors.length]}
			>
				{char}
			</span>
		));
	};

	return (
		<div className="mb-8">
			<div role="tablist" className="flex justify-start gap-4">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					const { Icon } = tab;
					return (
						<button
							key={tab.id}
							role="tab"
							aria-selected={isActive}
							onClick={() => setActiveTab(tab.id)}
							className={`relative inline-flex items-center gap-2 px-1 py-2 transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:rounded after:transition-all after:duration-200 ${
								isActive
									? "after:bg-foreground/60 after:opacity-100"
									: "after:opacity-0"
							} ${
								tab.isPrimary
									? "text-base md:text-lg font-bold"
									: isActive
									? "text-sm md:text-xs text-foreground/60"
									: "text-sm md:text-xs text-muted-foreground/60 hover:text-foreground/80"
							}`}
						>
							<Icon
								size={tab.isPrimary ? 18 : 14}
								className="md:hidden"
							/>
							<Icon
								size={tab.isPrimary ? 20 : 16}
								className="hidden md:inline"
							/>
							{tab.isPrimary ? (
								<span className={pixelFont.className}>
									{renderRainbowText(tab.label.toUpperCase())}
								</span>
							) : (
								<span>{tab.label}</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
