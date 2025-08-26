import ExperienceItem, { type Experience } from "./ExperienceItem";

interface ExperienceSectionProps {
	experiences: Experience[];
}

export default function ExperienceSection({
	experiences,
}: ExperienceSectionProps) {
	if (experiences.length === 0) {
		return null;
	}

	return (
		<section className="space-y-4 md:space-y-5">
			<h2 className="text-xs font-bold tracking-wide text-muted-foreground uppercase mb-2">
				Experience
			</h2>
			<ul className="divide-y divide-muted-foreground/20 pl-4 md:pl-5">
				{experiences.map((experience) => (
					<ExperienceItem
						key={`${experience.org}-${experience.role}-${
							experience.period || "no-period"
						}`}
						experience={experience}
					/>
				))}
			</ul>
		</section>
	);
}
