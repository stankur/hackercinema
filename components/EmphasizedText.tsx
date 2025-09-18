"use client";
import React from "react";

interface EmphasizedTextProps {
	text: string;
	emphasisWords: string[];
}

/**
 * Component that highlights emphasized words in a text string by wrapping them in styled spans
 */
export default function EmphasizedText({
	text,
	emphasisWords,
}: EmphasizedTextProps) {
	if (!emphasisWords || emphasisWords.length === 0) {
		return <>{text}</>;
	}

	// Create a regex pattern that matches any of the emphasis words (case-insensitive)
	// Escape special regex characters in the emphasis words
	const escapedWords = emphasisWords.map((word) =>
		word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	);

	// Sort by length (longest first) to avoid partial matches
	const sortedWords = escapedWords.sort((a, b) => b.length - a.length);
	const pattern = new RegExp(`(${sortedWords.join("|")})`, "gi");

	// Split the text by the pattern while preserving the matched words
	const parts = text.split(pattern);

	const result: React.ReactNode[] = [];

	parts.forEach((part, index) => {
		// Check if this part is one of the emphasis words
		const isEmphasis = emphasisWords.some(
			(word) => part.toLowerCase() === word.toLowerCase()
		);

		if (isEmphasis) {
			result.push(
				<span
					key={`emphasis-${index}`}
					className="inline-flex tracking-tight items-baseline gap-1 font-mono font-extrabold leading-1.5"
				>
					<span>{part}</span>
				</span>
			);
		} else if (part) {
			result.push(part);
		}
	});

	return <>{result}</>;
}
