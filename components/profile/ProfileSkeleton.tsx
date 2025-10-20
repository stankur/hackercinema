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
				<div className="flex justify-center items-center relative z-20">
					<div className="flex items-center gap-6">
						<Link
							href={`/personalized/${username}`}
							className="text-sm text-muted-foreground hover:text-foreground"
						>
							<Skeleton height={16} width={60} />
						</Link>
						<Link
							href={`/personalized/${username}/profile`}
							className="text-sm"
						>
							<Skeleton height={16} width={30} />
						</Link>
					</div>
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
