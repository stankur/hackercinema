"use client";

import { useState } from "react";
import type { Context } from "@/lib/types";

interface ContextsSectionProps {
	contexts: Context[] | null;
	loading: boolean;
	username: string;
	onContextAdded: (newContext: Context) => void;
}

export default function ContextsSection({
	contexts,
	loading,
	username,
	onContextAdded,
}: ContextsSectionProps) {
	const [content, setContent] = useState("");
	const [saving, setSaving] = useState(false);
	if (loading) {
		return (
			<div className="text-sm text-muted-foreground text-center py-20">
				Loading contexts...
			</div>
		);
	}

	const handleSave = async () => {
		if (!content.trim() || saving) return;

		setSaving(true);
		try {
			const formData = new URLSearchParams();
			formData.append("content", content.trim());

			const response = await fetch(`/api/backend/contexts/${username}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: formData.toString(),
			});

			if (response.ok) {
				const data = await response.json();
				// Add the new context to the list
				const newContext: Context = {
					id: data.context_id,
					content: content.trim(),
					created_at: new Date().toISOString(),
					has_embedding: false, // Will be updated after embedding completes
				};
				onContextAdded(newContext);
				setContent("");
			}
		} catch (error) {
			console.error("Failed to save context:", error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-4">
			{contexts && contexts.length > 0 && (
				<>
					{contexts.map((context) => (
						<div
							key={context.id}
							className={`p-4 rounded-lg border border-border/40 ${
								!context.has_embedding
									? "bg-yellow-50 dark:bg-yellow-950/20"
									: ""
							}`}
						>
							<p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
								{context.content}
							</p>
						</div>
					))}
				</>
			)}

			{/* Add context form */}
			<div className="flex gap-2">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Add context..."
					className="flex-1 min-h-[80px] p-3 rounded-lg border border-border/40 bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-foreground/20"
					disabled={saving}
				/>
				<button
					onClick={handleSave}
					disabled={!content.trim() || saving}
					className="px-4 py-2 h-fit rounded-lg bg-foreground text-background text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
				>
					{saving ? "Saving..." : "Save"}
				</button>
			</div>
		</div>
	);
}
