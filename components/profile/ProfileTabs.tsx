"use client";

import { Clock, Info, Star } from "lucide-react";

interface Tab {
	id: string;
	label: string;
	loading?: boolean;
}

interface ProfileTabsProps {
	visibleTabs: Tab[];
	activeTab: string;
	setActiveTab: (tabId: string) => void;
	visibleSections: Set<string>;
}

export default function ProfileTabs({
	visibleTabs,
	activeTab,
	setActiveTab,
	visibleSections,
}: ProfileTabsProps) {
	// Don't render if there's only one tab or no tabs
	if (visibleTabs.length <= 1) {
		return null;
	}

	return (
		<div
			data-section="tabs"
			className={`
				transition-all duration-700 ease-out
				${
					visibleSections.has("tabs")
						? "opacity-100 blur-0 scale-100"
						: "opacity-0 blur-sm scale-95"
				}
			`}
		>
			{(() => {
				const allowed = new Set(["highlights", "recent", "about"]);
				const order = ["highlights", "recent", "about"] as const;
				const filtered = visibleTabs
					.filter((t) => allowed.has(t.id))
					.sort(
						(a, b) =>
							order.indexOf(a.id as (typeof order)[number]) -
							order.indexOf(b.id as (typeof order)[number])
					);

				return (
					<div role="tablist" className="flex justify-start gap-4">
						{filtered.map((tab) => {
							const isActive = activeTab === tab.id;
							const Icon =
								tab.id === "highlights"
									? Star
									: tab.id === "recent"
									? Clock
									: Info;
							return (
								<button
									key={tab.id}
									role="tab"
									aria-selected={isActive}
									onClick={() => setActiveTab(tab.id)}
									className={`relative inline-flex items-center gap-2 text-xs md:text-xs px-1 py-2 transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:rounded after:transition-all after:duration-200 ${
										isActive
											? "text-foreground/60 after:bg-foreground/60 after:opacity-100"
											: "text-muted-foreground/60 hover:text-foreground/80 after:opacity-0"
									}`}
								>
									<Icon size={14} className="md:hidden" />
									<Icon
										size={16}
										className="hidden md:inline"
									/>
									<span>
										{tab.id === "recent"
											? "Recent"
											: tab.id === "highlights"
											? "Highlights"
											: "About"}
									</span>
									{tab.loading && (
										<span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
									)}
								</button>
							);
						})}
					</div>
				);
			})()}
		</div>
	);
}
