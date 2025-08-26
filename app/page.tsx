"use client";

import { useState, useEffect } from "react";
import BuilderItem from "../components/BuilderItem";

interface Builder {
	username: string;
	theme: string;
	profile: {
		login: string;
		avatar_url: string;
		bio?: string | null;
		location?: string | null;
		blog?: string;
	};
	repos: {
		name: string;
		description?: string | null;
		updated_at: string;
		stars?: number;
		language?: string | null;
		topics?: string[];
	}[];
}

export default function Home() {
	const [builders, setBuilders] = useState<Builder[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/data.json")
			.then((res) => res.json())
			.then((data) => {
				setBuilders(data);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Failed to load builders:", err);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-3xl mx-auto py-12 px-6">
				<div className="divide-y">
					{builders.map((builder) => (
						<BuilderItem key={builder.username} builder={builder} />
					))}
				</div>
			</div>
		</div>
	);
}
