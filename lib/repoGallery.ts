import type { GalleryImage } from "./types";
import dayjs from "dayjs";

export function parseOwnerRepoFromLink(
	link: string | undefined | null
): { owner: string; repo: string } | null {
	if (!link) return null;
	try {
		const url = new URL(link);
		if (url.hostname !== "github.com") return null;
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts.length < 2) return null;
		const [owner, repo] = parts;
		return owner && repo ? { owner, repo } : null;
	} catch {
		return null;
	}
}

export async function uploadRepoImageAndPersist(params: {
	username: string;
	owner: string;
	repoName: string;
	file: File;
	alt?: string;
	/** If true, mark this image as highlight */
	isHighlight?: boolean;
	/** Optional title to persist (empty string by default) */
	title?: string;
	/** Optional caption to persist (empty string by default) */
	caption?: string;
	/** Epoch ms the image was taken; defaults to now */
	takenAt?: number;
	signal?: AbortSignal;
}): Promise<{
	secureUrl: string;
	publicId: string;
	width?: number;
	height?: number;
}> {
	const {
		username,
		owner,
		repoName,
		file,
		alt,
		isHighlight,
		title,
		caption,
		takenAt,
		signal,
	} = params;

	// 1) Upload to Cloudinary via server route
	const form = new FormData();
	form.append("file", file);
	const uploadRes = await fetch(
		`/api/cloudinary/repo-gallery?username=${encodeURIComponent(
			username
		)}&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(
			repoName
		)}`,
		{ method: "POST", body: form, signal }
	);
	if (!uploadRes.ok) {
		const err = await safeJson(uploadRes);
		throw new Error(
			`cloudinary_upload_failed: ${uploadRes.status} ${JSON.stringify(
				err
			)}`
		);
	}
	const uploadJson = (await uploadRes.json()) as {
		ok: boolean;
		secure_url: string;
		public_id: string;
		width?: number;
		height?: number;
	};
	const secureUrl = uploadJson.secure_url;
	const publicId = uploadJson.public_id;

	// 2) Persist to backend
	const image: GalleryImage = {
		url: secureUrl,
		original_url: secureUrl,
		alt: alt ?? repoName,
		is_highlight: !!isHighlight,
		title: title ?? "",
		caption: caption ?? "",
		taken_at: takenAt ?? Date.now(),
	};

	const persistRes = await fetch(
		`/api/backend/users/${encodeURIComponent(
			username
		)}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
			repoName
		)}/gallery`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				images: [image],
				dedupe: "url",
				link: true,
			}),
			signal,
		}
	);
	if (!persistRes.ok) {
		const err = await safeJson(persistRes);
		throw new Error(
			`persist_failed: ${persistRes.status} ${JSON.stringify(err)}`
		);
	}

	return {
		secureUrl,
		publicId,
		width: uploadJson.width,
		height: uploadJson.height,
	};
}

async function safeJson(res: Response): Promise<unknown> {
	try {
		return await res.json();
	} catch {
		return { ok: false } as unknown;
	}
}

/**
 * Resolve the GitHub repo owner given a repo link and a fallback username.
 * Falls back to the provided username when the link is missing or unparsable.
 */
export function resolveRepoOwner(
	link: string | null | undefined,
	fallbackUsername: string
): string {
	const parsed = parseOwnerRepoFromLink(link || undefined);
	return parsed?.owner || fallbackUsername;
}

/**
 * Group gallery images by local calendar date using dayjs.
 * - Date key format: YYYY-MM-DD
 * - Images without taken_at are grouped under "Unknown" and sorted last.
 * - Dated groups are sorted in descending date order.
 */
export function groupGalleryByDate(
	images: GalleryImage[]
): Array<{ dateKey: string; items: GalleryImage[] }> {
	const buckets = new Map<string, GalleryImage[]>();

	for (const img of images || []) {
		const dateKey =
			typeof img.taken_at === "number"
				? dayjs(img.taken_at).format("YYYY-MM-DD")
				: "Unknown";
		if (!buckets.has(dateKey)) buckets.set(dateKey, []);
		buckets.get(dateKey)!.push(img);
	}

	const entries = Array.from(buckets.entries());

	entries.sort((a, b) => {
		const [da] = a;
		const [db] = b;
		if (da === "Unknown" && db === "Unknown") return 0;
		if (da === "Unknown") return 1; // Unknown last
		if (db === "Unknown") return -1;
		// Desc by date
		return dayjs(db).valueOf() - dayjs(da).valueOf();
	});

	return entries.map(([dateKey, items]) => ({ dateKey, items }));
}

/**
 * Persist highlight (pin) state for a single gallery image by URL.
 * Backend is expected to dedupe by URL and update the record.
 */
export async function persistImageHighlight(params: {
	username: string;
	owner: string;
	repoName: string;
	url: string;
	isHighlight: boolean;
	signal?: AbortSignal;
}): Promise<void> {
	const { username, owner, repoName, url, isHighlight, signal } = params;
	const res = await fetch(
		`/api/backend/users/${encodeURIComponent(
			username
		)}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
			repoName
		)}/gallery`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url, is_highlight: !!isHighlight }),
			signal,
		}
	);
	const body = await safeJson(res);
	console.info("[persistImageHighlight] response", {
		status: res.status,
		ok: res.ok,
		body,
		params: { username, owner, repoName, url, isHighlight },
	});
	if (!res.ok) {
		throw new Error(
			`pin_persist_failed: ${res.status} ${JSON.stringify(body)}`
		);
	}
}
