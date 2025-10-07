"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;

		if (session?.user?.username) {
			// Redirect to user's profile
			router.push(`/personalized/${session.user.username}`);
		} else {
			// Not authenticated, redirect to home
			router.push("/");
		}
	}, [session, status, router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-muted-foreground">Redirecting...</div>
		</div>
	);
}
