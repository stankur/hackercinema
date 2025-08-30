"use client";

import { useState, useEffect } from "react";
import LazyBuilderItem from "@/components/LazyBuilderItem";
import type { Builder } from "@/lib/types";
import { Github } from "lucide-react";
import { Shimmer } from "@/components/ui/shimmer";
import { SimpleIcon } from "@/components/ui/SimpleIcon";

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
				<div className="flex justify-center mb-12 relative z-20">
					<div className="flex gap-10">
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
					<>
						{/* Full page gradient background */}
						<div
							className="fixed inset-0 bg-slate-900"
							style={{
								background: `
									radial-gradient(circle at 60% 50%, rgba(71, 85, 105, 0.25) 0%, rgba(71, 85, 105, 0.15) 30%, rgba(71, 85, 105, 0.08) 60%, transparent 80%),
									radial-gradient(circle at 80% 20%, rgba(71, 85, 105, 0.18) 0%, rgba(71, 85, 105, 0.10) 35%, rgba(71, 85, 105, 0.04) 65%, transparent 80%)
								`,
							}}
						></div>

						{/* Text content */}
						<div className="relative z-10 pt-4 font-mono text-sm px-8 max-w-4xl mx-auto">
							<div className="flex flex-col items-center mb-8">
								{" "}
								<p className="mb-6 font-black text-2xl">
									THE HACKER FILTER
								</p>
								<div className="mb-8 font-semibold">
									<Shimmer>
										<a
											href="https://github.com/join"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 transition-all border border-gray-300 hover:border-gray-400 cursor-pointer shadow-sm"
										>
											<span>join with github</span>
											<SimpleIcon
												name="github"
												size={16}
											/>
										</a>
									</Shimmer>
								</div>
							</div>

							<p className=" mb-8">
								there are people who build things for hobby, in
								their free time, what they do is building stuff,
								and they are technically inclined and curious,
								and ambitious.
							</p>

							<p className="tracking-wide leading-relaxed mb-8">
								People who code professionally but not in free
								time, people who do it for school, uni
								assignments, people who seem to be doing
								projects to hit keywords for job search, people
								who only do projects at hackathons do not pass.
							</p>

							<p className="tracking-wide leading-relaxed mb-8">
								does this person seem to have a taste, do their
								project show that they have a passion for some
								particular theme, like an obsession because they
								are pursuing it, the type of person who would
								work or start a startup pursuing an ambitious
								vision, rather than starting startups for the
								sake of starting one type.
							</p>

							<p className="tracking-wide leading-relaxed">
								curious, exeprimental, learner, builder type.
								YES or NO. One word answer, just one answer.
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
