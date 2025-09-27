"use client";

import { useEffect, useState } from "react";

export function useDevUser() {
	const [login, setLogin] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let canceled = false;
		async function load() {
			setLoading(true);
			try {
				if (process.env.NODE_ENV === "production") {
					setLogin(null);
					return;
				}
				const res = await fetch("/api/dev/auth", { cache: "no-store" });
				const data = await res.json();
				if (!canceled) setLogin(data?.login ?? null);
			} finally {
				if (!canceled) setLoading(false);
			}
		}
		load();
		return () => {
			canceled = true;
		};
	}, []);

	return { login, loading };
}
