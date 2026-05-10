# Bubu ka Rapido Premium — Project Context for Claude

## What This Project Is
A mobile-first romantic scavenger hunt web app built as a birthday surprise.
Do NOT suggest changing the concept, flow, or romantic tone of the app.

## Tech Stack (Do NOT deviate from this)
- Next.js 14+ with App Router (app/ directory)
- React 18
- Tailwind CSS (mobile-first ONLY, no desktop breakpoints)
- Framer Motion (all animations)
- Lucide React (all icons)
- localStorage ONLY (no backend, no database, no API routes)
- Native browser navigator.geolocation (no third-party GPS libraries)
- Google Maps Embed API via iframe (no Google Maps npm packages)

## Folder Structure (Already decided, do not restructure)
app/
├── layout.tsx
├── page.tsx
└── globals.css

components/
├── BubuApp.tsx
├── phases/
│   ├── Phase1Booking.tsx
│   ├── Phase2OTP.tsx
│   ├── Phase3Clue.tsx
│   ├── Phase4Reward.tsx
│   └── Phase5Outro.tsx
└── ui/
    ├── StarRating.tsx
    ├── CountdownTimer.tsx
    ├── MapEmbed.tsx
    ├── SuccessAnimation.tsx
    └── PointsBadge.tsx

lib/
├── constants.ts
├── haversine.ts
└── useGameState.ts

## Design Rules (Always follow these)
- Font: Nunito from Google Fonts
- Primary Background: #FFF0F3
- Primary Accent (buttons, highlights): #C9184A
- Secondary Accent: #FF4D6D
- Text Primary: #2D0A14
- All cards: rounded-2xl shadow-lg white background
- All primary buttons: rounded-full bg-[#C9184A] text-white font-bold
- Mobile screen width assumed: 390px (iPhone 14 size)
- NO desktop styling needed

## State Management Rules
- ALL game state lives in localStorage under key: "bubu_rapido_state"
- The custom hook is: lib/useGameState.ts
- NEVER use useRouter for navigation — phase changes are state-based only
- ALL localStorage reads/writes must be wrapped in try/catch

## The 5 Phases (Never change this flow)
1. Booking & Call Screen
2. 24 Kisses OTP Reveal
3. Clue Loop (3 locations: Upvan Lake → Lake Shore Mall → Gremy All Day Cafe)
4. Final Reward — 300 Bubu Points + Choose 3 Bonus Services
5. Outro — Memorable moment text + Final rating + Goodbye message

## Key Constants Location
ALL editable game data is in: lib/constants.ts
- Phone number, OTP, location coordinates, clue text, answers, bonus services
- When I ask you to change game content, ONLY edit constants.ts

## Important Behaviors to Always Preserve
- GPS uses Haversine formula from lib/haversine.ts (arrival = within 50 meters)
- GPS errors MUST always have a manual override button fallback
- Countdown timer: 60 seconds → then map hint appears
- OTP blur effect removed only after "Kisses Delivered" button clicked
- Rating screens appear after Location 1 and Location 2 ONLY (not Location 3)
- Phase 4 submit button disabled unless EXACTLY 3 bonus services selected
- DEV MODE: activated by tapping header 5 times rapidly
- All vehicle icons: 🛵 scooty (not rickshaw)

## My Coding Preferences
- TypeScript only (no .js files)
- Functional components only (no class components)
- Always use const arrow functions: const MyComponent = () => {}
- Always add proper TypeScript interfaces for all props
- Use Framer Motion AnimatePresence with mode="wait" for phase transitions
- Every phase component needs: initial/animate/exit motion props
- Comments should be clear and explain the "why" not just the "what"

## What I Need From Claude
- When I share an error, fix ONLY that specific file unless the bug requires changes elsewhere
- Always show the COMPLETE file — never truncate with "rest remains the same"
- If you need to edit multiple files, list them clearly at the top of your response
- When suggesting improvements, ask me first before implementing
- Keep the romantic, cute tone in ALL user-facing text — never make it generic

## Current Status
[ ] Project setup complete
[ ] Phase 1 built
[ ] Phase 2 built  
[ ] Phase 3 built
[ ] Phase 4 built
[ ] Phase 5 built
[ ] Tested on mobile
[ ] Deployed on Vercel

(I will update this checklist as we progress)

## Coordinates & Personal Data
- Coordinates are placeholder (00.000000) until I insert real ones
- Phone number is placeholder until I insert real one
- OTP is set to "2408" (her birthday — 24th of August)
- Do NOT suggest changing the OTP