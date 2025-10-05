"use client";

import { useState } from "react";
import { Sparkles, Users } from "lucide-react";
import CursorGradient from "@/components/CursorGradient";
import HeroSection from "@/components/landing/HeroSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import CommunitySection from "@/components/landing/CommunitySection";

type TabType = "showcase" | "community";

export default function LandingPage() {
	const [activeTab, setActiveTab] = useState<TabType>("showcase");

	return (
		<div className="min-h-screen relative">
			<CursorGradient />

			<div className="max-w-3xl mx-auto py-10 px-6 space-y-20">
				<HeroSection />

				{/* Tabbed Section */}
				<section className="space-y-8">
					{/* Tab Navigation */}
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab("showcase")}
							className={`flex items-center gap-2 pb-3 transition-colors ${
								activeTab === "showcase"
									? "text-foreground border-b-2 border-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<Sparkles size={20} />
							<span className="text-2xl md:text-xl font-semibold">
								Showcase your stuff
							</span>
						</button>
						<button
							onClick={() => setActiveTab("community")}
							className={`flex items-center gap-2 pb-3 transition-colors ${
								activeTab === "community"
									? "text-foreground border-b-2 border-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<Users size={20} />
							<span className="text-2xl md:text-xl font-semibold">
								Find similar hackers
							</span>
						</button>
					</div>

					{/* Tab Content */}
					<div>
						{activeTab === "showcase" && <ShowcaseSection />}
						{activeTab === "community" && <CommunitySection />}
					</div>
				</section>
			</div>
		</div>
	);
}
