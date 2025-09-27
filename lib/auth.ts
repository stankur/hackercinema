import { cookies } from "next/headers";

export type AuthUser = {
	login: string;
};

export async function getServerUser(): Promise<AuthUser | null> {
	// Dev-only impersonation via cookie
	if (process.env.NODE_ENV === "production") {
		return null;
	}
	const cookieStore = await cookies();
	const devUser = cookieStore.get("devUser")?.value?.trim();
	if (!devUser) return null;
	return { login: devUser };
}

export function isOwner(username: string, user: AuthUser | null): boolean {
	return !!user && user.login.toLowerCase() === username.toLowerCase();
}
