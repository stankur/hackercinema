import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		GitHub({
			clientId: process.env.GITHUB_APP_CLIENT_ID!,
			clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async jwt({ token, profile }) {
			if (
				profile &&
				typeof profile === "object" &&
				"login" in profile &&
				typeof profile.login === "string"
			) {
				token.username = profile.login;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.username = token.username as string;
			return session;
		},
	},
});

export { auth, signIn, signOut };
export const GET = handlers.GET;
export const POST = handlers.POST;
