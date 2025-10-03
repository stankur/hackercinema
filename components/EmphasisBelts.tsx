"use client";

import React from "react";
import BeltsMarquee from "./BeltsMarquee";

interface EmphasisBeltsProps {
	emphasis: string[];
	className?: string;
	startDirection?: "left" | "right";
}

export default function EmphasisBelts({
	emphasis,
	className,
	startDirection = "left",
}: EmphasisBeltsProps) {
	if (!emphasis || emphasis.length === 0) return null;

	return (
		<BeltsMarquee
			items={emphasis}
			beltSize={12}
			minLastBeltSize={5}
			className={className}
			itemClassName="inline-flex tracking-tight items-baseline gap-1 font-mono border border-muted-foreground/40 border-r-2 border-b-2 bg-muted/20 text-muted-foreground/70 rounded-sm py-2 px-1 font-bold leading-1.5 mx-2 md:mx-3 text-xs md:text-xs"
			speed={10}
			pauseOnHover={false}
			pauseOnClick={false}
			startDirection={startDirection}
		/>
	);
}
