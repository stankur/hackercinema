"use client";

import { useState, useEffect } from "react";
import EmphasizedText from "@/components/EmphasizedText";
import Image from "next/image";

export default function CommunitySection() {
	const [activeSlide, setActiveSlide] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveSlide((prev) => (prev === 0 ? 1 : 0));
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="space-y-6">
			{/* Slides */}
			<div className="relative">
				<div
					className={`space-y-10 transition-opacity duration-500 ${
						activeSlide === 0
							? "opacity-100"
							: "opacity-0 absolute inset-0 pointer-events-none"
					}`}
				>
					<p className="text-lg md:text-base text-muted-foreground">
						<EmphasizedText
							text="connect"
							emphasisWords={["connect"]}
						/>{" "}
						with people building things like you
					</p>
					<div className="relative w-full rounded-lg overflow-hidden">
						<Image
							src="/others.gif"
							alt="Connect with people building similar things"
							width={800}
							height={600}
							className="w-full h-auto"
						/>
					</div>
				</div>

				<div
					className={`space-y-8 transition-opacity duration-500 ${
						activeSlide === 1
							? "opacity-100"
							: "opacity-0 absolute inset-0 pointer-events-none"
					}`}
				>
					<p className="text-lg md:text-base text-muted-foreground">
						<EmphasizedText
							text="discover"
							emphasisWords={["discover"]}
						/>{" "}
						projects that match your interests
					</p>
					<div className="relative w-full rounded-lg overflow-hidden">
						<Image
							src="/explore.png"
							alt="Discover projects that match your interests"
							width={800}
							height={600}
							className="w-full h-auto"
						/>
					</div>
				</div>
			</div>

			{/* Dots */}
			<div className="flex justify-center gap-2 mt-6">
				<button
					onClick={() => setActiveSlide(0)}
					className={`w-1.5 h-1.5 rounded-full transition-all ${
						activeSlide === 0
							? "bg-foreground opacity-100"
							: "bg-muted-foreground opacity-30"
					}`}
				/>
				<button
					onClick={() => setActiveSlide(1)}
					className={`w-1.5 h-1.5 rounded-full transition-all ${
						activeSlide === 1
							? "bg-foreground opacity-100"
							: "bg-muted-foreground opacity-30"
					}`}
				/>
			</div>
		</div>
	);
}
