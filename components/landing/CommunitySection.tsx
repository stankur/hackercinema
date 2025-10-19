"use client";

import { useState } from "react";
import EmphasizedText from "@/components/EmphasizedText";
import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

const slides = [
	{
		text: (
			<>
				<EmphasizedText text="discover" emphasisWords={["discover"]} />{" "}
				people building things like you
			</>
		),
		image: "/others.png",
		alt: "Discover people building similar things",
	},
	{
		text: (
			<>
				<EmphasizedText text="learn" emphasisWords={["learn"]} /> from
				trending projects personalized to your interests
			</>
		),
		image: "/explore.png",
		alt: "Discover projects that match your interests",
	},
];

export default function CommunitySection() {
	const [currentSlide, setCurrentSlide] = useState(0);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};

	return (
		<section className="space-y-8 py-8">
			<h2
				className={`${pixelFont.className} text-2xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2 mb-10 md:mb-12`}
			>
				<Users size={24} />
				<span>Find similar hackers</span>
			</h2>
			<p className="text-base md:text-base text-muted-foreground">
				{slides[currentSlide].text}
			</p>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src={slides[currentSlide].image}
					alt={slides[currentSlide].alt}
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
			<div className="flex items-center justify-center gap-4">
				<button
					onClick={prevSlide}
					className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Previous slide"
				>
					<ChevronLeft size={20} />
				</button>
				<span className="text-sm text-muted-foreground">
					{currentSlide + 1} / {slides.length}
				</span>
				<button
					onClick={nextSlide}
					className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Next slide"
				>
					<ChevronRight size={20} />
				</button>
			</div>
		</section>
	);
}
