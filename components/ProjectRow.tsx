"use client";

import ProjectCard from "./ProjectCard";
import { type Project } from "./ProjectItem";

interface ProjectRowProps {
	projects: [Project, Project?]; // First project required, second optional
	rowIndex: number;
	isLastRow: boolean;
	totalProjects: number;
}

export default function ProjectRow({
	projects,
	rowIndex,
	isLastRow,
	totalProjects,
}: ProjectRowProps) {
	const [leftProject, rightProject] = projects;

	return (
		<div className="hidden md:grid md:grid-cols-2">
			{/* Left column */}
			<div
				className={`
					${totalProjects === 1 ? "" : "border-r border-muted-foreground/20"}
					${rowIndex > 0 ? "border-t border-muted-foreground/20" : ""}
				`.trim()}
			>
				<ProjectCard
					project={leftProject}
					rowIndex={rowIndex}
					columnIndex={0}
					hasRightProject={!!rightProject}
				/>
			</div>

			{/* Right column */}
			<div
				className={`
					${rowIndex > 0 ? "border-t border-muted-foreground/20" : ""}
				`.trim()}
			>
				{rightProject && (
					<ProjectCard
						project={rightProject}
						rowIndex={rowIndex}
						columnIndex={1}
						hasRightProject={false}
					/>
				)}
			</div>
		</div>
	);
}
