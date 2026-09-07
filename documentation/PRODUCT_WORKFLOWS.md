# Aptivo Connect — Product Workflows & State Transition Specifications

This document defines the official, verified end-to-end workflows and state transition models across the Aptivo Connect platform.

---

## 1. Unified Authentication & Identity Workflow

```
                        [ /auth/register ]
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
         [ Student Registration ]     [ Professional Registration ]
                  │                             │
                  └──────────────┬──────────────┘
                                 ▼
                     [ Password bcrypt Hashed ]
                                 │
                                 ▼
                   [ User Created in Database ]
                                 │
                                 ▼
                         [ /onboarding ]
                (Basic Info → Academic/Work → Skills
                   → Interests → Portfolio Links)
                                 │
                                 ▼
                       [ Profile Completed ]
                                 │
                                 ▼
                      [ /auth/login (Unified) ]
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
           [ Admin Role ]   [ Student ]   [ Professional ]
                  │              │              │
                  ▼              ▼              ▼
              [ /admin ]   [ /dashboard ] [ /dashboard ]
```

---

## 2. MEET Pipeline Workflow

```
[ Student submits MeetRequest ] (/dashboard/meet)
       │ (Field, Target Role, Discussion Topic, Format)
       ▼
 [ Status: 'Submitted' ] ── Notification to Admin Ops
       │
       ▼
 [ Admin reviews in /admin ] ── Status: 'Finding Connection'
       │
       ▼
 [ Admin assigns Mentor + Date + Google Meet Link ]
       │
       ▼
 [ Status: 'Scheduled' ] ── Multi-channel Notification to Student
       │ (In-App + Email + WhatsApp Template Log)
       ▼
 [ Student & Mentor meet via Google Meet ]
       │
       ▼
 [ Admin / Student marks 'Completed' ]
       │
       ▼
 [ Student leaves Star Rating & Key Takeaways ]
```

---

## 3. BUILD Pipeline & Team Workspace Workflow

```
[ Student proposes Project ] (/dashboard/build)
       │ (Title, Problem, Solution, Required Skills, Milestones)
       ▼
 [ Status: 'Pending' ] ── Notification to Admin
       │
       ▼
 [ Admin Reviews in /admin ] ── Approve / Reject
       │
  ┌────┴────────────────────────┐
  ▼                             ▼
[ Rejected ]             [ Approved & Published ]
                                │
                                ▼
                   [ Other Students Apply ]
                     (Answers project-specific questions)
                                │
                                ▼
                   [ Project Lead Reviews Application ]
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
               [ Accepted ]            [ Rejected ]
                    │
                    ▼
       [ Member added to Workspace ] (/dashboard/build/[id])
                    │
       [ 6-Week Milestone Tracking + Scoped Discussion ]
                    │
                    ▼
       [ Sprint Finished → Submit for Showcase ]
                    │
                    ▼
       [ Admin Reviews & Publishes to /showcase ]
            (Verified Outcome Badge + Showcase Gallery)
```

---

## 4. EXPERIENCE Pipeline Workflow

```
[ Admin Creates Experience in /admin ]
       │ (Company, Category, Date, Time, Location, Seat Capacity)
       ▼
 [ Status: 'Upcoming' & Published ]
       │
       ▼
 [ Student browses /dashboard/experience ]
       │
       ▼
 [ Student Enrolls (1-Click using Profile) ]
       │
       ▼
 [ Capacity Check (e.g. 18 / 25 seats filled) ]
       │ (If capacity full, prevents enrollment)
       ▼
 [ Roster updated + Student receives In-App Confirmation ]
       │
       ▼
 [ Workplace Immersion / Lab Visit Conducted ]
       │
       ▼
 [ Admin Marks Completed in /admin ]
```

---

## 5. ACCESS Pipeline Workflow

```
[ Admin Creates Access Opportunity in /admin ]
       │ (Title, Category, Partner, Date/Time, Venue/Link, Perks)
       ▼
 [ Published on /dashboard/access ]
       │
       ▼
 [ Student Registers for Event / Claims Perk ]
       │
       ▼
 [ Registration recorded in database ]
```

---

## 6. Ambassador Program & Campus Pulse Workflow

```
[ Normal Student Account ]
       │ (Ambassador is NOT a registration type)
       ▼
 [ Student applies at /dashboard/ambassador ]
       │ (Motivation, Campus Representation, Leadership Exp, Availability)
       ▼
 [ Application Status: 'Submitted' ]
       │
       ▼
 [ Admin Reviews in /admin → 'Ambassador Apps' tab ]
       │
   ┌───┴────────────────────────┬────────────────────────┐
   ▼                            ▼                        ▼
[ Under Review ]          [ Shortlisted ]          [ Rejected ]
                                │                        │
                                ▼                        ▼
                          [ Accepted ]           [ Access Denied ]
                                │
                                ▼
               [ Unlocks Campus Pulse Portal ]
               (/dashboard/ambassador)
                                │
                                ▼
               [ Ambassador Reports Student Demand ]
               (Emerging interests, requested mentors, campus needs)
                                │
                                ▼
               [ Admin Ops Receives Real Demand in /admin ]
               (Action scheduled / Converted to Meet or Experience)
```

---

## 7. Internal Partner CRM Workflow

```
[ External Partner (Company, Lab, University, Startup) ]
       │ (Coordinates offline with Aptivo Ops)
       ▼
 [ Admin creates internal CRM record in /admin → 'Partners CRM' ]
       │ (Org Name, Contact, Email, Phone, Supported Pillars, What they provide, Notes)
       ▼
 [ Partner CRM records remain strictly internal to Admin ]
       │ (Partners do NOT have accounts or a self-service portal)
       ▼
 [ Aptivo Ops creates resulting opportunity in MEET, BUILD, EXPERIENCE, or ACCESS ]
```
