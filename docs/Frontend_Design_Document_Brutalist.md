# Frontend Design Document
## QR Attendance Tracker — Brutalist UI System
**Version:** 1.0.0  
**Date:** May 2026  
**Design Direction:** RAW BRUTALISM — No decoration. Unapologetic structure. Typography as architecture.

---

## 1. Design Philosophy

This application adopts **Web Brutalism** — a design philosophy that treats honesty of structure as beauty. No drop shadows pretending surfaces float. No rounded corners softening reality. No gradients hiding the grid. The interface is built from raw, visible, structural elements: thick borders, stark contrast, monospace data, grid lines that stay visible.

The brutalist approach works especially well for an attendance tool because:
- It is an **operational tool**, not a marketing surface — function IS the aesthetic
- High-contrast, bold typography allows **at-a-glance data reading** from across a room (faculty projecting on screen)
- Raw structural honesty builds **trust** — students see exactly what's recorded, no flourish

**Design Mantra:** *"The grid is exposed. The border is load-bearing. The font is the UI."*

---

## 2. Visual Identity

### 2.1 Color Palette

```
--color-bg:        #F5F0E8   /* Off-white, like aged paper — never pure white */
--color-surface:   #FFFFFF   /* White cards — only used with thick borders */
--color-ink:       #0A0A0A   /* Near-black for all primary text */
--color-accent:    #FF3B00   /* Brutal orange-red — the only "color" */
--color-accent-2:  #0028FF   /* Electric blue — secondary accent, use sparingly */
--color-muted:     #6B6B6B   /* Gray for secondary text */
--color-border:    #0A0A0A   /* Black borders — the structural backbone */
--color-success:   #00A86B   /* Present / confirmed — muted green, not neon */
--color-warning:   #F5A623   /* Late / warning states */
--color-error:     #D0021B   /* Error / absent */
--color-stripe:    #F0EBE0   /* Alternating table row tint */
```

**Usage rules:**
- `--color-accent` (#FF3B00) is used ONLY for: primary CTAs, active states, QR display border, live status dot
- `--color-accent-2` (#0028FF) is used ONLY for: links, secondary actions, highlighted data
- Everything else is black on off-white. No exceptions.

### 2.2 Typography

```
Display Font:   "Space Mono" (Google Fonts) — monospace, industrial
                Used for: headings, enrollment numbers, counters, QR labels

Body Font:      "IBM Plex Sans" (Google Fonts) — humanist sans-serif
                Used for: body copy, form labels, descriptions

Data Font:      "Space Mono" (same as display) — for all tabular data,
                timestamps, IDs, counts
```

**Type Scale:**
```
--text-xs:   11px / 1.4  (meta info, timestamps)
--text-sm:   13px / 1.5  (table cells, form hints)
--text-base: 16px / 1.6  (body, descriptions)
--text-lg:   20px / 1.3  (section labels)
--text-xl:   28px / 1.1  (page titles)
--text-2xl:  40px / 1.0  (hero numbers, session count)
--text-3xl:  64px / 0.95 (massive QR label, stat callouts)
--text-mono: Space Mono used for all numeric/data display
```

**Rules:**
- ALL headings are UPPERCASE
- Enrollment numbers, timestamps, IDs always in `Space Mono`
- NO font-weight below 400. Body is 400. Headings are 700. Data can be 500.

---

## 3. Layout Principles

### 3.1 The Grid
- Base grid: **12-column**, 24px gutter, 48px margin
- Mobile: 4-column, 16px gutter, 24px margin
- Grid lines are **sometimes visually visible** in the design (thin `1px` border lines as structural decoration)

### 3.2 Borders as Structure
```css
--border-thin:   1px solid var(--color-border);
--border-thick:  3px solid var(--color-border);
--border-heavy:  6px solid var(--color-border);
--border-brutal: 4px solid var(--color-border);
```
- Cards use `--border-brutal` with **no border-radius** (0px — absolutely no rounding)
- Inputs use `--border-thick` bottom-only (like underscores, not boxes)
- Tables use `--border-thin` for rows, `--border-thick` for headers

### 3.3 Shadows
```css
--shadow-brutal: 4px 4px 0px var(--color-border);
--shadow-press:  2px 2px 0px var(--color-border);
--shadow-lift:   6px 6px 0px var(--color-border);
--shadow-accent: 4px 4px 0px var(--color-accent);
```
Brutalist shadows are solid-color offsets with no blur — simulating a printing press stamp effect. Primary action buttons use `--shadow-accent`.

### 3.4 Spacing
```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-6:  24px
--space-8:  32px
--space-12: 48px
--space-16: 64px
--space-24: 96px
```

---

## 4. Component Library

### 4.1 Buttons

**Primary CTA:**
```
Background:   --color-accent (#FF3B00)
Text:         #FFFFFF, UPPERCASE, Space Mono, font-weight 700
Border:       4px solid #0A0A0A
Shadow:       4px 4px 0px #0A0A0A
Hover:        translate(-2px, -2px), shadow becomes 6px 6px
Active/Press: translate(2px, 2px), shadow becomes 2px 2px
```

**Secondary:**
```
Background:   #FFFFFF
Text:         #0A0A0A, UPPERCASE, Space Mono, font-weight 700
Border:       3px solid #0A0A0A
Shadow:       3px 3px 0px #0A0A0A
```

**Ghost/Destructive:**
```
Background:   transparent
Text:         --color-error, UPPERCASE, Space Mono
Border:       2px solid --color-error
No shadow
```

**Size variants:** SM (32px height), MD (44px height), LG (56px height)

---

### 4.2 Form Inputs

```
Background:    #FFFFFF
Border:        none
Border-bottom: 3px solid #0A0A0A (underline style)
Font:          IBM Plex Sans, 16px
Padding:       12px 0px
Label:         Space Mono, 11px, UPPERCASE, letter-spacing: 0.1em, color: --color-muted
Focus:         border-bottom: 3px solid --color-accent
               label color changes to --color-accent
Error:         border-bottom: 3px solid --color-error
Placeholder:   color: #AAAAAA
```

The input looks like a form being typed on a **typewriter** — just an underline, no box.

---

### 4.3 Cards

```
Background:    #FFFFFF
Border:        4px solid #0A0A0A
Border-radius: 0px
Shadow:        6px 6px 0px #0A0A0A
Padding:       32px
```

On hover (for clickable cards):
```
Shadow: 8px 8px 0px #0A0A0A
transform: translate(-2px, -2px)
transition: 150ms ease
```

**Card anatomy:**
- Header: bold UPPERCASE label in Space Mono
- Divider: `3px solid #0A0A0A` full-width line
- Body: content area
- Footer (optional): muted text, action links

---

### 4.4 Data Tables

```
Header row:
  Background:    #0A0A0A
  Text:          #F5F0E8, Space Mono, 11px, UPPERCASE, letter-spacing 0.15em
  Padding:       12px 16px

Data rows:
  Odd rows:      #FFFFFF
  Even rows:     #F0EBE0 (--color-stripe)
  Border:        1px solid #0A0A0A (horizontal only)
  Text:          IBM Plex Sans, 14px
  Numeric cols:  Space Mono, 14px

Hover row:       background: #FFF0EB (light accent tint)
```

---

### 4.5 Status Badges

```
PRESENT:
  Background: #00A86B
  Text:       #FFFFFF, Space Mono, 11px, UPPERCASE

LATE:
  Background: #F5A623
  Text:       #0A0A0A, Space Mono, 11px, UPPERCASE

ABSENT:
  Background: #D0021B
  Text:       #FFFFFF, Space Mono, 11px, UPPERCASE

QR SCAN (method):
  Border: 2px solid #0028FF
  Text: #0028FF

MANUAL (method):
  Border: 2px solid #6B6B6B
  Text: #6B6B6B
```

All badges: no border-radius, padding 2px 8px, letter-spacing 0.1em.

---

### 4.6 QR Code Display Component

This is the hero element of the entire product — it must be **BIG, VISIBLE, AND UNAMBIGUOUS** when projected.

```
Container:
  Background: #FFFFFF
  Border:     6px solid #FF3B00 (accent — signals "active")
  Shadow:     8px 8px 0px #0A0A0A
  Padding:    32px
  Max-width:  480px

QR Code:
  Size:       400×400px (SVG, scales with container)
  Color:      #0A0A0A on #FFFFFF

Label above QR:
  "SCAN TO MARK ATTENDANCE"
  Space Mono, 13px, UPPERCASE, letter-spacing 0.2em, color: --color-muted

Session info below QR:
  Course code: Space Mono, 24px, bold, #0A0A0A
  Room + Time: Space Mono, 13px, #6B6B6B

Live counter (bottom of QR card):
  "[ 23 ] STUDENTS MARKED PRESENT"
  Space Mono, 16px, accent color for the number
  Pulsing dot (●) in green before "LIVE"
```

When QR is expired:
```
Red diagonal stripe overlay on QR (CSS striped background)
Text: "QR EXPIRED — REFRESH"
Border changes to: 6px solid #D0021B
```

---

### 4.7 Live Attendance Feed (Sidebar/Panel)

A scrollable panel that updates in real-time as students scan.

```
Container:
  Background:    #0A0A0A
  Color:         #F5F0E8
  Font:          Space Mono
  Border-left:   6px solid --color-accent

Header:
  "● LIVE — [N] PRESENT"
  accent color dot, blinking animation

Each entry (as it arrives):
  Animation: slide-in from top, then settle
  Format:    "09:23:44  2023CSE001  AARAV SHARMA"
  Columns:   timestamp | enrollment | name
  Separator: 1px dashed rgba(255,255,255,0.15)

New entries:
  Briefly highlighted in --color-accent background
  Fades to normal in 2 seconds
```

---

### 4.8 Search Input (Enrollment Number)

The manual attendance input — should feel like a **command line**.

```
Container:
  Background:    #0A0A0A
  Padding:       24px 32px

Label:
  "> SEARCH BY ENROLLMENT NUMBER"
  Space Mono, 12px, --color-accent, letter-spacing 0.15em

Input:
  Background:    transparent
  Color:         #F5F0E8
  Font:          Space Mono, 24px
  Border:        none
  Border-bottom: 2px solid rgba(255,255,255,0.3)
  Cursor:        ▌ blinking

Autocomplete results:
  Black bg, white text, monospace
  Hovered item: --color-accent background, black text
  Show: enrollment_no | full_name | semester
```

---

## 5. Page-by-Page Design

### 5.1 Login Page (`/login`)

**Layout:** Centered single column, max-width 480px, vertically centered

**Structure:**
```
[  WORDMARK — bold, UPPERCASE  ]
[  "ATTENDANCE TRACKER"         ]
[  thick horizontal rule        ]
[  Email input (underline style)]
[  Password input               ]
[  [  LOGIN → ] primary button  ]
[  version stamp, mono, muted   ]
```

The entire page background: `--color-bg` (#F5F0E8)  
There is a large "AT" monogram in the background at 10% opacity — like a watermark.

---

### 5.2 Dashboard (`/dashboard`)

**Layout:** Left sidebar navigation (240px fixed) + main content area

**Sidebar:**
```
Background: #0A0A0A
Text:       #F5F0E8, Space Mono
Active item: left border 4px --color-accent, background rgba(255,59,0,0.1)
Items:      DASHBOARD / SESSIONS / STUDENTS / REPORTS
```

**Main area — Dashboard:**
Top row: 4 stat cards in a row (equal width)
```
Card 1: [ TODAY'S SESSIONS ] — large number
Card 2: [ STUDENTS MARKED ] — large number, green tint
Card 3: [ AVG ATTENDANCE ] — percentage, large
Card 4: [ ACTIVE SESSION ] — blinking red dot if live
```

Below: 2-column grid
- Left (8 cols): "TODAY'S SESSIONS" — table of sessions with status tags
- Right (4 cols): "QUICK ACTIONS" — big buttons: [CREATE SESSION] [MARK MANUAL]

---

### 5.3 Create Session (`/sessions/new`)

**Layout:** Single column, max-width 640px, centered

```
[ PAGE TITLE: "NEW SESSION" in massive type ]
[ horizontal rule ]

Form fields (underline style):
  [ SELECT COURSE   ▼ ]
  [ FACULTY NAME       ]
  [ DATE               ] (auto-filled today)
  [ START TIME         ]
  [ ROOM / LAB         ]
  [ QR EXPIRES IN  ▼ ] (15min / 30min / 1hr / Never)

[ CREATE SESSION → ] — full width, primary button, very large
```

---

### 5.4 Session Page (`/sessions/:id`)

This is the **core page** — faculty projects this on a screen.

**Layout:** 2-column, 50/50 split

**Left panel — QR Code:**
```
[  ● LIVE SESSION                          ]
[  CSE301 — DATA STRUCTURES                ]
[  Room 301 · 09:00 AM · Dr. Rajesh Kumar  ]
[  ─────────────────────────────────────── ]
[                                           ]
[         [ QR CODE — 400×400 ]            ]
[                                           ]
[  SCAN TO MARK ATTENDANCE                 ]
[  ─────────────────────────────────────── ]
[  [ 23 PRESENT ]  [ 04:47 REMAINING ]     ]
[  [ REFRESH QR ]  [ CLOSE SESSION ] ]     ]
```

**Right panel — Live Feed (black background):**
```
● LIVE — 23 STUDENTS PRESENT
─────────────────────────────
09:23:44  2023CSE001  AARAV SHARMA      ✓
09:24:11  2023CSE002  PRIYA MEHTA       ✓
09:24:33  2023ECE001  SNEHA GUPTA       ✓
...scrollable
─────────────────────────────
[ + MARK MANUAL ] — opens enrollment search
```

**Mobile layout:** Stacked — QR on top, feed collapsed into accordion

---

### 5.5 Student Scan Page (`/attend`)

This is a **public, no-auth page**. Student arrives here after scanning QR.

**State: Loading**
```
Spinner (circle, accent colored)
"VERIFYING SESSION..."
```

**State: Success**
```
Background: --color-bg
Center:
  [ ✓ ] — large, bold, green, 80px
  "ATTENDANCE RECORDED"  — Space Mono, 28px, bold, UPPERCASE
  ─────────────────────────────
  AARAV SHARMA
  2023CSE001
  CSE301 — DATA STRUCTURES
  09:24:33 AM
  ─────────────────────────────
  "YOU'RE ALL SET."  — small, muted
```

**State: Error — Enrollment Required** (if no `qr_token` in URL)
```
[ INPUT FIELD: "ENTER YOUR ENROLLMENT NUMBER" ]
[ SUBMIT → ] — primary button
```

**State: Already Marked**
```
[ ⊘ ] — large icon
"ALREADY RECORDED"
Previously marked time shown
```

**State: Expired**
```
[ ✕ ] — red X, large
"QR CODE EXPIRED"
"Ask your faculty to refresh the session QR."
```

---

### 5.6 Admin Reports (`/admin/reports`)

**Layout:** Full width table with sticky header

Top controls:
```
[ SELECT COURSE ▼ ]  [ DATE RANGE: ______ to ______ ]  [ EXPORT CSV ]  [ EXPORT PDF ]
```

Below: Full attendance table  
Below table: "DEFAULTER LIST" section — students under threshold shown in red-bordered cards

---

## 6. Motion & Animation

Brutalism is NOT static — it moves with **mechanical purpose**.

| Element | Animation | Duration |
|---------|-----------|----------|
| Buttons (hover) | translate(-2px, -2px), shadow expand | 100ms |
| Buttons (click) | translate(2px, 2px), shadow shrink | 80ms ease-out |
| New attendance entry | slide-in-top + green flash → fade to normal | 600ms |
| Live count increment | number flip (digit rolls up) | 300ms |
| Session QR load | scale from 0.95 → 1.0 | 200ms ease-out |
| Page transitions | horizontal slide (SPA router) | 200ms |
| Success checkmark | scale from 0 → 1.2 → 1.0 with elastic | 500ms |
| Blinking live dot | opacity 1 → 0 → 1 | 1000ms infinite |

**NO:** parallax, floating elements, large background animations, particle effects, blob morphing. Every animation has a mechanical purpose.

---

## 7. Responsive Breakpoints

```
Mobile:   320px – 767px    (student scan page primary target)
Tablet:   768px – 1023px   (faculty session page on iPad)
Desktop:  1024px – 1439px  (primary faculty dashboard target)
Wide:     1440px+           (projected display / dual monitor)
```

**Critical mobile considerations:**
- Student scan page (`/attend`): must work perfectly at 320px
- QR code on session page: responsive with aspect-ratio: 1/1
- Sidebar on mobile: hidden, revealed via hamburger (becomes bottom nav on mobile)

---

## 8. Iconography

- Icon library: **Phosphor Icons** (line weight, not filled — matches brutalist line aesthetic)
- No icon without a text label (accessibility + brutalist clarity)
- Icon size: 20px inline, 32px in headers, 64px in hero states (success/error screens)
- Icons are monochrome — never colored except the live status dot

---

## 9. Key Interaction Patterns

### Pattern 1: QR Generation Flow
1. Faculty clicks [CREATE SESSION] → fills minimal form
2. Form submits → instant redirect to `/sessions/:id`
3. QR code appears immediately (generated client-side from session data)
4. Countdown timer starts if expiry set
5. Faculty puts laptop/phone on projector

### Pattern 2: Attendance Confirmation Flash
When a new `INSERT` arrives via Supabase Realtime:
1. New row slides in at TOP of feed list
2. Row background flashes `--color-accent` for 600ms
3. Counter number increments with a "flip" animation
4. Subtle chime (optional — faculty can enable)

### Pattern 3: Manual Enrollment Search
1. Faculty clicks [+ MARK MANUAL]
2. Bottom drawer slides up (or inline panel expands)
3. Cursor auto-focuses on search input
4. Typeahead shows results as they type
5. Click on student → confirmation flash → back to main view

---

## 10. Design Tokens (CSS Variables — Full Reference)

```css
:root {
  /* Colors */
  --color-bg:        #F5F0E8;
  --color-surface:   #FFFFFF;
  --color-ink:       #0A0A0A;
  --color-accent:    #FF3B00;
  --color-accent-2:  #0028FF;
  --color-muted:     #6B6B6B;
  --color-border:    #0A0A0A;
  --color-success:   #00A86B;
  --color-warning:   #F5A623;
  --color-error:     #D0021B;
  --color-stripe:    #F0EBE0;

  /* Typography */
  --font-display: 'Space Mono', monospace;
  --font-body:    'IBM Plex Sans', sans-serif;

  /* Borders */
  --border-thin:   1px solid var(--color-border);
  --border-thick:  3px solid var(--color-border);
  --border-heavy:  6px solid var(--color-border);
  --border-brutal: 4px solid var(--color-border);
  --border-radius: 0px; /* NEVER round corners */

  /* Shadows (brutalist offset shadows) */
  --shadow-sm:     2px 2px 0px var(--color-border);
  --shadow-md:     4px 4px 0px var(--color-border);
  --shadow-lg:     6px 6px 0px var(--color-border);
  --shadow-accent: 4px 4px 0px var(--color-accent);

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Motion */
  --duration-fast:   80ms;
  --duration-normal: 200ms;
  --duration-slow:   400ms;
  --ease-brutal:     cubic-bezier(0.25, 0, 0, 1);
}
```

---

## 11. Do's and Don'ts

### ✅ DO
- Use thick visible borders as the primary UI structure
- Use UPPERCASE for ALL headings and button labels
- Use Space Mono for any number, ID, timestamp, or data field
- Make buttons feel physically press-able (translate + shadow)
- Let the grid show — visible structure is part of the aesthetic
- Use a single accent color sparingly and purposefully

### ❌ DON'T
- No `border-radius` anywhere (0px always)
- No gradients (not even subtle ones)
- No box-shadow with blur (only solid offset shadows)
- No more than 3 colors on a single screen (black, white, + 1 accent)
- No decorative icons without labels
- No centered body text (left-aligned always)
- No thin (< 300 weight) typography
- No smooth transitions that exceed 400ms
