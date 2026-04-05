# AgileDrop Hackathon Game Master — Product Specification

**Version:** 1.0  
**Date:** April 2026  
**Format:** Internal Pair Vibe Coding Hackathon  
**Audience:** Engineering team + event organizers

---

## 1. Product Overview

A web application to manage AgileDrop's internal hackathon events end-to-end. The app handles registration, team formation, project and tech stack assignment, and — most importantly — acts as a live game engine that introduces MasterChef-style chaos events during the competition. It is both the tool competitors interact with and the display projected on the office screen during the event.

### Core Principles

- **Fair competition.** The team-matching algorithm ensures balanced pairs by complementing high-skill with lower-skill developers.
- **Controlled chaos.** Admins can trigger obstacles, swap projects, inject requirements, and generally keep the event unpredictable and entertaining.
- **Spectator-friendly.** A dedicated projector/big-screen view shows teams, scores, countdowns, and obstacle alerts with dramatic visual effects.
- **Minimal friction.** Google SSO restricted to `@agiledrop.com`. One click to join, one slider to set your skill level.

---

## 2. User Roles

### 2.1 Participant (Developer)

Any `@agiledrop.com` Google account holder. Can register for the event, self-rate their vibe coding skill level, view their team assignment and project spec once the event starts, and see active obstacles affecting their team.

### 2.2 Admin (Game Master)

Promoted by another admin or configured at setup. Admins have full backend access: they manage the player roster, edit projects and tech stacks, control the game lifecycle (start, pause, end), trigger obstacles, swap assignments between teams, and re-rate developer skill levels. Admins can opt themselves out of competition so they don't get assigned to a team.

### 2.3 Spectator (Projector Mode)

No authentication required. A read-only big-screen view accessible from the login screen. Designed for a projector in the office — shows teams, assignments, countdown timer, event log, and full-screen obstacle alert animations.

---

## 3. Authentication & Access Control

### 3.1 Google OAuth 2.0

- Sign in with Google. Only accounts with email domain `@agiledrop.com` are permitted.
- On first login, the user is created in the system with default vibe level 3 and participant role.
- On subsequent logins, the existing profile is loaded.
- No password management — Google handles all auth.

### 3.2 Domain Restriction

The OAuth consent screen and application-level validation must both enforce the domain. If a non-`@agiledrop.com` account attempts login, display an access denied message and do not create a user record.

### 3.3 Role Assignment

- First user to register (or a pre-seeded config) becomes the initial admin.
- Admins can promote/demote other users to/from admin.
- Admins can toggle their own "opted out of competition" flag.

---

## 4. Registration & Player Profiles

### 4.1 Profile Fields

| Field | Type | Source | Editable By |
|---|---|---|---|
| Name | string | Google account | Read-only |
| Email | string | Google account | Read-only |
| Avatar | image URL | Google account | Read-only |
| Vibe Coding Level | integer 1–5 | Self-rated | Player + Admin |
| Role | enum: participant / admin | System | Admin only |
| Opted Out | boolean | System | Admin only |
| Registered At | timestamp | System | Read-only |

### 4.2 Vibe Coding Level Scale

| Level | Label | Description |
|---|---|---|
| 1 | Vibe Padawan | New to vibe coding / AI-assisted workflows |
| 2 | Vibe Apprentice | Comfortable prompting, needs guidance on architecture |
| 3 | Vibe Knight | Solid AI-assisted dev, can work independently |
| 4 | Vibe Master | Strong output, can guide a partner effectively |
| 5 | Vibe Overlord | Elite-tier, ships production features in a single session |

Players self-rate during registration. Admins can override any player's level at any time (before or during the event) based on observed performance or prior knowledge.

### 4.3 Registration Period

Registration is open while the game is in the `registration` phase. Once an admin starts the event, registration closes. Late arrivals can only be manually added by an admin and would need a manual team assignment.

---

## 5. Team Formation Algorithm

### 5.1 Pairing Strategy

Teams are pairs of two (pair vibe coding). The algorithm aims for balanced total skill across teams.

**Algorithm:**

1. Collect all active participants (not opted out, not admin-opted-out).
2. Sort by vibe level descending.
3. Pair the highest-rated player with the lowest-rated, the second-highest with the second-lowest, and so on (fold pairing).
4. If an odd number of players exists, the middle-ranked player forms a solo team (flagged for admin attention — admin may choose to join them or keep them solo).

**Example with 8 players rated [5, 5, 4, 3, 3, 2, 2, 1]:**

| Team | Player A | Player B | Total |
|---|---|---|---|
| Team 1 | 5 | 1 | 6 |
| Team 2 | 5 | 2 | 7 |
| Team 3 | 4 | 2 | 6 |
| Team 4 | 3 | 3 | 6 |

This yields totals of 6, 7, 6, 6 — variance of 0.25, which is near-optimal.

### 5.2 Admin Override

After automated pairing, admins can manually swap individual players between teams before or during the event.

---

## 6. Projects

### 6.1 Project Spec Structure

Each project is a fun, slightly absurd web application concept. The spec gives teams enough direction to build something demoable in the hackathon timeframe while leaving room for creativity.

| Field | Type | Description |
|---|---|---|
| ID | string | Unique identifier |
| Name | string | Product codename (e.g., "NeuroTask", "BugBnB") |
| Tagline | string | One-line pitch |
| Spec | text | 2–4 sentence product description with at least one entertaining constraint |
| Difficulty | enum: easy / medium / hard | Optional, for balancing |

### 6.2 Pre-loaded Project Examples

1. **NeuroTask** — "Your tasks know you better than you know yourself." An AI-powered task manager that predicts procrastination patterns and auto-reschedules tasks. Must include a "shame meter."

2. **CryptoKitchen** — "Where pull requests meet pulled pork." Recipe-sharing platform with AI food critic ratings. Users can "fork" recipes with git-style lineage tracking.

3. **MeetingDetox** — "Because that meeting could have been an email." Meeting management tool with sentiment analysis that detects unproductive meetings and suggests ending them.

4. **BugBnB** — "One dev's bug is another dev's feature." Marketplace for developers to trade bugs, with difficulty ratings and a leaderboard.

5. **RetroType** — "Write docs like it's 1999." Real-time collaborative editor styled like a 90s terminal with typing sounds, cursor trails, and hacker mode.

6. **DeployPray** — "Deploy with inner peace." CI/CD dashboard with mandatory mindfulness exercises before each deploy.

7. **StackOverfed** — "You are what you code." Developer lunch ordering based on your current tech stack.

8. **GitFit** — "Commit to fitness." Fitness app synced with GitHub — commits trigger workout suggestions, merge conflicts require push-ups.

### 6.3 Project Management

Admins can create, edit, and delete projects at any time. Projects can be modified during the event (this is useful for the PIVOT obstacle). The admin panel provides full CRUD on all project fields.

### 6.4 AI-Generated Specs (Future Enhancement)

Optionally integrate an LLM API to generate random project specs on the fly. Input parameters: domain (fintech, health, social, devtools), absurdity level (1–5), required gimmick. This is a nice-to-have for v2.

---

## 7. Tech Stacks

### 7.1 Stack Structure

Each stack is a frontend + backend combination. The design constraint is decoupled architecture: separate FE and BE codebases communicating via API.

| Field | Type | Description |
|---|---|---|
| ID | string | Unique identifier |
| Frontend | string | Framework/library name |
| Backend | string | Language/framework name |
| Label | string | Display label (auto-generated: "FE + BE") |

### 7.2 Default Stacks

| Frontend | Backend |
|---|---|
| React | Node.js |
| Angular | PHP |
| Vue | Go |
| Svelte | Python |
| Next.js | Rust |
| Solid | Elixir |

### 7.3 Stack Management

Admins can add, edit, and remove stacks. Stacks can also be swapped between teams during the event (see obstacles).

---

## 8. Game Lifecycle

### 8.1 Phases

```
REGISTRATION  →  ACTIVE  →  FINISHED
                  ↑   ↓
                  PAUSED
```

**REGISTRATION** — Players sign up, set vibe levels. Admins configure projects, stacks, and obstacles. Projector shows the registration lobby with a growing list of operatives.

**ACTIVE** — The event is live. Teams are formed, projects and stacks assigned, timer counting down. Admins can trigger obstacles, swap assignments, and manage the game. Projector shows teams, assignments, timer, and alerts.

**PAUSED** — Timer stops. Useful for lunch breaks, presentations, or logistical issues. Admins can still modify the game state.

**FINISHED** — Event is over. Final state is frozen for review. Teams can still view their assignments.

### 8.2 Starting the Event

When an admin triggers START:

1. Registration closes.
2. Team formation algorithm runs.
3. Projects are shuffled and assigned round-robin to teams.
4. Tech stacks are shuffled and assigned round-robin to teams.
5. Event timer starts (configurable, default 4 hours).
6. All participants see their team, project, and stack.
7. Projector view transitions from lobby to game board.

### 8.3 Timer

A prominent countdown timer visible on all views. Configurable duration. When it reaches zero, the event moves to FINISHED. Admins can add or remove time.

---

## 9. Obstacles & Game Events (The Chaos Engine)

This is the heart of the fun. Admins act as Game Masters, deploying obstacles at strategic moments to keep teams on their toes — just like surprise challenges on MasterChef.

### 9.1 Obstacle Structure

| Field | Type | Description |
|---|---|---|
| ID | string | Unique identifier |
| Name | string | Dramatic obstacle name |
| Icon | emoji | Visual icon for display |
| Description | string | What happens and what teams must do |
| Severity | enum: low / medium / high / critical | Impact level (affects visual drama) |
| Duration | integer (minutes) | How long the obstacle is active (0 = permanent for rest of event) |
| Target Mode | enum: all / random / specific | How targets are selected |

### 9.2 Pre-loaded Obstacles

#### 🔄 THE PIVOT (High Severity)
"Your client just changed their mind." The team's core feature must now do the opposite of what was specified. A new modified spec is pushed to the team's view. Example: If building a task manager that predicts procrastination, it must now *encourage* procrastination.

#### 💥 STACK OVERFLOW (High Severity)
"Tech stack meltdown!" Two teams swap their tech stacks. The team that was using React + Node now has Vue + Go and vice versa. They must adapt their existing code or start fresh with the new stack.

#### 👹 CLIENT FROM HELL (Medium Severity)
"New contradictory requirement." Admin picks from a set of absurd requirements and assigns it to a team. Examples: "The entire UI must use Comic Sans," "Every API response must include a random inspirational quote," "The app must have a loading screen that lasts exactly 7 seconds with a unskippable animation."

#### 🕸️ DEPENDENCY HELL (Low Severity)
"Mandatory integration." The team must integrate a random public API into their project in a meaningful way. Options: Chuck Norris Jokes API, Cat Facts API, Kanye West Quotes API, Pokemon API, NASA Picture of the Day.

#### 🔀 PROJECT SWAP (Critical Severity)
"Complete project exchange." Two teams swap entire projects — codebase and all. Each team continues building where the other left off. This is the nuclear option and should be used sparingly.

#### ⚡ SPEED ROUND (Medium Severity)
"10-minute micro-challenge." All teams pause their main project. A small standalone challenge is announced (e.g., "build the best 404 page," "create a one-page portfolio site using only CSS"). A winner is selected by admin/audience vote. Prize: immunity from the next obstacle.

#### 🧊 CODE FREEZE (Medium Severity)
"Involuntary promotion." One team member (selected randomly or by admin) becomes "Product Manager" for 15 minutes. They may not touch code — only write tickets, documentation, and provide verbal direction to their partner.

#### 📦 MYSTERY BOX (Low Severity)
"Unknown challenge." The content is revealed live. Pre-configured options: "Your app must include a hidden Easter egg," "Add a dark/light mode toggle that also changes the app's personality," "Implement an undo feature that shows a dramatic instant replay."

#### 🎨 DESIGN DISASTER (Low Severity)
"Monochrome mandate." The team's entire color palette must now use only shades of one color, chosen by the audience or randomly assigned.

#### 🤖 AI OVERLORD (Low Severity)
"Haiku commits only." All git commit messages for the next 30 minutes must be in haiku format (5-7-5 syllable structure). Teams self-enforce on the honor system.

#### 📱 RESPONSIVE PANIC (High Severity)
"Smartwatch viewport." The team's app must render and function correctly at 200×200px. Demo will be shown on a tiny display.

#### 🔇 SILENT MODE (Medium Severity)
"Communication blackout." No verbal communication for 20 minutes. Teams communicate only through code comments, commit messages, and chat.

### 9.3 Triggering Obstacles

Admin workflow:
1. Open the obstacle panel.
2. Select an obstacle from the catalog.
3. Choose target: all teams, random team(s), or specific team(s).
4. Confirm deployment.

On trigger:
- A dramatic full-screen alert animates on the projector view (glitch effects, screen shake, warning sirens).
- The obstacle appears on targeted teams' dashboards.
- An entry is logged in the event log with timestamp.
- If the obstacle has a duration, a countdown begins. When it expires, the obstacle is marked as resolved.

### 9.4 Custom Obstacles

Admins can create new obstacles on the fly during the event with a name, description, severity, and target. This allows for improvised chaos.

### 9.5 Obstacle History

All triggered obstacles are logged with timestamp, target teams, and status (active/resolved). This log is visible on admin and projector views.

---

## 10. Screens & Views

### 10.1 Login Screen

- Google SSO button.
- Domain validation message on rejection.
- Link to enter projector mode without authentication.
- Geeky terminal aesthetic with animated background.

### 10.2 Registration Lobby (Player View)

Shown during REGISTRATION phase after login. Displays the player's profile with an editable vibe level selector (1–5 with labels). Shows a count of registered participants and a "waiting for event to start" indicator.

### 10.3 Game Dashboard (Player View)

Shown during ACTIVE/FINISHED phases. Displays: your team (partner name, both skill levels), your project (name, tagline, full spec), your tech stack, countdown timer, and any active obstacles targeting your team with their full descriptions.

### 10.4 Admin Panel

Tabbed interface with sections:

**Players** — List of all registered users. For each: name, email, vibe level (editable inline), role toggle (participant/admin), competition toggle (in/out). Sorting and search.

**Projects** — CRUD interface for project specs. Each project shows name, tagline, spec preview, and edit/delete buttons. "Add new" form at the bottom.

**Tech Stacks** — CRUD interface for stacks. Simple FE + BE fields per entry.

**Obstacles** — Catalog of all obstacles. Option to create new custom obstacles. Each shows name, description, severity, and a delete button.

**Game Control** — The main command center. Shows current phase, timer (with add/remove time), the START/PAUSE/RESUME/END buttons, team overview with assignments, swap controls (swap projects between any two teams, swap stacks between any two teams), and the DEPLOY OBSTACLE button that opens the obstacle selection modal. Also shows the event log.

### 10.5 Projector View (Big Screen)

Full-screen, designed for 1080p or larger displays. Dark background with subtle matrix rain or terminal animation. No controls — purely display.

**During REGISTRATION:** Large animated title, growing grid of registered player cards (name + vibe level bar), total count.

**During ACTIVE:** Grid of all team cards, each showing: team number, member names + levels, project name + tagline, tech stack badge, and any active obstacle indicators. Large countdown timer at the top. Scrolling event log at the bottom.

**Obstacle Alert:** When an obstacle is triggered, the entire screen is overtaken by a dramatic full-screen alert: large icon, obstacle name with glitch/shake animation, description text, target teams. Visible for 8–10 seconds, then returns to normal view.

**During FINISHED:** Freeze frame of the final state. "HACKATHON COMPLETE" message.

---

## 11. UI/UX Direction

### 11.1 Aesthetic: Hacker Terminal

The entire app should feel like a retro terminal / hacker dashboard. Think: green-on-black, monospace fonts, CRT scanline overlay, Matrix rain backgrounds, glitch text effects. Not a clean SaaS dashboard — a war room.

### 11.2 Key Visual Elements

- **Font:** Monospace throughout (Share Tech Mono, Fira Code, or similar).
- **Color palette:** Black backgrounds (#000–#0a0a0a), green primary (#00ff00), cyan accent (#00ffff), orange for projects (#ff8800), red for obstacles/alerts (#ff0000), yellow for warnings (#ffff00). Minimal white — let the colors glow.
- **CRT effect:** Subtle scanline overlay across the entire viewport (CSS repeating gradient, low opacity).
- **Matrix rain:** Canvas-based falling character animation as background on login and projector views.
- **Glitch text:** CSS glitch animation on headings — offset color layers that occasionally distort.
- **Transitions:** Obstacle alerts slide/flash in with screen shake. Team cards animate in with staggered delays. Boot sequence with line-by-line terminal output.
- **Level bars:** Visualized as filled/empty block characters: `█████` for level 5, `███░░` for level 3.

### 11.3 Responsive Behavior

The app must work on three form factors:
- **Desktop browser** — primary interface for participants and admins during the event.
- **Mobile browser** — players checking their team/project on their phone.
- **Projector (1080p+)** — the big-screen spectator view. Font sizes and spacing should be large enough to read from across a room.

---

## 12. Data Model

### 12.1 User

```
{
  id: string (UUID)
  email: string (unique, @agiledrop.com)
  name: string
  avatarUrl: string
  vibeLevel: integer (1-5)
  isAdmin: boolean
  isOptedOut: boolean
  registeredAt: timestamp
  updatedAt: timestamp
}
```

### 12.2 Project

```
{
  id: string (UUID)
  name: string
  tagline: string
  spec: text
  difficulty: enum (easy, medium, hard) [optional]
  createdBy: string (admin user ID)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 12.3 TechStack

```
{
  id: string (UUID)
  frontend: string
  backend: string
  label: string (auto: "{frontend} + {backend}")
  createdAt: timestamp
}
```

### 12.4 Obstacle (Template)

```
{
  id: string (UUID)
  name: string
  icon: string (emoji)
  description: text
  severity: enum (low, medium, high, critical)
  durationMinutes: integer (0 = permanent)
  isCustom: boolean
  createdAt: timestamp
}
```

### 12.5 Event (Hackathon Instance)

```
{
  id: string (UUID)
  phase: enum (registration, active, paused, finished)
  timerDurationSeconds: integer
  timerStartedAt: timestamp [nullable]
  timerPausedRemaining: integer [nullable]
  createdAt: timestamp
  startedAt: timestamp [nullable]
  finishedAt: timestamp [nullable]
}
```

### 12.6 Team

```
{
  id: string (UUID)
  eventId: string (FK → Event)
  members: [string] (FK → User, length 1-2)
  totalVibeLevel: integer (computed)
  createdAt: timestamp
}
```

### 12.7 TeamAssignment

```
{
  id: string (UUID)
  teamId: string (FK → Team)
  projectId: string (FK → Project)
  techStackId: string (FK → TechStack)
  assignedAt: timestamp
  swapHistory: [{
    type: enum (project_swap, stack_swap)
    previousId: string
    newId: string
    swappedWithTeamId: string
    timestamp: timestamp
  }]
}
```

### 12.8 ObstacleEvent (Triggered Instance)

```
{
  id: string (UUID)
  eventId: string (FK → Event)
  obstacleId: string (FK → Obstacle)
  targetTeamIds: [string] (empty = all teams)
  triggeredBy: string (FK → User, admin)
  triggeredAt: timestamp
  expiresAt: timestamp [nullable]
  status: enum (active, resolved, dismissed)
  customNote: text [optional, admin can add context]
}
```

### 12.9 EventLog

```
{
  id: string (UUID)
  eventId: string (FK → Event)
  message: string
  type: enum (system, obstacle, swap, admin_action)
  timestamp: timestamp
  metadata: JSON [optional]
}
```

---

## 13. Technical Architecture

### 13.1 Recommended Stack

**Frontend:** React (with TypeScript), Tailwind CSS for utility classes, custom CSS for the terminal/hacker effects. Deployed as a static SPA.

**Backend:** Node.js with Express or Fastify. REST API for CRUD operations, WebSocket (Socket.io) for real-time updates.

**Database:** PostgreSQL for structured data. Simple schema, low volume — any relational DB works.

**Auth:** Google OAuth 2.0 via Passport.js or Auth.js. JWT tokens for session management.

**Real-time:** Socket.io for pushing live updates to all connected clients. Critical for: timer sync, obstacle alerts, team assignment updates, event log entries, player registration count.

**Hosting:** Internal server or any cloud provider. The app has very low resource requirements.

### 13.2 Real-time Events (WebSocket)

The following events must be pushed to all connected clients in real-time:

| Event | Payload | Trigger |
|---|---|---|
| `player:registered` | user summary | New player signs up |
| `game:started` | teams, assignments | Admin starts event |
| `game:paused` | remaining time | Admin pauses |
| `game:resumed` | new start anchor | Admin resumes |
| `game:finished` | final state | Timer expires or admin ends |
| `obstacle:triggered` | obstacle + targets | Admin deploys obstacle |
| `obstacle:resolved` | obstacle ID | Duration expires |
| `assignment:swapped` | team IDs + new assignments | Admin swaps project/stack |
| `timer:sync` | current remaining seconds | Every 30s for drift correction |
| `player:updated` | user ID + changed fields | Admin re-rates a player |

### 13.3 API Endpoints

**Auth:**
- `GET /auth/google` — Initiate OAuth flow
- `GET /auth/google/callback` — OAuth callback, creates/fetches user, issues JWT
- `GET /auth/me` — Current user profile

**Users:**
- `GET /api/users` — List all (admin)
- `PATCH /api/users/:id` — Update vibe level, role, opt-out status (admin)

**Projects:**
- `GET /api/projects` — List all
- `POST /api/projects` — Create (admin)
- `PUT /api/projects/:id` — Update (admin)
- `DELETE /api/projects/:id` — Delete (admin)

**Tech Stacks:**
- `GET /api/stacks` — List all
- `POST /api/stacks` — Create (admin)
- `PUT /api/stacks/:id` — Update (admin)
- `DELETE /api/stacks/:id` — Delete (admin)

**Obstacles:**
- `GET /api/obstacles` — List templates
- `POST /api/obstacles` — Create custom (admin)
- `DELETE /api/obstacles/:id` — Delete (admin)

**Game:**
- `POST /api/game/start` — Start event (triggers team formation + assignment)
- `POST /api/game/pause` — Pause
- `POST /api/game/resume` — Resume
- `POST /api/game/end` — End event
- `POST /api/game/reset` — Reset to registration phase (admin)
- `GET /api/game/state` — Current game state (phase, teams, assignments, timer)
- `POST /api/game/obstacle` — Trigger an obstacle `{ obstacleId, targetTeamIds, customNote }`
- `POST /api/game/swap` — Swap assignment `{ teamAId, teamBId, type: "project"|"stack" }`
- `PATCH /api/game/timer` — Adjust timer `{ addSeconds: integer }` (positive or negative)

**Teams:**
- `GET /api/teams` — List all teams with members + assignments
- `PATCH /api/teams/:id/swap-member` — Swap a member between teams (admin)

---

## 14. Future Enhancements (v2+)

### 14.1 AI Project Generator
Integrate an LLM API to generate random project specs on demand. Admin clicks "Generate," sets parameters (domain, absurdity, constraints), and gets a fresh spec.

### 14.2 Judging & Scoring
Add a judging module where admins/audience can rate team demos on criteria (creativity, code quality, funniest bug, best use of obstacle). Leaderboard and winner announcement on the projector view.

### 14.3 Team Chat
In-app team chat so pairs can communicate without switching tools. Especially useful during SILENT MODE obstacle.

### 14.4 Git Integration
Connect team repos (GitHub/GitLab). Show commit activity on the projector view as a live feed. Validate haiku commit messages during AI OVERLORD obstacle.

### 14.5 Audience Participation
Allow non-competing spectators to vote on which obstacle to deploy next, or vote on a color for DESIGN DISASTER. QR code on the projector view links to a voting page.

### 14.6 Achievement Badges
Award badges for surviving specific obstacles, winning speed rounds, most commits, funniest demo, etc. Display on player profiles.

### 14.7 Multi-Event History
Support running multiple hackathon events over time. Historical results, player stats across events, recurring leaderboards.

---

## 15. Open Questions

1. **Team size flexibility** — Should the system support teams of 3 for odd player counts, or always keep pairs + one solo?
2. **Timer control granularity** — Should admins be able to set per-team timers, or is a single global timer sufficient?
3. **Obstacle enforcement** — Are obstacles honor-system only, or should the app enforce some of them (e.g., actually hiding the IDE for CODE FREEZE)?
4. **Demo scheduling** — Should the app manage a demo order/schedule at the end, or is that handled separately?
5. **Project scope hints** — Should specs include MVP feature lists to guide time management, or keep them open-ended?
6. **Pre-event skill calibration** — Should there be a short coding challenge during registration to validate self-reported vibe levels?
