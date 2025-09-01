"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

interface AvatarData {
	lat: number;
	lng: number;
	username: string;
	avatarUrl: string;
}

interface UserProfile {
	login: string;
	avatar_url: string;
	bio?: string;
	location?: string;
	blog?: string;
}

interface Builder {
	username: string;
	theme: string;
	profile: UserProfile;
}

interface AvatarGlobeProps {
	maxUsers?: number;
}

// Generate Fibonacci sphere points for even distribution
function generateFibonacciSphere(
	numPoints: number
): Array<{ lat: number; lng: number }> {
	const points = [];
	const goldenRatio = (1 + Math.sqrt(5)) / 2;

	for (let i = 0; i < numPoints; i++) {
		const theta = (2 * Math.PI * i) / goldenRatio;
		const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);

		const lat = ((Math.PI / 2 - phi) * 180) / Math.PI;
		const lng = (theta * 180) / Math.PI;

		points.push({ lat, lng });
	}

	return points;
}

// Default number of users to show - more for denser distribution
const DEFAULT_MAX_USERS = 170;

function AvatarGlobeClient({ maxUsers = DEFAULT_MAX_USERS }: AvatarGlobeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const globeRef = useRef<unknown>(null);
	const [Globe, setGlobe] = useState<
		typeof import("globe.gl").default | null
	>(null);
	const [builders, setBuilders] = useState<Builder[]>([]);

	// Load builders data
	useEffect(() => {
		fetch("/api/data.json")
			.then((res) => res.json())
			.then((data: Builder[]) => {
				// Take first N users
				const selectedUsers = data.slice(0, maxUsers);
				console.log(
					`Globe: Requested ${maxUsers} users, got ${selectedUsers.length} from ${data.length} total users`
				);
				setBuilders(selectedUsers);
			})
			.catch((err) => {
				console.error("Failed to load builders:", err);
			});
	}, [maxUsers]);

	// Dynamically import Globe only on client side
	useEffect(() => {
		import("globe.gl").then((module) => {
			setGlobe(() => module.default);
		});
	}, []);

	useEffect(() => {
		if (!containerRef.current || !Globe || builders.length === 0) return;

		// Get responsive dimensions - bigger on mobile, more square aspect ratio
		const containerWidth = containerRef.current.clientWidth;
		const containerHeight = Math.min(containerWidth * 0.9, 600); // Taller aspect ratio, higher max height

		// Generate evenly distributed points on sphere
		const spherePoints = generateFibonacciSphere(builders.length);

		// Create avatar data from builders
		const avatarData: AvatarData[] = builders.map((builder, index) => ({
			lat: spherePoints[index].lat,
			lng: spherePoints[index].lng,
			username: builder.username,
			avatarUrl: builder.profile.avatar_url,
		}));

		// Initialize globe with responsive dimensions and zoomed-in view
		const globe = new Globe(containerRef.current)
			.width(containerWidth)
			.height(containerHeight)
			.backgroundColor("rgba(0,0,0,0)")
			.showGlobe(false)
			.showAtmosphere(false)
			.enablePointerInteraction(true);

		// Zoom in the camera to reduce empty space around the globe
		const camera = globe.camera();
		camera.position.z = 120; // Closer to globe (default is ~180-200)
		globe.pointOfView({ altitude: 1.7 }); // Lower altitude = closer view

		// Configure HTML elements (avatars) with responsive sizing
		globe.htmlElementsData(avatarData).htmlElement((d: object) => {
			const data = d as AvatarData;
			const img = document.createElement("img");
			img.src = data.avatarUrl;
			img.alt = data.username;

			// Much smaller avatars for denser distribution
			const isMobile = containerWidth < 640;
			const avatarSize = isMobile ? 16 : 24; // 16px on mobile, 24px on desktop (half the previous size)

			img.style.cssText = `
          width: ${avatarSize}px;
          height: ${avatarSize}px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: all 0.2s ease;
          user-select: none;
        `;

			// Handle image load errors
			img.onerror = () => {
				img.src = `https://github.com/github.png?size=80`;
			};

			return img;
		});

		// Configure controls - rotation only with faster spin
		const controls = globe.controls();
		controls.enableZoom = false;
		controls.enablePan = false;
		controls.autoRotate = true;
		controls.autoRotateSpeed = 0.75; // 50% faster (was 0.5)

		// Pause auto-rotation on interaction
		let isInteracting = false;

		const handlePointerDown = () => {
			isInteracting = true;
			controls.autoRotate = false;
		};

		const handlePointerUp = () => {
			isInteracting = false;
			setTimeout(() => {
				if (!isInteracting) {
					controls.autoRotate = true;
				}
			}, 2000);
		};

		const container = containerRef.current;
		container.addEventListener("pointerdown", handlePointerDown);
		container.addEventListener("pointerup", handlePointerUp);

		globeRef.current = globe;

		// Cleanup
		return () => {
			if (container) {
				container.removeEventListener("pointerdown", handlePointerDown);
				container.removeEventListener("pointerup", handlePointerUp);
			}
		};
	}, [builders, Globe]);

	// Show loading state while Globe or data is loading
	if (!Globe || builders.length === 0) {
		return (
			<div className="w-full max-w-2xl mx-auto px-4">
				<div
					className="avatar-globe-container flex items-center justify-center rounded-lg"
					style={{
						height: "400px",
						background: "transparent",
					}}
				>
					<div className="text-sm text-muted-foreground">
						Loading globe...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-2xl mx-auto px-4">
			<div
				ref={containerRef}
				className="avatar-globe-container w-full rounded-lg"
				style={{
					background: "transparent",
					overflow: "hidden",
					minHeight: "350px", // Taller minimum height
				}}
			/>
		</div>
	);
}

// Export as dynamic component to prevent SSR issues
const AvatarGlobe = dynamic(() => Promise.resolve(AvatarGlobeClient), {
	ssr: false,
	loading: () => (
		<div className="w-full max-w-2xl mx-auto px-4">
			<div
				className="avatar-globe-container flex items-center justify-center rounded-lg"
				style={{
					height: "400px",
					background: "transparent",
				}}
			>
				<div className="text-sm text-muted-foreground">
					Loading globe...
				</div>
			</div>
		</div>
	),
});

export default AvatarGlobe;
