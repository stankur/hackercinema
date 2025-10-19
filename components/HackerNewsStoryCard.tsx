import { MessageSquare } from "lucide-react";

interface HackerNewsStoryCardProps {
	title: string;
	url?: string;
	hnUrl: string;
}

export default function HackerNewsStoryCard({
	title,
	url,
	hnUrl,
}: HackerNewsStoryCardProps) {
	return (
		<div className="flex items-start justify-between gap-4 py-3">
			<a
				href={url || hnUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm text-foreground hover:text-foreground/80 transition-colors flex-1"
			>
				{title}
			</a>
			<a
				href={hnUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
				aria-label="View comments"
			>
				<MessageSquare size={16} />
			</a>
		</div>
	);
}
