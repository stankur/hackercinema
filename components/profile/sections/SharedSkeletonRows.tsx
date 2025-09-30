"use client";

import Skeleton from "react-loading-skeleton";

interface SharedSkeletonRowsProps {
	count?: number;
	height?: number;
}

export default function SharedSkeletonRows({
	count = 5,
	height = 100,
}: SharedSkeletonRowsProps) {
	return (
		<div className="space-y-6">
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} height={height} />
			))}
		</div>
	);
}
