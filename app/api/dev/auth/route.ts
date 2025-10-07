import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Not available in production" },
			{ status: 404 }
		);
	}
	const cookieStore = await cookies();
	const login = cookieStore.get("devUser")?.value ?? null;
	return NextResponse.json({ login });
}

export async function POST(request: Request) {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Not available in production" },
			{ status: 404 }
		);
	}
	const body = await request.json().catch(() => ({}));
	const login = typeof body?.login === "string" ? body.login.trim() : "";
	if (!login) {
		return NextResponse.json(
			{ error: "login is required" },
			{ status: 400 }
		);
	}
	const store = await cookies();
	store.set("devUser", login, {
		path: "/",
		httpOnly: true,
		secure: false,
		sameSite: "lax",
	});
	return NextResponse.json({ login });
}

export async function DELETE() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Not available in production" },
			{ status: 404 }
		);
	}
	const store = await cookies();
	store.delete("devUser");
	return NextResponse.json({ login: null });
}
