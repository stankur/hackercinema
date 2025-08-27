import { SimpleIcon } from "./SimpleIcon";
import { LinkedInIcon } from "./CustomIcons";
import { getSocialIcon } from "@/lib/organization-icons";

interface SocialIconProps {
	platformName: string;
	size?: number;
	color?: string;
	className?: string;
	fallback?: React.ReactNode;
}

export function SocialIcon({
	platformName,
	size = 24,
	color = "currentColor",
	className = "",
	fallback = null,
}: SocialIconProps) {
	// Handle custom icons first
	if (platformName.toLowerCase() === "linkedin") {
		return (
			<LinkedInIcon
				size={size}
				color={color}
				className={className}
				title={platformName}
			/>
		);
	}

	// Try to get Simple Icon
	const iconName = getSocialIcon(platformName);

	if (!iconName) {
		return fallback ? <>{fallback}</> : null;
	}

	return (
		<SimpleIcon
			name={iconName}
			size={size}
			color={color}
			className={className}
			title={platformName}
		/>
	);
}
