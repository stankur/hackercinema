"use client";

import { useRouter } from "next/navigation";
import { SocialIcon } from "@/components/ui/OrganizationIcon";
import { Ghost, RotateCw } from "lucide-react";
import Image from "next/image";

interface UserInfoCardProps {
	username: string;
	avatarUrl?: string;
	is_ghost: boolean;
	theme?: string;
	showRestartButton?: boolean;
	clickable?: boolean;
	onRestart?: () => void;
}

export default function UserInfoCard({
	username,
	avatarUrl,
	is_ghost,
	theme,
	showRestartButton = false,
	clickable = false,
	onRestart,
}: UserInfoCardProps) {
	const router = useRouter();

	const handleClick = () => {
		if (clickable) {
			router.push(`/personalized/${username}/profile`);
		}
	};

	const content = (
		<div className="flex-1 min-w-0 space-y-2">
			<div className="flex justify-between items-center">
				<div className="flex gap-4 items-center">
					<div className="flex items-center gap-3">
						{avatarUrl && (
							<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
								<Image
									src={avatarUrl}
									alt={`${username}'s avatar`}
									width={48}
									height={48}
									className="w-full h-full object-cover"
								/>
							</div>
						)}
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-semibold text-foreground">
								{username}
							</h1>
							{is_ghost && (
								<Ghost size={18} className="text-foreground" />
							)}
						</div>
					</div>

					{/* Social Links */}
					<div className="flex gap-4 items-center">
						{/* GitHub */}
						<a
							href={`https://github.com/${username}`}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="text-muted-foreground hover:opacity-80 transition-opacity"
							title="GitHub"
						>
							<SocialIcon
								platformName="github"
								size={20}
								color="currentColor"
							/>
						</a>
					</div>
				</div>

				{/* Restart Button - only visible when enabled via env var */}
				{showRestartButton && (
					<button
						onClick={onRestart}
						className="text-muted-foreground hover:text-foreground transition-colors"
						title="Restart"
					>
						<RotateCw size={14} />
					</button>
				)}
			</div>
			{/* Inferred Theme - always at the top when available */}
			{theme && (
				<div className="border border-muted-foreground/20 rounded-lg p-4 bg-gray-500/10 mb-6 mt-6">
					<h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">
						Inferred Interest
					</h3>
					<p className="text-sm font-medium text-muted-foreground">
						{theme}
					</p>
				</div>
			)}
		</div>
	);

	if (clickable) {
		return (
			<div
				onClick={handleClick}
				className="block hover:opacity-80 transition-opacity cursor-pointer"
			>
				{content}
			</div>
		);
	}

	return content;
}
