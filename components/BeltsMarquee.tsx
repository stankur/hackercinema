"use client";

import React from "react";
import Marquee from "react-fast-marquee";

interface BeltsMarqueeProps {
	items: string[];
	className?: string;
	itemClassName?: string;
	beltSize?: number;
	minLastBeltSize?: number;
	cap?: number;
	speed?: number;
	pauseOnHover?: boolean;
	pauseOnClick?: boolean;
	startDirection?: "left" | "right";
}

function dedupeCaseInsensitive(items: string[], cap: number): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const raw of items) {
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

function chunkAndSpread(
	items: string[],
	beltSize: number,
	minLastBeltSize: number
): string[][] {
	// 1) naive chunk
	const belts: string[][] = [];
	for (let i = 0; i < items.length; i += beltSize) {
		belts.push(items.slice(i, i + beltSize));
	}
	if (belts.length <= 1) return belts;

	// 2) rebalance from right to left to avoid tiny final belts
	for (let i = belts.length - 1; i > 0; i--) {
		while (
			belts[i].length < minLastBeltSize &&
			belts[i - 1].length > minLastBeltSize
		) {
			const moved = belts[i - 1].pop();
			if (!moved) break;
			belts[i].unshift(moved);
			if (belts[i].length >= minLastBeltSize) break;
		}
	}
	return belts;
}

export default function BeltsMarquee({
	items,
	className,
	itemClassName = "",
	beltSize = 8,
	minLastBeltSize = 3,
	cap = 150,
	speed = 20,
	pauseOnHover = false,
	pauseOnClick = false,
	startDirection = "left",
}: BeltsMarqueeProps) {
	const deduped = dedupeCaseInsensitive(items, cap);
	if (deduped.length === 0) return null;

	const belts = chunkAndSpread(deduped, beltSize, minLastBeltSize);

	return (
		<div className={`w-full ${className || ""}`}>
			<div className="space-y-2 md:space-y-4">
				{belts.map((beltItems, beltIndex) => (
					<div key={`belt-${beltIndex}`} className="kb-belt-mask">
						<Marquee
							autoFill
							speed={speed}
							pauseOnHover={pauseOnHover}
							pauseOnClick={pauseOnClick}
							gradient={false}
							direction={
								((startDirection === "right" ? 1 : 0) +
									beltIndex) %
									2 ===
								1
									? "right"
									: "left"
							}
						>
							{beltItems.map((text, itemIndex) => (
								<span
									key={`belt-item-${beltIndex}-${itemIndex}-${text}`}
									className={itemClassName}
								>
									{text}
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
