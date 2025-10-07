"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface MockSession {
	user: {
		username: string;
	};
}

interface SessionContextValue {
	data: MockSession | null;
	status: "loading" | "authenticated" | "unauthenticated";
	update: () => Promise<MockSession | null>;
}

const MockSessionContext = createContext<SessionContextValue | undefined>(
	undefined
);

export function MockAuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<MockSession | null>(null);
	const [status, setStatus] = useState<
		"loading" | "authenticated" | "unauthenticated"
	>("loading");

	const loadSession = async () => {
		try {
			const res = await fetch("/api/dev/auth", { cache: "no-store" });
			const data = await res.json();
			if (data?.login) {
				setSession({ user: { username: data.login } });
				setStatus("authenticated");
			} else {
				setSession(null);
				setStatus("unauthenticated");
			}
			return session;
		} catch {
			setSession(null);
			setStatus("unauthenticated");
			return null;
		}
	};

	useEffect(() => {
		loadSession();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MockSessionContext.Provider
			value={{ data: session, status, update: loadSession }}
		>
			{children}
		</MockSessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(MockSessionContext);
	if (!context) {
		throw new Error("useSession must be used within MockAuthProvider");
	}
	return context;
}

// Mock auth functions for compatibility with NextAuth API
export async function signIn() {
	console.warn("signIn called in mock mode - use DevAuthButton instead");
}

export async function signOut() {
	await fetch("/api/dev/auth", { method: "DELETE" });
	window.location.reload();
}
