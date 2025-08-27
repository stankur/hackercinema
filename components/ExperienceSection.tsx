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
				<h2 className="text-lg font-mono tracking-wide uppercase">
					Experience
				</h2>
				<div className="h-0 flex-1 border-b-[0.1px] border-slate-300" />
			</div>
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
