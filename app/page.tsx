"use client";

import { useState, useEffect } from "react";
import LazyBuilderItem from "@/components/LazyBuilderItem";
import Navigation from "@/components/Navigation";
import type { Builder } from "@/lib/types";
import { preloadGitHubImages } from "@/lib/imageCache";

export default function Home() {
	const [builders, setBuilders] = useState<Builder[]>([]);
	const [loading, setLoading] = useState(true);

	// Add single shimmer effect to highlight the focused element
	const triggerShimmerOnce = (element: Element) => {
		// Prevent multiple shimmers on the same element
		if (
			(element as HTMLElement & { _shimmerActive?: boolean })
				._shimmerActive
		)
			return;
		(element as HTMLElement & { _shimmerActive?: boolean })._shimmerActive =
			true;

		// Add shimmer CSS class
		element.classList.add("hash-shimmer");

		// Add CSS if not already present
		if (!document.querySelector("#hash-shimmer-styles")) {
			const style = document.createElement("style");
			style.id = "hash-shimmer-styles";
			style.textContent = `
				.hash-shimmer {
					position: relative;
					overflow: hidden;
				}
				.hash-shimmer::after {
					content: '';
					position: absolute;
					top: 0;
					left: -100%;
					width: 100%;
					height: 100%;
					background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
					animation: shimmer-once 1.2s ease-out forwards;
					pointer-events: none;
				}
				@keyframes shimmer-once {
					0% { left: -100%; }
					100% { left: 100%; }
				}
			`;
			document.head.appendChild(style);
		}

		// Remove shimmer class after animation completes
		setTimeout(() => {
			element.classList.remove("hash-shimmer");
			(
				element as HTMLElement & { _shimmerActive?: boolean }
			)._shimmerActive = false;
		}, 1200);
	};

	useEffect(() => {
		fetch("/api/data.json")
			.then((res) => res.json())
			.then(async (data: Builder[]) => {
				setBuilders(data);
				setLoading(false);

				// Preload GitHub images in the background
				try {
					const galleries = data.flatMap((builder) =>
						builder.repos.map((repo) => repo.gallery || [])
					);
					await preloadGitHubImages(galleries);
				} catch (error) {
					console.warn("Failed to preload some images:", error);
				}
			})
			.catch((err) => {
				console.error("Failed to load builders:", err);
				setLoading(false);
			});
	}, []);

	// Handle hash navigation after builders are loaded
	useEffect(() => {
		if (builders.length > 0) {
			const hash = window.location.hash.slice(1);
			if (hash) {
				// Scroll immediately, then correct if needed
				const scrollToElement = (attempt = 1) => {
					const element = document.getElementById(hash);
					if (element) {
						const performScroll = () => {
							const rect = element.getBoundingClientRect();
							const currentScroll = window.pageYOffset;
							const elementTop = rect.top;
							const scrollTop = currentScroll + elementTop - 20;

							window.scrollTo({
								top: scrollTop,
								behavior: "smooth",
							});

							// Check if we need to correct the position
							setTimeout(() => {
								const newRect = element.getBoundingClientRect();
								const finalTop = newRect.top;

								// If position is significantly off and we haven't tried too many times, retry
								if (
									Math.abs(finalTop - 20) > 50 &&
									attempt < 3
								) {
									setTimeout(
										() => scrollToElement(attempt + 1),
										300
									);
								} else {
									// Position is good, add shimmer effect
									triggerShimmerOnce(element);
								}
							}, 600);
						};

						// Wait longer on first attempt to let most content load
						setTimeout(performScroll, attempt === 1 ? 1000 : 200);
					} else {
						// If element not found, try again after a short delay
						setTimeout(() => scrollToElement(attempt), 100);
					}
				};

				// Delay to ensure content is rendered
				setTimeout(scrollToElement, 100);
			}
		}
	}, [builders]);

	// Handle hash changes for anchor navigation
	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.slice(1); // Remove the #
			if (hash && builders.length > 0) {
				// Navigate to hackers page if not already there
				if (window.location.pathname !== "/") {
					window.location.href = `/#${hash}`;
					return;
				}

				// Scroll to the builder
				setTimeout(() => {
					const element = document.getElementById(hash);
					if (element) {
						const rect = element.getBoundingClientRect();
						const currentScroll = window.pageYOffset;
						const elementTop = rect.top;
						const scrollTop = currentScroll + elementTop - 20; // 20px offset from top

						window.scrollTo({
							top: scrollTop,
							behavior: "smooth",
						});

						// Add shimmer effect after scroll completes
						setTimeout(() => {
							triggerShimmerOnce(element);
						}, 500);
					}
				}, 100);
			}
		};

		// Listen for hash changes
		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, [builders]);

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
				<Navigation />

				<div className="divide-y">
					{builders.map((builder) => {
						const hash =
							typeof window !== "undefined"
								? window.location.hash.slice(1)
								: "";
						const autoExpand = !!(
							hash &&
							hash.toLowerCase() ===
								builder.username.toLowerCase()
						);
						return (
							<div key={builder.username} id={builder.username}>
								<LazyBuilderItem
									builder={builder}
									autoExpand={autoExpand}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
