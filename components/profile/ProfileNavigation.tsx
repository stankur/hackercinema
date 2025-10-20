"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Pixelify_Sans } from "next/font/google";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

interface ProfileNavigationProps {
	username: string;
}

export default function ProfileNavigation({
	username,
}: ProfileNavigationProps) {
	const pathname = usePathname();
	const { login } = useAuth();

	const isOwner = login === username;

	return (
		<div className="max-w-3xl mx-auto pt-10 px-6 mb-12">
			<div className="flex justify-center items-center relative z-20">
				<div className="flex items-center gap-6">
					{isOwner && (
						<Link
							href={`/personalized/${username}`}
							className={`text-lg md:text-xl transition-colors relative ${
								pathname === `/personalized/${username}`
									? "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-foreground after:rounded"
									: ""
							}`}
						>
							<span
								className={`${pixelFont.className} font-bold`}
							>
								{Array.from("FOR YOU").map((char, idx) => {
									const colors = [
										"text-rose-500",
										"text-orange-500",
										"text-amber-500",
										"text-lime-500",
										"text-emerald-500",
										"text-teal-500",
										"text-sky-500",
									];
									return (
										<span
											key={idx}
											className={
												char === " "
													? ""
													: colors[
															idx % colors.length
													  ]
											}
										>
											{char}
										</span>
									);
								})}
							</span>
						</Link>
					)}
					<Link
						href={`/personalized/${username}/profile`}
						className={`text-sm transition-colors relative ${
							pathname === `/personalized/${username}/profile`
								? "text-foreground after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[2px] after:bg-foreground after:rounded"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Me
					</Link>
				</div>
			</div>
		</div>
	);
}
