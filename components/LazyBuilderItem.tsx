"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BuilderItem from "./BuilderItem";
import type { Builder } from "@/lib/types";

interface LazyBuilderItemProps {
	builder: Builder;
	autoExpand?: boolean;
}

export default function LazyBuilderItem({
	builder,
	autoExpand = false,
}: LazyBuilderItemProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const itemRef = useRef<HTMLDivElement>(null);

	// Intersection Observer callback
	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const entry = entries[0];
			if (entry.isIntersecting) {
				setIsVisible(true);
				// Start loading when item comes into view
				setShouldRender(true);
			}
		},
		[]
	);

	// Set up Intersection Observer
	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: "100px", // Start loading 100px before item comes into view
			threshold: 0.1,
		});

		const currentRef = itemRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [handleIntersection]);

	return (
		<div
			ref={itemRef}
			className={`
				transition-all duration-700 ease-out
				${isVisible ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-95"}
			`}
		>
			{shouldRender ? (
				<BuilderItem builder={builder} autoExpand={autoExpand} />
			) : (
				// Placeholder while not rendered
				<div className="py-8">
					<div className="flex items-start gap-4 mb-8">
						<div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
						<div className="flex-1 min-w-0">
							<div className="h-6 bg-muted rounded animate-pulse mb-2" />
							<div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
						<div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
					</div>
				</div>
			)}
		</div>
	);
}
