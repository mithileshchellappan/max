# Forking and Attribution

Max should be published as a real GitHub fork of `usebruno/bruno`, not as an unrelated repository with copied files.

Using a real fork gives visitors the clearest signal:

- GitHub shows `forked from usebruno/bruno`.
- Commit ancestry stays intact.
- Upstream license attribution is naturally preserved.
- Future upstream syncs remain possible.

Recommended setup from this local checkout:

```sh
git remote rename origin upstream
git remote add origin https://github.com/max-api-client/max.git
git push -u origin main
```

Only do this after creating `max-api-client/max` as a GitHub fork of `usebruno/bruno`.

## Branding Rules

- Product name: Max.
- Product icon/logo: Max assets only.
- Upstream attribution: keep Bruno credited in `README.md`, `NOTICE.md`, and `license.md`.
- Do not describe Max as official Bruno, Bruno Cloud, or a Bruno release.
- Keep `Bruno`, `Bru`, and `@usebruno/*` only where they refer to upstream code, collection formats, compatibility, or private package boundaries.

## Marketing Position

The clean public message is:

> Max is an independent Bruno fork for teams that want Bruno-compatible local API collections with opt-in cloud workspaces, invites, roles, and collaborative collection sharing.

Avoid positioning that attacks Bruno's local-first philosophy. Max is exploring a different collaboration model on top of Bruno's foundation.
