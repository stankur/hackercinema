import "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			username: string;
		};
	}

	interface User {
		username: string;
	}
}

declare module "@auth/core/jwt" {
	interface JWT {
		username: string;
	}
}
