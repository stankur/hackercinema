"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

export type Experience = {
	emoji?: string;
	org: string;
	role: string;
	location?: string;
	period?: string;
	tech?: string[];
	highlights?: string[];
};

interface ExperienceItemProps {
	experience: Experience;
}

export default function ExperienceItem({ experience }: ExperienceItemProps) {
	const [activeTab, setActiveTab] = useState<"tech" | "highlights" | null>(
		null
	);

	const hasTech = experience.tech && experience.tech.length > 0;
	const hasHighlights =
		experience.highlights && experience.highlights.length > 0;

	const handleTabClick = (tab: "tech" | "highlights") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<li
			key={`${experience.org}-${experience.role}-${
				experience.period || "no-period"
			}`}
			className="py-6 space-y-2"
		>
			<div className="space-y-8">
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="text-lg font-semibold text-foreground leading-relaxed">
							{experience.role}
						</div>
						<div className="flex items-center gap-4">
							<div className="text-sm text-foreground">
								{experience.org}
							</div>
							{experience.location && (
								<span className="text-xs text-muted-foreground">
									{experience.location}
								</span>
							)}
						</div>
					</div>
					{experience.period &&
						experience.period.trim().length > 0 && (
							<div className="text-xs text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<Calendar className="w-3.5 h-3.5" />
									{experience.period}
								</span>
							</div>
						)}
				</div>

				{/* Tabs */}
				{(hasTech || hasHighlights) && (
					<div className="space-y-4">
						<div className="flex gap-6">
							{hasTech && (
								<button
									onClick={() => handleTabClick("tech")}
									className={`text-xs transition-colors ${
										activeTab === "tech"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Tech
								</button>
							)}
							{hasHighlights && (
								<button
									onClick={() => handleTabClick("highlights")}
									className={`text-xs transition-colors ${
										activeTab === "highlights"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Highlights
								</button>
							)}
						</div>

						{/* Tab Content */}
						{activeTab === "tech" && hasTech && (
							<div className="flex flex-wrap gap-1.5">
								{experience.tech!.map((tech, idx) => (
									<span
										key={idx}
										className="inline-flex items-center rounded-full bg-muted text-foreground px-2 py-0.5 text-[11px] leading-5"
									>
										{tech}
									</span>
								))}
							</div>
						)}

						{activeTab === "highlights" && hasHighlights && (
							<ul className="list-disc pl-5 text-sm text-foreground space-y-1 leading-relaxed">
								{experience.highlights!.map((h, idx) => (
									<li key={idx}>{h}</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</li>
	);
}
