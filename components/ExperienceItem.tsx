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
	const [activeTab, setActiveTab] = useState<"tech" | "details" | null>(null);

	const hasTech = experience.tech && experience.tech.length > 0;
	const hasDetails =
		(experience.location && experience.location.trim().length > 0) ||
		(experience.highlights && experience.highlights.length > 0);

	const handleTabClick = (tab: "tech" | "details") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<li
			key={`${experience.org}-${experience.role}-${
				experience.period || "no-period"
			}`}
			className="py-10 space-y-2 px-6"
		>
			<div className="space-y-8">
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="text-xl font-semibold text-foreground leading-relaxed">
							{experience.org}
						</div>
						<div className="text-sm text-foreground font-light">
							{experience.role}
						</div>
					</div>
					{experience.period &&
						experience.period.trim().length > 0 && (
							<div className="text-xs font-mono">
								<span className="inline-flex items-center gap-1.5">
									<Calendar className="w-3.5 h-3.5" />
									{experience.period}
								</span>
							</div>
						)}
				</div>

				{/* Tabs */}
				{(hasTech || hasDetails) && (
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
							{hasDetails && (
								<button
									onClick={() => handleTabClick("details")}
									className={`text-xs transition-colors ${
										activeTab === "details"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Details
								</button>
							)}
						</div>

						{/* Tab Content */}
						{activeTab === "tech" && hasTech && (
							<div className="flex flex-wrap gap-1.5">
								{experience.tech!.map((tech, idx) => (
									<span
										key={idx}
										className="inline-flex font-light items-center rounded-full bg-muted text-foreground px-2 py-0.5 text-[11px] leading-5"
									>
										{tech}
									</span>
								))}
							</div>
						)}

						{activeTab === "details" && hasDetails && (
							<div className="space-y-3 font-light">
								{experience.location &&
									experience.location.trim().length > 0 && (
										<div className="text-sm text-muted-foreground">
											{experience.location}
										</div>
									)}
								{experience.highlights &&
									experience.highlights.length > 0 && (
										<ul className="list-disc pl-5 text-sm text-foreground space-y-4 leading-relaxed">
											{experience.highlights.map(
												(h, idx) => (
													<li key={idx}>{h}</li>
												)
											)}
										</ul>
									)}
							</div>
						)}
					</div>
				)}
			</div>
		</li>
	);
}
