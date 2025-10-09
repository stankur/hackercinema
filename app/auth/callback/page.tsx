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
			// Call login endpoint to handle activation/pipeline
			fetch(`/api/backend/users/${session.user.username}/login`, {
				method: "POST",
			})
				.then(() => {
					// Redirect to user's profile after login
					router.push(
						`/personalized/${session.user.username}/profile`
					);
				})
				.catch((error) => {
					console.error(
						`Failed to login user ${session.user.username}:`,
						error
					);
					// Still redirect even if login fails
					router.push(
						`/personalized/${session.user.username}/profile`
					);
				});
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
