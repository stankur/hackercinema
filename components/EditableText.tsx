"use client";

import { useState, useRef, useEffect } from "react";

interface EditableTextProps {
	value: string;
	placeholder: string;
	className: string;
	onSave: (newValue: string) => Promise<void>;
	canEdit: boolean;
	showPlaceholder: boolean;
}

export default function EditableText({
	value,
	placeholder,
	className,
	onSave,
	canEdit,
	showPlaceholder,
}: EditableTextProps) {
	const [pendingValue, setPendingValue] = useState(value);
	const divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setPendingValue(value);
	}, [value]);

	// If not editable and no value, don't render anything
	if (!canEdit && !value) {
		return null;
	}

	const handleInput = () => {
		if (!divRef.current) return;
		const text = divRef.current.textContent || "";
		setPendingValue(text);

		// Remove placeholder if there's actual content
		if (text.trim() && divRef.current.hasAttribute("data-placeholder")) {
			divRef.current.removeAttribute("data-placeholder");
		}
		// Add placeholder if empty and should show
		else if (
			!text.trim() &&
			showPlaceholder &&
			!divRef.current.hasAttribute("data-placeholder")
		) {
			divRef.current.setAttribute("data-placeholder", placeholder);
		}
	};

	const handleBlur = async () => {
		if (pendingValue !== value) {
			try {
				await onSave(pendingValue);
			} catch (error) {
				console.error("Failed to save:", error);
				// Revert on error
				setPendingValue(value);
				if (divRef.current) {
					divRef.current.textContent = value;
					if (!value && showPlaceholder) {
						divRef.current.setAttribute(
							"data-placeholder",
							placeholder
						);
					}
				}
			}
		}
	};

	return (
		<div
			ref={divRef}
			contentEditable={canEdit}
			className={`${className} focus:outline-none`}
			data-placeholder={
				showPlaceholder && !value ? placeholder : undefined
			}
			onInput={handleInput}
			onBlur={handleBlur}
			suppressContentEditableWarning={true}
		>
			{value}
		</div>
	);
}
