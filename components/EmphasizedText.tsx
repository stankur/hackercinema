"use client";
import React from "react";

interface EmphasizedTextProps {
	text: string;
	emphasisWords: string[];
	colorClass?: string;
}

/**
 * Component that highlights emphasized words in a text string by wrapping them in styled spans
 */
export default function EmphasizedText({
	text,
	emphasisWords,
	colorClass,
}: EmphasizedTextProps) {
	if (!emphasisWords || emphasisWords.length === 0) {
		if (typeof window !== "undefined") {
			console.debug("[EmphasizedText] no emphasis words", {
				textPreview: text?.slice?.(0, 100),
			});
		}
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

	if (typeof window !== "undefined") {
		const matched = parts.filter((part) =>
			emphasisWords.some((w) => part.toLowerCase() === w.toLowerCase())
		);
		console.debug("[EmphasizedText] matches", {
			textPreview: text.slice(0, 100),
			emphasisWords,
			matchedUnique: Array.from(new Set(matched)),
		});
	}

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
					className={`inline-flex tracking-tight items-baseline gap-1 font-mono border border-muted-foreground/50 border-r-2 border-b-2 bg-muted/70 rounded-sm py-2 px-1 font-bold leading-1.5 ${
						colorClass || ""
					}`}
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
