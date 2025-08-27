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
			<div className="flex gap-4 items-center">
				<h2 className="text-xl font-mono tracking-widest uppercase">
					Experience
				</h2>
				<div className="h-0 flex-1 border-b-[0.1px] border-slate-600" />
			</div>
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
