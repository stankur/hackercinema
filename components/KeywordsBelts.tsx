"use client";
import React from "react";
import Marquee from "react-fast-marquee";

interface KeywordsBeltsProps {
	keywords: string[];
	className?: string;
}

function dedupeKeywordsCaseInsensitive(
	keywords: string[],
	cap: number
): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const raw of keywords) {
		const trimmed = (raw || "").trim();
		if (!trimmed) continue;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(trimmed);
		if (result.length >= cap) break;
	}
	return result;
}

function chunkIntoBelts(items: string[], beltSize: number): string[][] {
	const belts: string[][] = [];
	for (let i = 0; i < items.length; i += beltSize) {
		belts.push(items.slice(i, i + beltSize));
	}
	return belts;
}

// helper removed

export default function KeywordsBelts({
	keywords,
	className,
}: KeywordsBeltsProps) {
	const deduped = dedupeKeywordsCaseInsensitive(keywords, 150);
	if (deduped.length === 0) return null;

	// Create belts of up to 5 items each; do NOT force repeat to 5
	const belts = chunkIntoBelts(deduped, 5);

	return (
		<div className={`w-full ${className || ""}`}>
			<div className="space-y-2 md:space-y-4">
				{belts.map((items, idx) => (
					<div key={idx} className="kb-belt-mask">
						<Marquee
							autoFill
							speed={20}
							pauseOnHover={false}
							pauseOnClick={false}
							gradient={false}
							direction={idx % 2 === 1 ? "right" : "left"}
						>
							{items.map((kw, i) => (
								<span
									key={`${idx}-${i}-${kw}`}
									className="mx-2 md:mx-3 text-sm md:text-base text-muted-foreground/70 font-semibold italic"
								>
									{kw}
								</span>
							))}
						</Marquee>
					</div>
				))}
			</div>

			<style jsx>{`
				.kb-belt-mask {
					--fade: 100px;
					overflow: hidden;
					-webkit-mask-image: linear-gradient(
						to right,
						transparent 0,
						black var(--fade),
						black calc(100% - var(--fade)),
						transparent 100%
					);
					mask-image: linear-gradient(
						to right,
						transparent 0,
						black var(--fade),
						black calc(100% - var(--fade)),
						transparent 100%
					);
				}
				@media (max-width: 768px) {
					.kb-belt-mask {
						--fade: 50px;
					}
				}
			`}</style>
		</div>
	);
}
