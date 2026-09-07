# Aptivo Connect - UI & Design System Documentation

**Specification & Design Reference Document**  
**Design Personality:** Modern + Youthful + Network-Centric + High-Whitespace Card Architecture  
**Device Support:** Desktop (1440px+), Laptop (1024px+), Tablet (768px - 1024px), Mobile (375px - 430px)

---

## 1. Admin Operations Control Center (`/admin`)

The Admin Portal is designed as a **dark, high-efficiency operations control center** with consistent layout architecture:

```
┌─────────────────┬────────────────────────────────────────────────────────┐
│  Aptivo Ops HQ  │  Good morning, Admin               [Sync] [Student View]│
├─────────────────┼────────────────────────────────────────────────────────┤
│ • Overview      │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ • Meet          │  │ Students │ │Pending M.│ │Active P. │ │Upcoming E│   │
│ • Build         │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│ • Experience    │                                                        │
│ • Access        │  ▼ PENDING ACTIONS QUEUE                               │
│ • Showcase      │  ┌──────────────────────────────────────────────────┐  │
│ • Ambassadors   │  │ 1. Review Meet Requests                          │  │
│ • Campus Pulse  │  │ 2. Approve Project Proposals                     │  │
│ • Partners CRM  │  │ 3. Ambassador Candidate Applications             │  │
│ • Students Dir  │  └──────────────────────────────────────────────────┘  │
│ • Dispatch Logs │                                                        │
│ • Analytics     │  ▼ OPERATIONS DATA TABLES & ACTIONS                     │
│ • Settings      │  [Search/Filters]  [Table / Cards]  [Empty States]     │
└─────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Admin UI Design Tokens & Rules

- **Background:** `#0B1310` (Dark Canvas), `#0F1B16` (Sidebar & Cards).
- **Cards & Surfaces:** Rounded corners (`rounded-3xl` / `rounded-2xl`), subtle borders (`border-slate-800`), clean typography.
- **Accents:** Emerald/Mint (`#22C55E`, `#10B981`) for confirmed states and active indicators; Amber for pending actions; Purple for Ambassador & Access perks; Rose for destructive actions.
- **Empty States:** When a category has 0 items, clean empty state cards are rendered with contextual icons and clear guidance.
- **Confirmation Modals:** All destructive actions (e.g. Rejecting a project, Deleting an experience, Purging dummy data) require an explicit confirmation dialog.
