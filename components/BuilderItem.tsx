"use client";

import BuilderDisplay from "./BuilderDisplay";
import type { Builder } from "@/lib/types";

interface BuilderItemProps {
	builder: Builder;
	autoExpand?: boolean;
}

export default function BuilderItem({
	builder,
	autoExpand = false,
}: BuilderItemProps) {
	return (
		<BuilderDisplay
			builder={builder}
			showOwner={false}
			autoExpand={autoExpand}
		/>
	);
}
