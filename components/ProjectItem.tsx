"use client";

import { useState } from "react";

export type Project = {
	emoji?: string;
	name: string;
	subtitle?: string;
	period?: string;
	tech?: string[];
	details?: string[];
	links?: {
		website?: string;
		youtube?: string;
		github?: string;
	};
};

interface ProjectItemProps {
	project: Project;
}

export default function ProjectItem({ project }: ProjectItemProps) {
	const [activeTab, setActiveTab] = useState<
		"tech" | "details" | "links" | null
	>(null);

	const hasTech = project.tech && project.tech.length > 0;
	const hasDetails =
		(project.period && project.period.trim().length > 0) ||
		(project.details && project.details.length > 0);
	const hasLinks =
		project.links &&
		(project.links.website ||
			project.links.youtube ||
			project.links.github);

	const handleTabClick = (tab: "tech" | "details" | "links") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<div
			key={`${project.name}-${project.period || "no-period"}`}
			className="space-y-2 h-full"
		>
			<div className="gap-8 flex flex-col justify-between">
				<div className="space-y-2">
					<div className="text-xl font-semibold text-foreground leading-relaxed">
						{project.name}
					</div>
					{project.subtitle && (
						<p className="text-base text-muted-foreground">
							{project.subtitle}
						</p>
					)}
				</div>

				{/* Tabs */}
				{(hasTech || hasDetails || hasLinks) && (
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
							{hasLinks && (
								<button
									onClick={() => handleTabClick("links")}
									className={`text-xs transition-colors ${
										activeTab === "links"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									Links
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
							<div className="space-y-3">
								{project.period &&
									project.period.trim().length > 0 && (
										<div className="text-xs text-muted-foreground">
											{project.period}
										</div>
									)}
								{project.details &&
									project.details.length > 0 && (
										<ul className="list-disc pl-5 text-sm text-foreground space-y-1 leading-relaxed">
											{project.details.map((d, idx) => (
												<li key={idx}>{d}</li>
											))}
										</ul>
									)}
							</div>
						)}

						{activeTab === "links" && hasLinks && (
							<div className="space-y-3">
								{project.links?.website && (
									<a
										href={project.links.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-foreground underline"
									>
										Website
									</a>
								)}
								{project.links?.youtube && (
									<a
										href={project.links.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-foreground underline"
									>
										YouTube
									</a>
								)}
								{project.links?.github && (
									<a
										href={project.links.github}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-muted-foreground hover:text-foreground underline"
									>
										GitHub
									</a>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
