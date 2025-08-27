"use client";

import { useEffect, useRef, useCallback } from "react";

interface TabSyncOptions {
	rowIndex: number;
	columnIndex: number;
	isActive: boolean;
}

export function useTabSync({ rowIndex, isActive }: TabSyncOptions) {
	const contentRef = useRef<HTMLDivElement>(null);
	const tabsRef = useRef<HTMLDivElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const syncRowHeights = useCallback(() => {
		// Find all content areas and tab areas in the same row
		const rowElements = document.querySelectorAll(
			`[data-row="${rowIndex}"] [data-content]`
		);
		const tabElements = document.querySelectorAll(
			`[data-row="${rowIndex}"] [data-tabs]`
		);

		console.log(
			`Row ${rowIndex}: Found ${rowElements.length} content elements`
		);

		if (rowElements.length === 0) return;

		// If there's only one project in the row, don't synchronize heights
		if (rowElements.length === 1) {
			console.log(
				`Row ${rowIndex}: Single project, skipping height sync`
			);
			return;
		}

		// First, measure actual tab heights
		let maxTabHeight = 0;
		tabElements.forEach((tabEl) => {
			const height = (tabEl as HTMLElement).offsetHeight;
			maxTabHeight = Math.max(maxTabHeight, height);
		});

		// Add spacing buffer: 32px (mb-8) + 16px extra = 48px minimum
		const tabReservedSpace = Math.max(maxTabHeight + 16, 48);

		// Reset heights and apply tab padding to measure natural content heights
		rowElements.forEach((el) => {
			const element = el as HTMLElement;
			element.style.height = "auto";
			element.style.paddingBottom = `${tabReservedSpace}px`;
		});

		// Measure natural heights (now including tab space)
		const heights = Array.from(rowElements).map((el) => el.scrollHeight);

		// Set all to the maximum height
		const maxHeight = Math.max(...heights);
		rowElements.forEach((el) => {
			(el as HTMLElement).style.height = `${maxHeight}px`;
		});
	}, [rowIndex]);

	// Initial sync and setup ResizeObserver
	useEffect(() => {
		if (!contentRef.current) return;

		// Initial sync
		syncRowHeights();

		// Set up ResizeObserver to handle content changes
		resizeObserverRef.current = new ResizeObserver(() => {
			// Debounce the sync to avoid excessive calls
			setTimeout(syncRowHeights, 10);
		});

		// Observe all content areas in this row
		const rowElements = document.querySelectorAll(
			`[data-row="${rowIndex}"] [data-content]`
		);

		rowElements.forEach((el) => {
			resizeObserverRef.current?.observe(el);
		});

		return () => {
			resizeObserverRef.current?.disconnect();
		};
	}, [syncRowHeights, rowIndex]);

	// Sync when tab state changes
	useEffect(() => {
		// Small delay to allow DOM to update after state change
		setTimeout(syncRowHeights, 0);
	}, [isActive, syncRowHeights]);

	return {
		contentRef,
		tabsRef,
		syncRowHeights,
	};
}
