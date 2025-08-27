"use client";

import WritingCard from "./WritingCard";
import { type Writing } from "@/lib/schemas";

interface WritingRowProps {
	writings: [Writing, Writing?]; // First writing required, second optional
	rowIndex: number;
}

export default function WritingRow({ writings, rowIndex }: WritingRowProps) {
	const [leftWriting, rightWriting] = writings;

	return (
		<div className="hidden md:grid md:grid-cols-2">
			{/* Left column */}
			<div
				className={`
					${rightWriting ? "border-r border-muted-foreground/20" : ""}
					${rowIndex > 0 ? "border-t border-muted-foreground/20" : ""}
				`.trim()}
			>
				<WritingCard
					writing={leftWriting}
					rowIndex={rowIndex}
					columnIndex={0}
					hasRightWriting={!!rightWriting}
				/>
			</div>

			{/* Right column */}
			<div
				className={`
					${rowIndex > 0 ? "border-t border-muted-foreground/20" : ""}
				`.trim()}
			>
				{rightWriting && (
					<WritingCard
						writing={rightWriting}
						rowIndex={rowIndex}
						columnIndex={1}
					/>
				)}
			</div>
		</div>
	);
}
