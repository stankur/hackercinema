"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
	// @ts-expect-error - NextAuth v5 beta has type incompatibility with React 19
	return <SessionProvider>{children}</SessionProvider>;
}
