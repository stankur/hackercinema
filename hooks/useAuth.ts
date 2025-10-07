"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import { useSession as useMockSession } from "@/components/MockAuthProvider";

export function useAuth() {
	const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";
	const useSession = isMockMode ? useMockSession : useNextAuthSession;
	const { data: session, status } = useSession();

	return {
		login: session?.user?.username ?? null,
		loading: status === "loading",
	};
}
