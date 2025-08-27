import { cn } from "@/lib/utils";

interface ShimmerProps {
	children: React.ReactNode;
	className?: string;
	active?: boolean;
}

export function Shimmer({ children, active = true, className }: ShimmerProps) {
	if (!active) {
		return <>{children}</>;
	}

	return (
		<span
			className={cn(
				"inline-block",
				"bg-gradient-to-r from-white/30 via-white/80 to-white/30",
				"bg-[length:200%_100%] animate-shimmer",
				"bg-clip-text text-transparent",
				className
			)}
		>
			{children}
		</span>
	);
}
