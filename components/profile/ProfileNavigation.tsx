"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Builder } from "@/lib/types";

interface ProfileNavigationProps {
	username: string;
	data: Builder | null;
}

export default function ProfileNavigation({
	username,
	data,
}: ProfileNavigationProps) {
	const pathname = usePathname();

	return (
		<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
			<div className="flex justify-between items-center relative z-20">
				{/* Empty left space */}
				<div></div>

				{/* Centered tabs */}
				<div className="flex gap-10">
					<Link
						href={`/personalized/${username}`}
						className={`text-sm transition-colors ${
							pathname === `/personalized/${username}`
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						For You
					</Link>

					<Link
						href={`/personalized/${username}/explore`}
						className={`text-sm transition-colors ${
							pathname === `/personalized/${username}/explore`
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Explore
					</Link>
				</div>

				{/* Avatar on right within content width - active state */}
				<Link
					href={`/personalized/${username}/profile`}
					className="cursor-pointer"
				>
					<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-foreground">
						{data?.profile?.avatar_url ? (
							<Image
								src={data.profile.avatar_url}
								alt={`${data.username}'s avatar`}
								width={32}
								height={32}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-6 h-6 bg-muted-foreground/20 rounded-full" />
						)}
					</div>
				</Link>
			</div>
		</div>
	);
}
