"use client";

import React from "react";
import BeltsMarquee from "./BeltsMarquee";

interface KeywordsBeltsProps {
	keywords: string[];
	className?: string;
	startDirection?: "left" | "right";
}

export default function KeywordsBelts({
	keywords,
	className,
	startDirection = "left",
}: KeywordsBeltsProps) {
	if (!keywords || keywords.length === 0) return null;

	return (
		<BeltsMarquee
			items={keywords}
			beltSize={8}
			minLastBeltSize={3}
			className={className}
			itemClassName="mx-2 md:mx-3 text-sm md:text-base text-muted-foreground/70 font-semibold italic"
			speed={15}
			pauseOnHover={false}
			pauseOnClick={false}
			startDirection={startDirection}
		/>
	);
}
