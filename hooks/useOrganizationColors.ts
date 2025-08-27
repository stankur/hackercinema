import { useState, useEffect } from "react";

type OrganizationColors = Record<string, string>;

export function useOrganizationColors() {
	const [colors, setColors] = useState<OrganizationColors>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/organization-colors.json")
			.then((res) => res.json())
			.then((data: OrganizationColors) => {
				setColors(data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

	const getOrganizationColor = (org: string): string => {
		return colors[org] || "#6b7280"; // Default gray if no color found
	};

	return { colors, loading, getOrganizationColor };
}
