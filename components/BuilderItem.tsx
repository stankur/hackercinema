"use client";

import BuilderDisplay from "./BuilderDisplay";
import type { Builder } from "@/lib/types";

interface BuilderItemProps {
	builder: Builder;
}

export default function BuilderItem({ builder }: BuilderItemProps) {
	return <BuilderDisplay builder={builder} showOwner={false} />;
}
