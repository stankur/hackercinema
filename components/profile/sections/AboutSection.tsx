"use client";

interface AboutSectionProps {
	about: string;
}

export default function AboutSection({ about }: AboutSectionProps) {
	return (
		<div className="space-y-6">
			{about.split("\n\n").map((paragraph: string, index: number) => {
				// Check if this paragraph is a list (starts with bullet points)
				if (paragraph.includes("\n- ")) {
					const lines = paragraph.split("\n");
					const beforeList = lines.find(
						(line) => !line.startsWith("- ") && line.trim() !== ""
					);
					const listItems = lines.filter((line) =>
						line.startsWith("- ")
					);

					return (
						<div key={index}>
							{beforeList && (
								<p className="text-sm leading-relaxed text-muted-foreground font-light mb-3">
									{beforeList}
								</p>
							)}
							<ul className="text-sm leading-relaxed text-muted-foreground font-light space-y-1 list-disc list-inside">
								{listItems.map((item, itemIndex) => (
									<li key={itemIndex}>{item.substring(2)}</li>
								))}
							</ul>
						</div>
					);
				}

				// Regular paragraph
				return (
					<p
						key={index}
						className="text-sm leading-relaxed text-muted-foreground font-light"
					>
						{paragraph}
					</p>
				);
			})}
		</div>
	);
}
