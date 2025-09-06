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
	const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());

	// Filter out failed images
	const validImages = images.filter((_, index) => !failedImages.has(index));
	const validCurrentIndex = Math.min(currentIndex, validImages.length - 1);

	// Reset index and loading state when modal opens
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			setLoadedImages(new Set());
			setFailedImages(new Set());
			setLoadingImages(new Set());
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

	// Preload image and handle loading state
	const preloadImage = useCallback(
		(index: number, url: string) => {
			if (loadedImages.has(index) || loadingImages.has(index)) return;

			setLoadingImages((prev) => new Set(prev).add(index));

			const img = new Image();
			img.onload = () => handleImageLoad(index);
			img.onerror = () => handleImageError(index);
			img.src = url;
		},
		[loadedImages, loadingImages]
	);

	// Handle image load success
	const handleImageLoad = (index: number) => {
		setLoadedImages((prev) => new Set(prev).add(index));
		setLoadingImages((prev) => {
			const newSet = new Set(prev);
			newSet.delete(index);
			return newSet;
		});
	};

	// Handle image load failure
	const handleImageError = (index: number) => {
		setFailedImages((prev) => new Set(prev).add(index));
		setLoadingImages((prev) => {
			const newSet = new Set(prev);
			newSet.delete(index);
			return newSet;
		});
	};

	// Navigate to previous image
	const goToPrevious = () => {
		const newIndex =
			currentIndex > 0 ? currentIndex - 1 : validImages.length - 1;
		setCurrentIndex(newIndex);
		// Preload the new image
		if (validImages[newIndex]) {
			preloadImage(newIndex, validImages[newIndex].url);
		}
	};

	// Navigate to next image
	const goToNext = () => {
		const newIndex =
			currentIndex < validImages.length - 1 ? currentIndex + 1 : 0;
		setCurrentIndex(newIndex);
		// Preload the new image
		if (validImages[newIndex]) {
			preloadImage(newIndex, validImages[newIndex].url);
		}
	};

	// Preload current image when index changes
	useEffect(() => {
		if (isOpen && validImages[validCurrentIndex]) {
			preloadImage(validCurrentIndex, validImages[validCurrentIndex].url);
		}
	}, [validCurrentIndex, isOpen, validImages, preloadImage]);

	if (!isOpen || validImages.length === 0) return null;

	const currentImage = validImages[validCurrentIndex];

	const modalContent = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
			onClick={onClose}
		>
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
						onClick={(e) => {
							e.stopPropagation();
							goToPrevious();
						}}
						className="absolute left-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
						aria-label="Previous image"
					>
						<ChevronLeft size={32} />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							goToNext();
						}}
						className="absolute right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
						aria-label="Next image"
					>
						<ChevronRight size={32} />
					</button>
				</>
			)}

			{/* Image container */}
			<div
				className="flex items-center justify-center w-full h-full p-8 md:p-16"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Show loading skeleton when image is loading or not loaded yet */}
				{(!loadedImages.has(validCurrentIndex) ||
					loadingImages.has(validCurrentIndex)) && (
					<div className="flex items-center justify-center">
						<div className="w-96 h-64 max-w-full max-h-[75vh] md:max-w-[50vw] md:max-h-[80vh] bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
							<div className="text-gray-400 text-sm">
								Loading image...
							</div>
						</div>
					</div>
				)}

				{/* Only show image when fully loaded */}
				{loadedImages.has(validCurrentIndex) &&
					!loadingImages.has(validCurrentIndex) && (
						<img
							src={currentImage.url}
							alt={currentImage.alt}
							className="max-w-full max-h-[75vh] md:max-w-[50vw] md:max-h-[80vh] object-contain animate-in fade-in duration-300"
						/>
					)}
			</div>

			{/* Image counter */}
			{validImages.length > 1 && (
				<div
					className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm"
					onClick={(e) => e.stopPropagation()}
				>
					{validCurrentIndex + 1} / {validImages.length}
				</div>
			)}
		</div>
	);

	// Use createPortal to render modal at document root level
	return typeof window !== "undefined"
		? createPortal(modalContent, document.body)
		: null;
}
