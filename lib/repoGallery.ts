import type { GalleryImage } from "./types";

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
