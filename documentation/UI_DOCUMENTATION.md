# Aptivo Connect UI reference

This is the implementation reference for the student-facing product. The supplied visual source is stored at `documentation/reference/aptivo-connect-master-reference.png`; use the annotated companion for the screen mapping.

## Visual contract

| Purpose | Token | Use |
| --- | --- | --- |
| Environment | `#F7F6F1` | Application canvas |
| Surface | `#FFFFFF` | Cards, inputs, menus |
| Primary text | `#18201C` | Reading text and headings |
| Secondary text | `#69736D` | Metadata only |
| Quiet border | `#E4E7E2` | Separation, never heavy framing |
| Deep Forest | `#174D3A` | Brand, primary actions, active navigation |
| Aptivo Green | `#287A5B` | Supporting identity and selected controls |
| Soft Sage | `#E4EEE8` | Chips, selected rows, quiet fills |
| Warm Coral | `#E86F51` | Rare high-intent action: join, apply, register |
| Soft Peach | `#FCE9E3` | Supporting high-intent accent fill |

Student UI should have a warm neutral canvas, white surfaces, quiet borders, editorial display headings and clean sans-serif controls. Coral is reserved for high-intent actions. Do not use decorative blue/cyan/purple, neon/glow, or generic gradients. Semantic success, warning, error, and info colors remain semantic.

## Reference screen map

1. Landing: human, editorial identity, connection paths and a coral Join Connect action.
2. Home: real-data greeting, one image-led featured opportunity, compact discovery rhythm.
3. Mobile drawer: session-backed identity header, grouped rows, Sage selected state and correct safe areas.
4. Build: real project cover, recruiting/status pill, chips, compact member context and coral Apply.
5. Chats: conversation rows (not cards), two-pane desktop conversation, calm message bubbles and safe composer.
6. Profile: persisted cover, overlapping safe avatar, identity, real skills/evidence and Aptivo Journey.

All other student screens inherit these primitives: image opportunity cards, compact discovery rows, person rows, conversation rows, activity rows, settings rows, quiet tabs, intentional empty/error/loading states, and safe media fallbacks. Admin remains an operational surface and is not governed by this consumer UI treatment.

## Guardrails

- Use real API/database values. Never import sample names or counts from the visual reference.
- Preserve session-backed identity, authorization, APIs, realtime transport, forms, and navigation behavior during visual work.
- Every touch target is at least approximately 40px. Use the five-item mobile navigation and a top navigation on desktop.
- Check 360px, 390px, 430px, 768px, 1024px and 1440px when rendering is available. Code inspection alone is not visual QA.
- Use `skills/ui/SKILL.md` for future frontend work.

