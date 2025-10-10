"use client";

import Image from "next/image";
import { ImgHTMLAttributes } from "react";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	fill?: boolean;
	priority?: boolean;
	quality?: number;
}

// Domains that are configured in next.config.ts for optimization
const OPTIMIZED_DOMAINS = [
	"githubusercontent.com",
	"avatars.githubusercontent.com",
	"github.com",
	"res.cloudinary.com",
];

function isOptimizedDomain(src: string): boolean {
	try {
		const url = new URL(src);
		return OPTIMIZED_DOMAINS.some((domain) =>
			url.hostname.endsWith(domain)
		);
	} catch {
		// If URL parsing fails, assume it's a relative path (optimized by default)
		return !src.startsWith("http");
	}
}

export default function SmartImage({
	src,
	alt,
	width,
	height,
	fill,
	priority,
	quality,
	className,
	...rest
}: SmartImageProps) {
	const useOptimized = isOptimizedDomain(src);

	if (useOptimized) {
		if (fill) {
			return (
				<Image
					src={src}
					alt={alt}
					fill
					priority={priority}
					quality={quality}
					className={className}
				/>
			);
		}
		if (width && height) {
			return (
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					priority={priority}
					quality={quality}
					className={className}
				/>
			);
		}
	}

	// Fallback to regular img for unknown domains
	// For fill mode, use absolute positioning to mimic Next.js Image fill behavior
	if (fill) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt={alt}
				className={`absolute inset-0 w-full h-full ${className || ""}`}
				{...rest}
			/>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			{...rest}
		/>
	);
}
