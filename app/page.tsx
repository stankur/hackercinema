"use client";

import CursorGradient from "@/components/CursorGradient";
import HeroSection from "@/components/landing/HeroSection";
import ShowcaseSection from "@/components/landing/ShowcaseSection";
import CommunitySection from "@/components/landing/CommunitySection";

export default function LandingPage() {
	return (
		<div className="min-h-screen relative">
			<CursorGradient />

			<div className="max-w-3xl mx-auto py-16 px-6 space-y-28">
				<HeroSection />

				{/* Linear sections */}
				<ShowcaseSection />
				<CommunitySection />
			</div>
		</div>
	);
}
