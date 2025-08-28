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
		<section className="space-y-3">
			<ul>
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
