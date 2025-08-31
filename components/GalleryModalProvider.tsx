"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import GalleryModal from "./GalleryModal";
import type { GalleryImage } from "@/lib/types";

interface GalleryModalContextType {
	openGallery: (images: GalleryImage[], initialIndex?: number) => void;
	closeGallery: () => void;
}

const GalleryModalContext = createContext<GalleryModalContextType | null>(null);

interface GalleryModalProviderProps {
	children: ReactNode;
}

export function GalleryModalProvider({ children }: GalleryModalProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [initialIndex, setInitialIndex] = useState(0);

	const openGallery = (galleryImages: GalleryImage[], startIndex = 0) => {
		setImages(galleryImages);
		setInitialIndex(startIndex);
		setIsOpen(true);
	};

	const closeGallery = () => {
		setIsOpen(false);
		// Clean up after animation
		setTimeout(() => {
			setImages([]);
			setInitialIndex(0);
		}, 150);
	};

	return (
		<GalleryModalContext.Provider value={{ openGallery, closeGallery }}>
			{children}
			<GalleryModal
				images={images}
				isOpen={isOpen}
				onClose={closeGallery}
				initialIndex={initialIndex}
			/>
		</GalleryModalContext.Provider>
	);
}

export function useGalleryModal() {
	const context = useContext(GalleryModalContext);
	if (!context) {
		throw new Error(
			"useGalleryModal must be used within a GalleryModalProvider"
		);
	}
	return context;
}
