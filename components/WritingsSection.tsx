import WritingRow from "./WritingRow";
import WritingCard from "./WritingCard";
import { type Writing } from "@/lib/schemas";

interface WritingsSectionProps {
	writings: Writing[];
}

export default function WritingsSection({ writings }: WritingsSectionProps) {
	if (writings.length === 0) {
		return null;
	}

	// Group writings into pairs for desktop rows
	const writingPairs: [Writing, Writing?][] = [];
	for (let i = 0; i < writings.length; i += 2) {
		writingPairs.push([writings[i], writings[i + 1]]);
	}

	return (
		<section className="space-y-6">
			{/* Desktop: Row-based layout */}
			<div className="hidden md:block pl-4 md:pl-5">
				{writingPairs.map((pair, rowIndex) => (
					<WritingRow
						key={`row-${rowIndex}`}
						writings={pair}
						rowIndex={rowIndex}
					/>
				))}
			</div>

			{/* Mobile: Single column with current border logic */}
			<div className="md:hidden">
				{writings.map((writing, index) => (
					<div
						key={`${writing.title}-${writing.date || "no-date"}`}
						className={`
							${index >= 1 ? "border-t border-muted-foreground/20" : ""}
						`.trim()}
					>
						<WritingCard
							writing={writing}
							rowIndex={index}
							columnIndex={0}
							hasRightWriting={false}
						/>
					</div>
				))}
			</div>
		</section>
	);
}
