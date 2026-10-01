---
name: aptivo-connect-ui
description: Use when changing Aptivo Connect student-facing UI, responsive layouts, navigation, or design tokens. Follow the repository's master reference and preserve product behavior.
---

# Aptivo Connect UI implementation skill

## Before changing UI

- Read `documentation/UI_DOCUMENTATION.md` and inspect `documentation/reference/aptivo-connect-master-reference.png` (and its annotated companion).
- Inspect the existing route and its API/session state before changing it. Keep MongoDB, signed HttpOnly authentication, authorization, Ably, navigation history, and form behavior intact unless the requested visual feature truly needs backend support.
- Use real API/database values only. Never copy sample names, counts, records, messages, or opportunities from the concept. Represent absent data with a designed empty state.
- `VISUAL_MIGRATION_CHECKLIST.md` is the existing progress tracker. Do not create another plan/checklist; update a route only after its real components have changed.

## Visual language

- Warm neutral canvas `#F7F6F1`, white surfaces, charcoal text `#18201C`, muted gray `#69736D`, quiet border `#E4E7E2`.
- Brand: Deep Forest `#174D3A`, Aptivo Green `#287A5B`, Sage `#E4EEE8`.
- Rare high-intent accent: Coral `#E86F51` and Peach `#FCE9E3`. Normal primary actions are Forest/Green; destructive and status colors remain semantic.
- Pair editorial serif display headings with readable sans-serif UI text. Keep body copy charcoal, contrast accessible, cards quiet, and photography natural.
- No decorative blue/cyan, neon, glow, purple decoration, heavy gradients, or oversized dashboard panels. Keep the authenticated product calmer than the public landing page.
- Use Lucide consistently, safe `Avatar` and `MediaImage` components, and shared row/card patterns where appropriate. Never show broken-image icons.

## Responsive/navigation contract

- Preserve the desktop top navigation; do not add a permanent student sidebar.
- On mobile show exactly Home, Meet, Build, Experience, Profile in the bottom nav, with safe-area padding and adequate touch targets.
- The mobile drawer must show the session-backed user identity, remain within the dynamic viewport/safe area, allow internal scrolling, lock background scrolling while open, and close on navigation/backdrop/close control.
- Use constrained desktop widths and intentional tablet compositions. Check narrow 360–430px screens for overflow, keyboard/composer overlap, and modal scrolling.

## Implementation and verification

- Edit actual route components, not only tokens. Preserve labels, accessible names, keyboard behavior, loading/error/empty states, and existing API contracts.
- Keep forms labeled and focus-visible; semantic status colors must not be repurposed as brand colors.
- Search changed student-facing code for old decorative palette classes after migration.
- Run `npx tsc --noEmit` and the production build when feasible. Render pages at mobile/tablet/desktop sizes when a browser is available; state `HUMAN VISUAL REVIEW REQUIRED` if not actually rendered.
- Never claim functionality or responsive rendering passed based only on CSS/code inspection. Do not start native wrapper/Phase 6 work.

## Surface mapping

Use the reference's visual grammar: landing hero, discovery home, drawer, image-led opportunity cards, compact conversation rows, and living profile. Extend the same system to Meet, Build workspaces, Experience, Campus, Connections, Chats, Showcase, Notifications, Settings, and Ambassador without inventing a separate visual language.

