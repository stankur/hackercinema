"use client";

import { useState, useEffect } from "react";
import LazyBuilderItem from "@/components/LazyBuilderItem";

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
	const [activeTab, setActiveTab] = useState<"hackers" | "filter">("hackers");

	const handleTabClick = (tab: "hackers" | "filter") => {
		setActiveTab(tab);
	};

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
				{/* Tabs */}
				<div className="flex justify-center mb-12">
					<div className="flex gap-8">
						<button
							onClick={() => handleTabClick("hackers")}
							className={`text-sm transition-colors ${
								activeTab === "hackers"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Hackers
						</button>
						<button
							onClick={() => handleTabClick("filter")}
							className={`text-sm transition-colors ${
								activeTab === "filter"
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Filter
						</button>
					</div>
				</div>

				{/* Tab content */}
				{activeTab === "hackers" && (
					<div className="divide-y">
						{builders.map((builder, index) => (
							<LazyBuilderItem
								key={builder.username}
								builder={builder}
								index={index}
							/>
						))}
					</div>
				)}

				{activeTab === "filter" && (
					<div className="text-center text-muted-foreground py-12">
						Filter functionality coming soon...
					</div>
				)}
			</div>
		</div>
	);
}
