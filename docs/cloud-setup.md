# Cloud Setup

Max uses Convex for shared workspaces, membership, roles, and cloud collection storage.

## Required Convex Values

Create a Convex project and copy these values into local env files:

```sh
# .env.local
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.site

# packages/bruno-app/.env.local
VITE_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Required for built-in email/password auth verification
RESEND_API_KEY=your-resend-api-key
AUTH_EMAIL_FROM="Max <onboarding@your-domain.com>"
```

`CONVEX_URL` is the normal Convex client URL. `CONVEX_SITE_URL` is the HTTP Actions/Auth site URL.

Do not commit `.env.local` files or deployment secrets.

## Auth

The app is wired for Convex Auth. A public Max build should point at the maintainer's Convex deployment only if that deployment is meant to host users.

For self-hosting, each operator should create their own Convex deployment and configure their own auth provider. Do not reuse another maintainer's deployment as an invite key or shared credential.

The built-in email/password provider requires email verification before invite claims are activated. Configure `RESEND_API_KEY` and `AUTH_EMAIL_FROM` in the Convex environment, or replace the provider in `convex/auth.ts` with another verified-email provider.

## Workspace Access

Max workspaces are server-side Convex records. Access is controlled by workspace membership and role checks in Convex functions.

Current roles:

- `owner`
- `admin`
- `editor`
- `viewer`

New users who sign in should not automatically get access to every workspace. They need to create a workspace or be added through the workspace membership flow.

## Imports

Cloud imports should be treated as atomic user-visible operations. A collection should become visible to other workspace members only after the import has completed successfully.

## CLI

The `bru` CLI is local-file based. It does not use Convex auth, workspace membership, or cloud collections.
