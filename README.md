For most people, hackathons are one day or two. For some, their life is the hackathon.

Their titles might be SWE, MLE, whatever, but at the core, they are real hackers and builders.

Hackercinema is the cinema where their stuff come together like a movie.

## Setup

### Environment Variables

Create a `.env.local` file. See `env.example` for all options.

#### Quick Start (Mock Auth - No GitHub Setup Required)

```bash
# Auth Mode (dev only) - both needed for full mock auth
NEXT_PUBLIC_USE_MOCK_AUTH=true
USE_MOCK_AUTH=true

# Backend API
BACKEND_BASE_URL=http://localhost:8080
API_KEY=your_backend_api_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

With mock auth enabled, you can use the DevAuthButton to impersonate any user without GitHub OAuth.

#### Real GitHub Authentication

To use real GitHub OAuth, leave `USE_MOCK_AUTH` unset or set to `false`, and add:

```bash
# GitHub OAuth App
GITHUB_APP_CLIENT_ID=your_client_id_here
GITHUB_APP_CLIENT_SECRET=your_client_secret_here

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

**Get GitHub credentials:**

1. Go to https://github.com/settings/apps
2. Create a New GitHub App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Get Client ID and generate Client Secret

### Development

**Mock Auth Mode** (`NEXT_PUBLIC_USE_MOCK_AUTH=true` and `USE_MOCK_AUTH=true`):

-   DevAuthButton appears at top of page
-   Enter any GitHub username to impersonate
-   No GitHub OAuth needed
-   Fast for local testing

**Real Auth Mode** (env vars unset or set to `false`):

-   Click "Join with GitHub" button
-   Full GitHub OAuth flow
-   Tests production auth behavior
-   DevAuthButton hidden

```bash
npm install
npm run dev
```

**Note:** In production, only real auth is used regardless of env vars.
