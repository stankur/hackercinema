import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GalleryModalProvider } from "@/components/GalleryModalProvider";
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
	return (
		<html lang="en" className="dark">
			<head></head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{process.env.NODE_ENV !== "production" ? (
					<DevAuthButton />
				) : null}
				<GalleryModalProvider>{children}</GalleryModalProvider>
			</body>
		</html>
	);
}
