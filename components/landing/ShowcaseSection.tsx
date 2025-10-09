"use client";

import EmphasizedText from "@/components/EmphasizedText";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import { Sparkles } from "lucide-react";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

export default function ShowcaseSection() {
	return (
		<section className="space-y-8 py-8">
			<h2
				className={`${pixelFont.className} text-4xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2 mb-10 md:mb-12`}
			>
				<Sparkles size={24} />
				<span>Showcase your stuff</span>
			</h2>
			<p className="text-lg md:text-base text-muted-foreground">
				<EmphasizedText
					text="auto-updated"
					emphasisWords={["auto-updated"]}
				/>{" "}
				profile based on your projects
			</p>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src="/stankur_profile.gif"
					alt="Auto-updated profile"
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
			<p className="text-lg md:text-base text-muted-foreground">
				<EmphasizedText text="share" emphasisWords={["share"]} /> demos
				and log progress
			</p>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src="/stankur_projects.png"
					alt="Share demos and log progress"
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
		</section>
	);
}
