"use client";

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
				mb-16 transition-all duration-700 ease-out
				${
					visibleSections.has("tabs")
						? "opacity-100 blur-0 scale-100"
						: "opacity-0 blur-sm scale-95"
				}
			`}
		>
			<div className="flex flex-wrap gap-6 sm:gap-10">
				{visibleTabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`text-xs font-mono tracking-widest uppercase transition-all px-3 py-2 rounded-full border ${
							activeTab === tab.id
								? "text-foreground border-foreground"
								: "text-muted-foreground border-muted-foreground/30 hover:text-foreground hover:border-foreground/50"
						}`}
					>
						<span className="inline-flex items-center gap-2">
							{tab.label}
							{tab.loading && (
								<span className="inline-block w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-transparent animate-spin" />
							)}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
