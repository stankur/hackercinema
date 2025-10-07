"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import GalleryModal from "./GalleryModal";
import type { GalleryImage } from "@/lib/types";

interface GalleryModalContextType {
	openGallery: (
		images: GalleryImage[],
		initialIndex?: number,
		options?: {
			username?: string;
			owner?: string;
			repoName?: string;
			repoLink?: string;
			canEdit?: boolean;
			onImageDeleted?: (deletedUrl: string) => void;
			showAllImages?: boolean;
		}
	) => void;
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
	const [modalOptions, setModalOptions] = useState<{
		username?: string;
		owner?: string;
		repoName?: string;
		repoLink?: string;
		canEdit?: boolean;
		onImageDeleted?: (deletedUrl: string) => void;
		showAllImages?: boolean;
	}>({});

	const openGallery = (
		galleryImages: GalleryImage[],
		startIndex = 0,
		options = {}
	) => {
		setImages(galleryImages);
		setInitialIndex(startIndex);
		setModalOptions(options);
		setIsOpen(true);
	};

	const closeGallery = () => {
		setIsOpen(false);
		// Clean up after animation
		setTimeout(() => {
			setImages([]);
			setInitialIndex(0);
			setModalOptions({});
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
				{...modalOptions}
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
