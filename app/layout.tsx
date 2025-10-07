import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GalleryModalProvider } from "@/components/GalleryModalProvider";
import AuthProvider from "@/components/AuthProvider";
import { MockAuthProvider } from "@/components/MockAuthProvider";
import DevAuthButton from "@/components/DevAuthButton";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Builder Directory",
	description: "A curated list of developers and their highlighted projects",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const useMockAuth =
		process.env.NODE_ENV !== "production" &&
		process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

	console.log("[layout] DEBUG:", {
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH,
		useMockAuth,
		willShowDevButton: useMockAuth,
	});

	const Provider = useMockAuth ? MockAuthProvider : AuthProvider;

	return (
		<html lang="en" className="dark">
			<head></head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Provider>
					{useMockAuth && <DevAuthButton />}
					<GalleryModalProvider>{children}</GalleryModalProvider>
				</Provider>
			</body>
		</html>
	);
}
