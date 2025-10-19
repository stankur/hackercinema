"use client";

import Image from "next/image";
import Link from "next/link";
import { Pixelify_Sans } from "next/font/google";
import { Images, ArrowRight } from "lucide-react";

const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: "700" });

export default function GallerySection() {
	return (
		<section className="space-y-8 py-8">
			<Link
				href="/gallery"
				className={`${pixelFont.className} text-2xl md:text-3xl font-bold tracking-tight inline-flex items-center gap-2 mb-10 md:mb-12 hover:opacity-80 transition-opacity`}
			>
				<Images size={24} />
				<span>Visit the Gallery</span>
				<ArrowRight size={24} />
			</Link>
			<div className="relative w-full overflow-hidden retro-grid vignette border border-muted-foreground/50 border-r-8 border-b-8">
				<Image
					src="/gallery.png"
					alt="Gallery showcase"
					width={800}
					height={600}
					className="w-full h-auto"
				/>
			</div>
		</section>
	);
}
