# Route Audit

## Public

- `/`, `/auth/login`, `/auth/register`
- `/profile/:id` and `/showcase/:id` are public presentation routes and must continue respecting server-side privacy rules.

## Signed-in member

- `/dashboard`, `/dashboard/profile`, `/dashboard/people`, `/dashboard/links`, `/dashboard/messages`
- `/dashboard/meetup`, `/dashboard/build`, `/dashboard/experience`, `/dashboard/campus`, `/dashboard/ambassador`
- `/onboarding`

The profile editor is self-only. It retrieves the authenticated member through `/api/profile`; public people are opened with `/profile/:id`.

## Administrator

- `/admin` and its data-management actions.
- Executive analytics, student/partner management, operational stats, notification dispatch, Meet cohort planning, and destructive cleanup are server-gated with `requireAdmin`.

## Navigation findings fixed

- Replaced legacy `/dashboard/profile?email=...` links with the canonical public profile route.
- Link-accept notifications now target `/profile/:id` rather than the private editor.
- The authenticated profile route no longer depends on browser storage to know which profile to load.
