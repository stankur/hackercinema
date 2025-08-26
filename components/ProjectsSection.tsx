import ProjectItem, { type Project } from "./ProjectItem";

interface ProjectsSectionProps {
	projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
	if (projects.length === 0) {
		return null;
	}

	return (
		<section className="space-y-4 md:space-y-5">
			<h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2">
				Projects
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 pl-4 md:pl-5">
				{projects.map((project, index) => (
					<div
						key={`${project.name}-${project.period || "no-period"}`}
						className={`
							${index % 2 === 0 ? "md:border-r border-muted-foreground/20" : ""}
							${index >= 1 ? "border-t border-muted-foreground/20" : ""}
							${
								Math.floor(index / 2) >= 1
									? "md:border-t border-muted-foreground/20"
									: "md:border-t-0"
							}
							${
								projects.length % 2 === 1 &&
								index === projects.length - 2
									? "md:border-b border-muted-foreground/20"
									: ""
							}
							py-4 md:py-5
							${index % 2 === 0 ? "md:pr-5" : "md:pl-5"}
						`.trim()}
					>
						<ProjectItem project={project} />
					</div>
				))}
			</div>
		</section>
	);
}
