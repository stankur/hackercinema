import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
	return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
	try {
		const url = new URL(request.url);
		const username = (url.searchParams.get("username") || "").trim();
		const owner = (url.searchParams.get("owner") || "").trim();
		const repo = (url.searchParams.get("repo") || "").trim();

		if (!username || !owner || !repo) {
			return jsonError("missing_params", 400);
		}

		// Authenticate: user must be uploading to their own account
		const useMockAuth =
			process.env.NODE_ENV !== "production" &&
			process.env.USE_MOCK_AUTH === "true";

		if (useMockAuth) {
			// Validate dev cookie
			const { cookies } = await import("next/headers");
			const cookieStore = await cookies();
			const devUser = cookieStore.get("devUser")?.value || null;

			if (!devUser) {
				return jsonError("unauthorized", 401);
			}
			if (devUser !== username) {
				return jsonError("forbidden", 403);
			}
		} else {
			// Use real NextAuth session
			const session = await auth();
			if (!session || !session.user) {
				return jsonError("unauthorized", 401);
			}
			if (session.user.username !== username) {
				return jsonError("forbidden", 403);
			}
		}

		const form = await request.formData();
		const file = form.get("file");
		if (!file || !(file instanceof File)) {
			return jsonError("file_missing", 400);
		}

		// Basic validation
		const contentType = (file as File).type || "";
		if (!contentType.startsWith("image/")) {
			return jsonError("invalid_type", 400);
		}
		const maxBytes = 10 * 1024 * 1024; // 10MB
		if ((file as File).size > maxBytes) {
			return jsonError("file_too_large", 413);
		}

		// Configure Cloudinary (server-side)
		const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
		const apiKey = process.env.CLOUDINARY_API_KEY;
		const apiSecret = process.env.CLOUDINARY_API_SECRET;
		if (!cloudName || !apiKey || !apiSecret) {
			return jsonError("cloudinary_env_missing", 500);
		}
		cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
		});

		const folder = `builders/${username}/${owner}/${repo}`;

		// Convert File -> Buffer
		const arrayBuffer = await (file as File).arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uploadResult = await new Promise<UploadApiResponse>(
			(resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder,
						resource_type: "image",
						unique_filename: true,
						overwrite: false,
					},
					(error, result) => {
						if (error) return reject(error);
						if (!result) return reject(new Error("no_result"));
						resolve(result);
					}
				);
				stream.end(buffer);
			}
		);

		return NextResponse.json(
			{
				ok: true,
				secure_url: uploadResult.secure_url,
				public_id: uploadResult.public_id,
				width: uploadResult.width,
				height: uploadResult.height,
				format: uploadResult.format,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error("cloudinary upload error", err);
		return jsonError("upload_failed", 500);
	}
}
