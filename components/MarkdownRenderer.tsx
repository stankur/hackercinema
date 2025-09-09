"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import mermaid from "mermaid";
import { getCodeString } from "rehype-rewrite";

const randomId = () => Math.random().toString(36).substring(2, 15);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Code = (props: any) => {
	const { children = [], className } = props;
	const demoId = useRef(`dome${randomId()}`);
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const isMermaid =
		className && /^language-mermaid/.test(className.toLowerCase());
	const code = children
		? getCodeString(props.node?.children)
		: children[0] || "";

	useEffect(() => {
		// Initialize mermaid with dark theme
		mermaid.initialize({
			startOnLoad: false,
			theme: "dark",
			themeVariables: {
				primaryColor: "#6366f1",
				primaryTextColor: "#f1f5f9",
				primaryBorderColor: "#4f46e5",
				lineColor: "#64748b",
				secondaryColor: "#1e293b",
				tertiaryColor: "#0f172a",
				background: "#0f172a",
				mainBkg: "#1e293b",
				secondBkg: "#334155",
				tertiaryBkg: "#475569",
			},
		});
	}, []);

	useEffect(() => {
		if (container && isMermaid && demoId.current && code) {
			mermaid
				.render(demoId.current, code)
				.then(({ svg, bindFunctions }) => {
					container.innerHTML = svg;
					if (bindFunctions) {
						bindFunctions(container);
					}
				})
				.catch((error) => {
					console.error("Mermaid rendering error:", error);
				});
		}
	}, [container, isMermaid, code]);

	const refElement = useCallback((node: HTMLElement | null) => {
		if (node !== null) {
			setContainer(node);
		}
	}, []);

	if (isMermaid) {
		return (
			<Fragment>
				<code id={demoId.current} style={{ display: "none" }} />
				<code
					className={className}
					ref={refElement}
					data-name="mermaid"
				/>
			</Fragment>
		);
	}
	return <code className={className}>{children}</code>;
};

interface MarkdownRendererProps {
	content: string;
}

interface Section {
	title: string;
	content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
	const [sections, setSections] = useState<Section[]>([]);
	const [expandedSections, setExpandedSections] = useState<Set<number>>(
		new Set()
	);

	// Parse content into sections based on headings
	useEffect(() => {
		const parseSections = (text: string): Section[] => {
			// Split by markdown headings (##, ###, ####, etc.)
			const headingRegex = /^(#{1,6})\s+(.+)$/gm;
			const parts = text.split(headingRegex);

			const sections: Section[] = [];
			let currentSection: Section | null = null;

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i].trim();

				// If it's a heading marker (#, ##, etc.)
				if (part.match(/^#{1,6}$/)) {
					// The next part is the heading text
					const title = parts[i + 1]?.trim() || "";
					if (title) {
						// Save previous section if exists
						if (currentSection) {
							sections.push(currentSection);
						}
						// Start new section
						currentSection = {
							title: title,
							content: "",
						};
						i++; // Skip the title part
					}
				} else if (part && currentSection) {
					// Add content to current section
					currentSection.content +=
						(currentSection.content ? "\n\n" : "") + part;
				} else if (part && !currentSection) {
					// Content before any heading - create a default section
					currentSection = {
						title: "Description",
						content: part,
					};
				}
			}

			// Add the last section
			if (currentSection) {
				sections.push(currentSection);
			}

			// If no sections were created, create one with all content
			if (sections.length === 0) {
				sections.push({
					title: "Description",
					content: text,
				});
			}

			return sections;
		};

		const parsedSections = parseSections(content);
		setSections(parsedSections);
		// Expand all sections by default
		setExpandedSections(new Set(parsedSections.map((_, index) => index)));
	}, [content]);

	const toggleSection = (index: number) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const renderMarkdownContent = (content: string) => (
		<div className="markdown-content [&_*]:text-sm [&_h2]:text-sm [&_h1]:text-sm [&_ul]:list-disc [&_ol]:list-decimal [&_li]:leading-relaxed">
			<MarkdownPreview
				source={content}
				style={{
					padding: 0,
					backgroundColor: "transparent",
				}}
				wrapperElement={{
					"data-color-mode": "dark",
				}}
				components={{
					code: Code,
				}}
			/>
		</div>
	);

	return (
		<div className="space-y-16">
			{sections.map((section, index) => (
				<div key={index} className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-bold underline underline-offset-4 text-foreground font-mono tracking-widest uppercase">
							{section.title.toUpperCase()}
						</h2>
						<button
							onClick={() => toggleSection(index)}
							className="text-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono"
						>
							{expandedSections.has(index) ? "—" : "+"}
						</button>
					</div>
					{expandedSections.has(index) && (
						<div>{renderMarkdownContent(section.content)}</div>
					)}
				</div>
			))}
		</div>
	);
}
