"use client";

import EmphasizedText from "@/components/EmphasizedText";
import { SimpleIcon } from "@/components/ui/SimpleIcon";
import { signIn } from "next-auth/react";
import { Pixelify_Sans } from "next/font/google";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

export default function HeroSection() {
	return (
		<section className="text-left space-y-4 md:space-y-6 py-24">
			<h1
				className={` text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none md:leading-tight`}
			>
				Follow your curiosity,
			</h1>

			<h1
				className={`${pixelFont.className} text-5xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none md:leading-tight`}
			>
				Go build some{" "}
				<span
					aria-label="cool shit"
					className={`inline-block align-baseline`}
				>
					{Array.from("cool shit").map(
						(character, characterIndex) => {
							const colorClasses = [
								"text-rose-500",
								"text-orange-500",
								"text-amber-500",
								"text-lime-500",
								"text-emerald-500",
								"text-teal-500",
								"text-sky-500",
								"text-indigo-500",
								"text-violet-500",
								"text-pink-500",
							];
							const colorClassName =
								character === " "
									? ""
									: colorClasses[
											characterIndex % colorClasses.length
									  ];
							return (
								<span
									key={characterIndex}
									className={`${colorClassName}`}
								>
									{character}
								</span>
							);
						}
					)}
				</span>
				!
			</h1>

			<div className="text-2xl md:text-xl text-muted-foreground leading-relaxed md:leading-relaxed space-y-1">
				<div>
					<EmphasizedText
						text="Showcase"
						emphasisWords={["showcase"]}
						colorClass="text-rose-500 border-rose-500/50"
					/>{" "}
					your projects automatically
				</div>
				<div>
					<EmphasizedText
						text="Discover"
						emphasisWords={["Discover"]}
						colorClass="text-emerald-500 border-emerald-500/50"
					/>{" "}
					interesting projects
				</div>

				<div>
					<EmphasizedText
						text="Learn"
						emphasisWords={["Learn"]}
						colorClass="text-violet-500 border-violet-500/50"
					/>{" "}
					from the best projects
				</div>
			</div>

			<div className="pt-4">
				<button
					onClick={() =>
						signIn("github", { callbackUrl: "/auth/callback" })
					}
					className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
				>
					<SimpleIcon name="github" size={20} />
					Join with GitHub
				</button>
			</div>
		</section>
	);
}
