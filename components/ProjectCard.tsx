"use client";

import { useState } from "react";
import { type Project } from "./ProjectItem";
import { useTabSync } from "../hooks/useTabSync";

interface ProjectCardProps {
	project: Project;
	rowIndex: number;
	columnIndex: number;
}

export default function ProjectCard({
	project,
	rowIndex,
	columnIndex,
}: ProjectCardProps) {
	const [activeTab, setActiveTab] = useState<"tech" | "details" | null>(null);

	const hasTech = project.tech && project.tech.length > 0;
	const hasDetails =
		(project.period && project.period.trim().length > 0) ||
		(project.details && project.details.length > 0);

	const { contentRef, tabsRef } = useTabSync({
		rowIndex,
		columnIndex,
		isActive: activeTab !== null,
	});

	const handleTabClick = (tab: "tech" | "details") => {
		setActiveTab(activeTab === tab ? null : tab);
	};

	return (
		<div className="h-full" data-row={rowIndex}>
			{/* Content Track - height synchronized across row */}
			<div
				ref={contentRef}
				data-content
				className={`relative flex flex-col py-4 md:py-5 ${
					columnIndex === 0 
						? "pr-4 md:pr-5" // Left column: only right padding
						: "pl-4 md:pl-5" // Right column: only left padding
				}`}
				style={{ transition: "height 0.2s ease" }}
			>
				{/* Project Info - natural height with bottom margin for tab spacing */}
				<div className="space-y-2 flex-1 mb-8">
					<div className="text-xl font-semibold text-foreground leading-relaxed">
						{project.name}
					</div>
					{project.subtitle && (
						<p className="text-base text-muted-foreground">
							{project.subtitle}
						</p>
					)}
				</div>

				{/* Tabs - positioned at bottom of content area - LOCKED POSITION */}
				{(hasTech || hasDetails) && (
					<div
						ref={tabsRef}
						data-tabs
						className="absolute bottom-4 md:bottom-5 left-4 md:left-5 right-4 md:right-5"
					>
						<div className="flex gap-6">
							{hasTech && (
								<button
									onClick={() => handleTabClick("tech")}
									className={`text-xs transition-colors ${
										activeTab === "tech"
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
									aria-expanded={activeTab === "tech"}
									aria-controls={`${project.name}-tech-panel`}
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
									aria-expanded={activeTab === "details"}
									aria-controls={`${project.name}-details-panel`}
								>
									Details
								</button>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Expansion Track - ONLY expanded content, completely independent */}
			<div className="px-4 md:px-5">
				{activeTab === "tech" && hasTech && (
					<div
						id={`${project.name}-tech-panel`}
						role="tabpanel"
						className="pt-4 pb-4 md:pb-5"
					>
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
					</div>
				)}

				{activeTab === "details" && hasDetails && (
					<div
						id={`${project.name}-details-panel`}
						role="tabpanel"
						className="pt-4 pb-4 md:pb-5 space-y-3"
					>
						{project.period && project.period.trim().length > 0 && (
							<div className="text-xs text-muted-foreground">
								{project.period}
							</div>
						)}
						{project.details && project.details.length > 0 && (
							<ul className="list-disc pl-5 text-sm text-foreground space-y-1 leading-relaxed">
								{project.details.map((d, idx) => (
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
