"use client";

import { type Writing } from "@/lib/schemas";

interface WritingCardProps {
	writing: Writing;
	rowIndex: number;
	columnIndex: number;
	hasRightWriting?: boolean;
}

export default function WritingCard({
	writing,
	rowIndex,
	columnIndex,
	hasRightWriting = true,
}: WritingCardProps) {
	return (
		<div className="h-full" data-row={rowIndex}>
			{/* Content Track - height synchronized across row */}
			<div
				data-writing-content
				className={`relative flex flex-col p-4 md:p-5 ${
					// Add padding on all sides for both mobile and desktop
					columnIndex === 0
						? "md:pr-6" // Left column: extra right padding for border
						: "md:pl-6" // Right column: extra left padding for border
				}`}
				style={{ transition: "height 0.2s ease" }}
			>
				{/* Writing Info - natural height with bottom margin for tab spacing */}
				<div
					className={`space-y-3 flex-1 ${
						hasRightWriting ? "mb-8" : "mb-2"
					}`}
				>
					<div className="text-lg font-semibold text-foreground leading-relaxed">
						<a
							href={writing.link}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline transition-colors"
						>
							{writing.title}
						</a>
					</div>
					{writing.description && (
						<p className="text-sm font-light">
							{writing.description}
						</p>
					)}
					{writing.date && (
						<div className="text-xs text-muted-foreground font-mono">
							{writing.date}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
