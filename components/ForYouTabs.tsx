"use client";

import { Users, TrendingUp, User, Newspaper } from "lucide-react";

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
		{ id: "community" as const, label: "Community", Icon: Users },
		{ id: "trending" as const, label: "Trending", Icon: TrendingUp },
		{ id: "people" as const, label: "People", Icon: User },
		{ id: "hackernews" as const, label: "Hacker News", Icon: Newspaper },
	];

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
							className={`relative inline-flex items-center gap-2 text-sm md:text-xs px-1 py-2 transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:rounded after:transition-all after:duration-200 ${
								isActive
									? "text-foreground/60 after:bg-foreground/60 after:opacity-100"
									: "text-muted-foreground/60 hover:text-foreground/80 after:opacity-0"
							}`}
						>
							<Icon size={14} className="md:hidden" />
							<Icon size={16} className="hidden md:inline" />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
