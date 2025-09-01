"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
	const pathname = usePathname();

	return (
		<div className="flex justify-center mb-12 relative z-20">
			<div className="flex gap-10">
				<Link
					href="/"
					className={`text-sm transition-colors ${
						pathname === "/"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Hackers
				</Link>

				<Link
					href="/projects"
					className={`text-sm transition-colors ${
						pathname === "/projects"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Projects
				</Link>

				<Link
					href="/filter"
					className={`text-sm transition-colors ${
						pathname === "/filter"
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Join
				</Link>
			</div>
		</div>
	);
}
