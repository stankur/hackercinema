"use client";

interface WorkingOnSectionProps {
	workingOn: string;
}

export default function WorkingOnSection({ workingOn }: WorkingOnSectionProps) {
	return (
		<div className="space-y-6">
			<p className="text-sm leading-relaxed text-foreground font-light">
				{workingOn}
			</p>
		</div>
	);
}
