import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

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
	const authCheck = await checkAuth(path);
	if (authCheck) return authCheck;
	return forwardRequest(request, path, "POST");
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	const authCheck = await checkAuth(path);
	if (authCheck) return authCheck;
	return forwardRequest(request, path, "PUT");
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	const authCheck = await checkAuth(path);
	if (authCheck) return authCheck;
	return forwardRequest(request, path, "DELETE");
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	const authCheck = await checkAuth(path);
	if (authCheck) return authCheck;
	return forwardRequest(request, path, "PATCH");
}

async function checkAuth(path: string[]): Promise<NextResponse | null> {
	// Extract username from path
	// Expected pattern: ['users', 'username', ...]
	if (path[0] !== "users" || !path[1]) {
		return NextResponse.json(
			{ error: "Invalid path format" },
			{ status: 400 }
		);
	}

	const targetUsername = path[1];

	// Check if using mock auth in dev
	const useMockAuth =
		process.env.NODE_ENV !== "production" &&
		process.env.USE_MOCK_AUTH === "true";

	if (useMockAuth) {
		// Validate dev cookie
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		const devUser = cookieStore.get("devUser")?.value || null;

		if (!devUser) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (devUser !== targetUsername) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return null;
	}

	// Use real NextAuth session
	const session = await auth();

	if (!session || !session.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.user.username !== targetUsername) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	return null;
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

		// Inject Authorization header if API_KEY is configured and not already present
		if (!headers["authorization"]) {
			const apiKey = process.env.API_KEY;
			if (apiKey) {
				headers["authorization"] = `Bearer ${apiKey}`;
			}
		}

		const options: RequestInit = {
			method,
			headers,
		};

		// Add body for POST/PUT/PATCH requests
		if (method === "POST" || method === "PUT" || method === "PATCH") {
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
