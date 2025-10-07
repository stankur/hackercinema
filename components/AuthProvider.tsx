"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - NextAuth v5 beta has type incompatibility with React 19
	return <SessionProvider>{children}</SessionProvider>;
}
