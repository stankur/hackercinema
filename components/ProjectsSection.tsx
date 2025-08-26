import ProjectRow from "./ProjectRow";
import ProjectCard from "./ProjectCard";
import { type Project } from "./ProjectItem";

interface ProjectsSectionProps {
	projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
	if (projects.length === 0) {
		return null;
	}

	// Group projects into pairs for desktop rows
	const projectPairs: [Project, Project?][] = [];
	for (let i = 0; i < projects.length; i += 2) {
		projectPairs.push([projects[i], projects[i + 1]]);
	}

	return (
		<section className="space-y-4 md:space-y-5">
			<h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase mb-2">
				Projects
			</h2>

			{/* Desktop: Row-based layout */}
			<div className="hidden md:block pl-5">
				{projectPairs.map((pair, rowIndex) => (
					<ProjectRow
						key={`row-${rowIndex}`}
						projects={pair}
						rowIndex={rowIndex}
					/>
				))}
			</div>

			{/* Mobile: Single column with current border logic */}
			<div className="md:hidden pl-4">
				{projects.map((project, index) => (
					<div
						key={`${project.name}-${project.period || "no-period"}`}
						className={`
							${index >= 1 ? "border-t border-muted-foreground/20" : ""}
						`.trim()}
					>
						<ProjectCard
							project={project}
							rowIndex={index}
							columnIndex={0}
						/>
					</div>
				))}
			</div>
		</section>
	);
}
