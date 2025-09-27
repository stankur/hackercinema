import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
	process.env.BACKEND_BASE_URL || "http://localhost:8080";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return forwardRequest(request, path, "GET");
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return forwardRequest(request, path, "POST");
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return forwardRequest(request, path, "PUT");
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	return forwardRequest(request, path, "DELETE");
}

async function forwardRequest(
	request: NextRequest,
	path: string[],
	method: string
) {
	try {
		const url = `${BACKEND_BASE_URL}/${path.join("/")}`;
		const searchParams = request.nextUrl.searchParams.toString();
		const fullUrl = searchParams ? `${url}?${searchParams}` : url;

		const headers: Record<string, string> = {};

		// Forward relevant headers
		request.headers.forEach((value, key) => {
			if (
				key.toLowerCase() !== "host" &&
				!key.toLowerCase().startsWith("x-")
			) {
				headers[key] = value;
			}
		});

		// Ensure upstream returns uncompressed payload to avoid encoding mismatches
		headers["accept-encoding"] = "identity";

		const options: RequestInit = {
			method,
			headers,
		};

		// Add body for POST/PUT requests
		if (method === "POST" || method === "PUT") {
			const body = await request.text();
			if (body) {
				options.body = body;
			}
		}

		const response = await fetch(fullUrl, options);

		// Normalize to JSON response for the app layer API
		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Backend proxy error:", error);
		return NextResponse.json(
			{ error: "Backend service unavailable" },
			{ status: 503 }
		);
	}
}
