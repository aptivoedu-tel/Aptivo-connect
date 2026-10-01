# API Audit

## Authentication and authorization fixes

| Area | Outcome |
| --- | --- |
| Profile editing and avatar upload | Signed session is authoritative; client email/user ID is ignored. |
| Admin students, partners, stats, executive analytics | `requireAdmin` added. |
| Notification dispatch and dummy-data cleanup | `requireAdmin` added. |
| Meet listing and creation | Signed user is authoritative; members can only read their own Meet requests. |
| Meet update, cohort batch, cohort suggestions | `requireAdmin` added. |
| Ambassador campus data | `requireUser` added. |
| Peer reputation | Signed reviewer is authoritative; request `reviewerEmail` is ignored. |

## Runtime unauthorized probes

The local development server returned `401` for protected GET endpoints and for unauthenticated POSTs to `/api/meet` and `/api/reputation`.

## Review still required

- Authenticated role-path behavior requires real member and admin sessions.
- The public avatar and public-profile read endpoints intentionally remain public; they should be reviewed with production privacy requirements before launch.
