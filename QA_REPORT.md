# Aptivo Connect — Phase 5 QA Report

Audit date: 2026-10-01

## Result

**Not production-ready for sign-off yet.** The application compiles and has passed a production build, and the identified profile-image and access-control defects were fixed. Authenticated multi-user and visual browser checks still require two real sessions and a stable deployed/runtime environment.

## Completed checks

- `tsc --noEmit` — passed after the fixes.
- `next build` — passed. The only warning is an Ably transitive `keyv` dynamic-dependency warning; it did not stop compilation or type validation.
- Unauthenticated runtime probes returned `401` for `/api/profile`, admin data routes, stats, notification dispatch, Meet routes, cohort routes, Ambassador data, and POST `/api/reputation`.
- Profile editor data flow reviewed and corrected to load `/api/profile` from the signed session with `cache: 'no-store'`.
- Public-person links now use `/profile/:id`; they no longer send users to the private profile editor with an ignored email query.

## Required before release

- Test profile/avatar display and replacement in a signed-in browser session.
- Run the required two-account direct-chat, project-chat, reconnect, and unauthorized-conversation checks.
- Exercise member and admin Meet workflows after the session-authority changes.
- Run the manual responsive checklist in `VISUAL_QA_CHECKLIST.md` on real device/browser sizes.

## Phase 5.1 live-verification update — 2026-10-01

- `.env.local` contains `MONGODB_URI`, `SESSION_SECRET`, and `ABLY_API_KEY` (values were not exposed).
- The local app started successfully at `http://localhost:3000`; `/auth/login` returned `200`.
- Unauthenticated `/api/auth/me`, `/api/realtime/token`, and `/api/profile` correctly returned `401`.
- Initial sandbox-hosted development server could not reach Atlas. Direct elevated host checks confirmed Atlas shard TCP access; with the host-network server, demo-user login (`hamza.raza@aptivo.pk`) returned `200` in four seconds.
- Signed-in avatar verification passed for the persisted GridFS image: header, profile editor, profile preview, and a browser refresh all rendered the same avatar with no browser-console errors.
- Replacement upload did not run because the available in-app browser did not expose a usable file chooser. Cross-user, realtime, project, reconnect, and authenticated responsive tests remain blocked because only one browser session/profile is available.

## Storage authority audit

`aptivo_user` remains only as a backward-compatible display cache in legacy navigation, profile, and discovery components. It is never accepted by protected APIs as identity, role, ownership, membership, or admin authority; those APIs use the signed HttpOnly session. Notifications now call session-backed endpoints without an email cache. `aptivo_dark_mode` is a harmless visual preference; the BackButton session-storage record contains only an internal return URL and timestamp.

Remaining legacy display caches should be removed gradually in favour of `/api/auth/me`; they are not a security boundary and may only cause stale, non-authoritative display data.
