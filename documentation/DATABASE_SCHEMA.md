# Aptivo Connect - Database Schema & Data Models

**Database Engine:** MongoDB Atlas  
**ORM / Driver:** Mongoose 8.x  
**Database Name:** `aptivo_connect`  
**Security:** `bcryptjs` password hashing with salt rounds

---

## 1. Collections & Field Definitions

### 1.1. `users` Collection (`src/lib/models/User.ts`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `fullName` / `name` | `String` (Required) | Full user name |
| `email` | `String` (Required, Unique, Index, Lowercase) | User email address |
| `passwordHash` | `String` | Secure bcrypt hashed password |
| `accountType` | `String` (`student` \| `professional`) | Public account type |
| `role` | `String` (`student` \| `professional` \| `admin`) | Platform access role |
| `phone` / `whatsapp` | `String` | Contact numbers for session reminders |
| `city` | `String` | User location |
| `profilePhoto` / `avatarUrl` | `String` | Profile picture URL |
| **Student Fields** | | |
| `university` / `campus` | `String` | Academic institute and campus |
| `degree` / `fieldOfStudy` | `String` | Academic degree and major |
| `currentYear` / `graduationYear` | `String` | Academic progression |
| **Professional Fields** | | |
| `organization` | `String` | Current company or institution |
| `jobTitle` / `industry` | `String` | Professional designation and sector |
| `experienceYears` | `String` | Years of industry experience |
| **Profile Details** | | |
| `bio` | `String` | Short bio statement |
| `skills` | `[String]` | Array of technical tool tags |
| `interests` | `[String]` | Array of domain interest tags |
| `linkedin` / `github` / `portfolio` | `String` | Public portfolio URLs |
| `otherLinks` | `[String]` | Custom links |
| `privacy` | `Object` | `{ isPublic: Boolean, showEmail: Boolean, showPhone: Boolean }` |
| `meetingsCount` / `projectsCount` / `experiencesCount` / `accessCount` | `Number` | Tracked verified activity metrics |

---

### 1.2. `ambassadorapplications` Collection (`src/lib/models/AmbassadorApplication.ts`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `ObjectId` (Ref: `User`, Index) | Applying student reference |
| `fullName` / `email` / `university` / `city` | `String` | Snapshot from profile |
| `whyAmbassador` | `String` | Motivation statement |
| `campusOrCommunity` | `String` | Target campus to represent |
| `leadershipExperience` | `String` | Previous student leadership experience |
| `whatsapp` / `availability` | `String` | Contact and weekly hours |
| `status` | `String` (Index) | `Draft`, `Submitted`, `Under Review`, `Shortlisted`, `Accepted`, `Rejected` |
| `adminNotes` / `responsibilities` | `String` | Internal notes and tasks assigned |
| `joinedAt` | `Date` | Timestamp of acceptance |

---

### 1.3. `partners` Collection (`src/lib/models/Partner.ts`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `organizationName` | `String` (Index) | Company or lab name |
| `type` | `String` | `Company`, `University`, `Research Lab`, `Tech Community`, `Platform Partner`, `Startup` |
| `contactPerson` / `contactEmail` / `contactPhone` | `String` | Partner contact info |
| `whatTheyProvide` | `String` | Exposure or visit descriptions |
| `pillarsSupported` | `[String]` | `MEET`, `BUILD`, `EXPERIENCE`, `ACCESS` |
| `partnershipStatus` | `String` | `Active`, `Prospecting`, `On Hold`, `Inactive` |
| `lastContactDate` / `internalNotes` | `String` | Internal CRM tracking notes |

---

### 1.4. `cohortsessions` Collection (`src/lib/models/CohortSession.ts`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` / `field` | `String` | Cohort title and domain |
| `mentorName` / `mentorRole` | `String` | Assigned mentor |
| `date` / `time` / `meetingLink` | `String` | Schedule and Google Meet link |
| `students` | `[Object]` | Array of batched students |
| `status` | `String` | `Scheduled`, `Completed`, `Cancelled` |
