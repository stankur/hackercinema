"use client";

import { useState } from "react";

export type Project = {
	emoji?: string;
	name: string;
	subtitle?: string;
	period?: string;
	tech?: string[];
	details?: string[];
};

interface ProjectItemProps {
	project: Project;
}

export default function ProjectItem({ project }: ProjectItemProps) {
	const [activeTab, setActiveTab] = useState<"tech" | "details" | null>(null);

	const hasTech = project.tech && project.tech.length > 0;
	const hasDetails = project.details && project.details.length > 0;

	const handleTabClick = (tab: "tech" | "details") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<div
			key={`${project.name}-${project.period || "no-period"}`}
			className="space-y-2"
		>
			<div className="space-y-8">
				<div className="space-y-2">
					<div className="text-lg font-semibold text-foreground leading-relaxed">
						{project.name}
					</div>
					{project.subtitle && (
						<p className="text-sm text-muted-foreground">
							{project.subtitle}
						</p>
					)}
					{project.period && (
						<div className="text-xs text-muted-foreground">
							{project.period}
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
								{project.tech!.map((tech, idx) => (
									<span
										key={idx}
										className="inline-flex items-center rounded-full bg-muted text-foreground px-2 py-0.5 text-[11px] leading-5"
									>
										{tech}
									</span>
								))}
							</div>
						)}

						{activeTab === "details" && hasDetails && (
							<ul className="list-disc pl-5 text-sm text-foreground space-y-1 leading-relaxed">
								{project.details!.map((d, idx) => (
									<li key={idx}>{d}</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
