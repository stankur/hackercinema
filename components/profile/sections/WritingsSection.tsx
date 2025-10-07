"use client";

interface Writing {
	title: string;
	link: string;
	description?: string;
	date?: string;
}

interface WritingsSectionProps {
	writings: Writing[];
}

export default function WritingsSection({ writings }: WritingsSectionProps) {
	return (
		<div className="space-y-6">
			{writings.map((writing, index) => (
				<div key={index} className="space-y-2">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
						<div className="flex-1 min-w-0">
							<h3 className="text-sm font-medium text-foreground leading-tight">
								<a
									href={writing.link}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:opacity-80 transition-opacity"
								>
									{writing.title}
								</a>
							</h3>
							{writing.description && (
								<p className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">
									{writing.description}
								</p>
							)}
						</div>
						{writing.date && (
							<div className="text-xs text-muted-foreground font-mono sm:whitespace-nowrap">
								{writing.date}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
