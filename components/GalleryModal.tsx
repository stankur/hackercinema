"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/types";

interface GalleryModalProps {
	images: GalleryImage[];
	isOpen: boolean;
	onClose: () => void;
	initialIndex?: number;
}

export default function GalleryModal({
	images,
	isOpen,
	onClose,
	initialIndex = 0,
}: GalleryModalProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
	const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

	// Filter out failed images
	const validImages = images.filter((_, index) => !failedImages.has(index));
	const validCurrentIndex = Math.min(currentIndex, validImages.length - 1);

	// Reset index when modal opens
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
		}
	}, [isOpen, initialIndex]);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return;

			switch (e.key) {
				case "Escape":
					onClose();
					break;
				case "ArrowLeft":
					setCurrentIndex((prev) =>
						prev > 0 ? prev - 1 : validImages.length - 1
					);
					break;
				case "ArrowRight":
					setCurrentIndex((prev) =>
						prev < validImages.length - 1 ? prev + 1 : 0
					);
					break;
			}
		},
		[isOpen, onClose, validImages.length]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	// Handle image load success
	const handleImageLoad = (index: number) => {
		setLoadedImages((prev) => new Set(prev).add(index));
	};

	// Handle image load failure
	const handleImageError = (index: number) => {
		setFailedImages((prev) => new Set(prev).add(index));
	};

	// Navigate to previous image
	const goToPrevious = () => {
		setCurrentIndex((prev) =>
			prev > 0 ? prev - 1 : validImages.length - 1
		);
	};

	// Navigate to next image
	const goToNext = () => {
		setCurrentIndex((prev) =>
			prev < validImages.length - 1 ? prev + 1 : 0
		);
	};

	if (!isOpen || validImages.length === 0) return null;

	const currentImage = validImages[validCurrentIndex];

	const modalContent = (
		<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
			{/* Close button */}
			<button
				onClick={onClose}
				className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
				aria-label="Close gallery"
			>
				<X size={24} />
			</button>

			{/* Navigation buttons */}
			{validImages.length > 1 && (
				<>
					<button
						onClick={goToPrevious}
						className="absolute left-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
						aria-label="Previous image"
					>
						<ChevronLeft size={32} />
					</button>
					<button
						onClick={goToNext}
						className="absolute right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
						aria-label="Next image"
					>
						<ChevronRight size={32} />
					</button>
				</>
			)}

			{/* Image container */}
			<div className="flex items-center justify-center w-full h-full p-8 md:p-16">
				<img
					src={currentImage.url}
					alt={currentImage.alt}
					className="max-w-full max-h-[75vh] md:max-w-[50vw] md:max-h-[80vh] object-contain"
					onLoad={() => handleImageLoad(validCurrentIndex)}
					onError={() => handleImageError(validCurrentIndex)}
				/>
			</div>

			{/* Image counter */}
			{validImages.length > 1 && (
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
					{validCurrentIndex + 1} / {validImages.length}
				</div>
			)}

			{/* Background click to close */}
			<div
				className="absolute inset-0 -z-10"
				onClick={onClose}
				aria-label="Close gallery"
			/>
		</div>
	);

	// Use createPortal to render modal at document root level
	return typeof window !== "undefined"
		? createPortal(modalContent, document.body)
		: null;
}
