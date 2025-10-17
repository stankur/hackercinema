"use client";

import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import CursorGradient from "@/components/CursorGradient";

interface ProfileSkeletonProps {
	username: string;
}

export default function ProfileSkeleton({ username }: ProfileSkeletonProps) {
	return (
		<div className="min-h-screen relative">
			<CursorGradient />

			{/* Header skeleton */}
			<header className="max-w-3xl mx-auto pt-10 px-6 mb-12">
				<div className="flex justify-between items-center relative z-20">
					<div></div>
					<div className="flex gap-10">
						<Link
							href={`/personalized/${username}`}
							className="text-sm text-muted-foreground hover:text-foreground"
						>
							For You
						</Link>
					</div>
					<Link href={`/personalized/${username}/profile`}>
						<div className="w-8 h-8 rounded-full bg-muted">
							<Skeleton circle height={32} width={32} />
						</div>
					</Link>
				</div>
			</header>

			{/* Profile header skeleton */}
			<div className="max-w-3xl mx-auto px-6">
				<div className="flex items-start gap-4 mb-8">
					<Skeleton circle height={48} width={48} />
					<div className="flex-1">
						<Skeleton height={28} width={120} className="mb-2" />
						<Skeleton height={16} width={200} />
					</div>
				</div>

				{/* Tabs skeleton */}
				<div className="flex gap-10 mb-12">
					<Skeleton height={16} width={80} />
					<Skeleton height={16} width={60} />
					<Skeleton height={16} width={70} />
				</div>

				{/* Content skeleton */}
				<div className="space-y-6">
					<Skeleton height={100} />
					<Skeleton height={100} />
					<Skeleton height={100} />
				</div>
			</div>
		</div>
	);
}
