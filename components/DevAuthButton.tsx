"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DevAuthButton() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [login, setLogin] = useState("");
	const [current, setCurrent] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			if (process.env.NODE_ENV === "production") return;
			try {
				const res = await fetch("/api/dev/auth", { cache: "no-store" });
				const data = await res.json();
				setCurrent(data?.login ?? null);
			} catch {}
		}
		load();
	}, []);

	async function impersonate() {
		if (!login.trim()) return;
		const username = login.trim();

		// Set dev auth cookie
		await fetch("/api/dev/auth", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login: username }),
		});

		// Call backend login endpoint to trigger pipeline (like real sign-in)
		try {
			await fetch(`/api/backend/users/${username}/login`, {
				method: "POST",
			});
		} catch (error) {
			console.error(`Failed to login user ${username}:`, error);
			// Continue even if login fails
		}

		setOpen(false);
		// Redirect to personalized profile
		router.push(`/personalized/${username}/profile`);
	}

	async function clearImpersonation() {
		await fetch("/api/dev/auth", { method: "DELETE" });
		setOpen(false);
		router.refresh();
	}

	if (process.env.NODE_ENV === "production") return null;

	return (
		<div className="w-full px-4 py-2">
			<div className="max-w-6xl mx-auto flex items-center gap-3">
				<button
					onClick={() => setOpen((v) => !v)}
					className="text-sm px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
				>
					{current ? `Auth (as ${current})` : "Auth"}
				</button>
				{open && (
					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="username"
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							className="text-sm px-2 py-1 rounded border border-neutral-700 bg-neutral-900"
						/>
						<button
							onClick={impersonate}
							className="text-sm px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
						>
							Impersonate
						</button>
						<button
							onClick={clearImpersonation}
							className="text-sm px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-800"
						>
							Clear
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
