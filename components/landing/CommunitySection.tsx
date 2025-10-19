"use client";

import EmphasizedText from "@/components/EmphasizedText";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import { Users } from "lucide-react";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

export default function CommunitySection() {
	return (
		<section className="space-y-8 py-8">
			<h2
				className={`${pixelFont.className} text-4xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2 mb-10 md:mb-12`}
			>
				<Users size={24} />
				<span>Find similar hackers</span>
			</h2>
			<p className="text-lg md:text-base text-muted-foreground">
				<EmphasizedText text="discover" emphasisWords={["discover"]} />{" "}
				 people building things like you
			</p>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src="/others.png"
					alt="Discover people building similar things"
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
			<p className="text-lg md:text-base text-muted-foreground">
				<EmphasizedText text="learn" emphasisWords={["learn"]} />{" "}
				from trending projects personalized to your interests
			</p>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src="/explore.png"
					alt="Discover projects that match your interests"
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
		</section>
	);
}
