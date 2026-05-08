<br />
<img src="assets/images/logo-transparent.png" width="96" alt="Max logo" />

# Max

Max is an open-source API client forked from [Bruno](https://github.com/usebruno/bruno). It keeps Bruno's local collection workflow and adds a Convex-backed collaborative workspace layer with sign-in, shared collections, workspace members, and server-enforced roles.

Max is named after racing driver Max Verstappen. This is an independent fork of Bruno, not an official Bruno build.

## What Changed

- Convex cloud workspaces for multi-user collection sharing.
- Invite-by-email workspace membership.
- Server-side roles: owner, admin, editor, viewer.
- Atomic collection import into cloud workspaces.
- Packaged desktop app branded as Max.
- Original cat logo and app icon for the fork.

## Development

Install dependencies:

```sh
npm install
```

Create local env files:

```sh
cp .env.example .env.local
cp packages/bruno-app/.env.example packages/bruno-app/.env.local
```

Run Convex:

```sh
npm run convex:dev
```

Run the desktop app:

```sh
npm run dev:web
npm run dev:electron
```

## Convex Setup

Max expects Convex Auth plus the cloud URL in the renderer. The minimal local variables are documented in:

- `.env.example`
- `packages/bruno-app/.env.example`

Never commit `.env.local` files or deployment secrets.

## Packaging

The Electron package uses the product name `Max` and bundle identifier `com.max.app`.

For local unsigned builds:

```sh
npm run build:electron:mac
```

For public macOS distribution, sign with a Developer ID Application certificate and notarize the DMG before sharing.

## Upstream Attribution

Max is derived from Bruno and keeps Bruno's MIT license notice. The upstream `Bruno` name is a trademark of its owner and is not used as this fork's product name.

Many internal packages and data-format helpers still use Bruno/Bru naming because they refer to the underlying collection format and upstream package boundaries.

## License

[MIT](license.md)
