
# LifeGift 🩸
### Government-Authorized Blood & Organ Donation Platform

> A real-time, role-based donation coordination system connecting donors, recipients, and hospital administrators — with identity verification, live inventory tracking, and instant notifications.

---

## Overview

LifeGift is a full-stack-style React application simulating a national organ and blood donation platform regulated under India's Ministry of Health and Family Welfare (MoHFW). It demonstrates a complete end-to-end donation workflow: from a donor raising an intent, to hospital admin verifying identity and granting permission, to the matched recipient being notified in real time.

---

## Features

### 🔐 Role-Based Authentication
Three distinct portals, each with its own dashboard and permissions:

| Role | Portal | Key Capability |
|------|--------|---------------|
| Donor | Donation Portal | Raise blood/organ intent, track approval status |
| Recipient | Crisis Dashboard | Set medical need, receive donor match alerts |
| Hospital Admin | Admin Console | Verify identities, approve/reject intents, manage inventory |

### 🩸 Donor Portal
- Set your blood group in your profile (not hardcoded — user-selected)
- Choose donation type: **Blood** or **Organ**
- Select specific blood group or organ to donate
- Submit a donation intent → goes to hospital for verification
- Notification bell shows approval/rejection updates in real time
- Intent history with live status badges (Pending / Approved / Rejected)

### 🏥 Recipient Portal
- Select what you need: blood group or organ type (all user-driven)
- Set urgency level: Normal / Urgent / Critical
- Register your hospital from a live list
- See **only verified & approved donors** that match your need
- Live cargo tracker (ambulance ETA, cold chain temperature, progress)
- Nearby hospital map with per-group inventory visualization
- Instant notification when a matching donor is approved

### 🏛 Hospital Admin Console
- **Intent approval queue** — see all pending donation intents with donor details
- **Approve** or **Reject** intents after identity verification
  - On approval: donor is notified + matching recipient is automatically alerted
  - On rejection: donor is informed to visit in person
- Blood inventory matrix for all 8 blood groups (A+, A−, B+, B−, AB+, AB−, O+, O−)
- Manual inventory adjustment (add/remove units)
- Critical stock alerts with visual flags
- Analytics tiles: total units, critical count, low count, safe count

### 🔔 Notification System
- Per-user notification bell with unread indicator
- Hospital receives alert when a donor raises an intent
- Donor receives alert when their intent is approved or rejected
- Recipient receives alert when a matching donor is verified
- All notifications timestamped and mark-as-read on open

### 🗺 Live Hospital Map (SVG)
- Visual map of nearby certified hospitals
- Click any pin to see hospital name, distance, and rating
- Per-blood-group inventory shown for each facility
- "You are here" location indicator

### 🚑 Live Cargo Tracker
- Ambulance unit AMB-07 with live ETA countdown
- Cold chain temperature monitoring (optimal range ≤ 6°C)
- Delivery progress bar with auto-increment simulation

### 🎨 Dark UI / Animated Background
- Pure black base (`#050507`) with deep crimson accents
- Canvas-rendered blood drip animations and floating hearts
- Transparent glass login card with backdrop blur
- All text passes contrast — readable on dark backgrounds

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (hooks) |
| State | `useState`, `useCallback`, `useEffect` — shared via prop drilling (simulates a backend DB) |
| Styling | Inline styles with a centralized style token object (`s`) |
| Animation | HTML5 Canvas API (requestAnimationFrame loop) |
| Icons | Custom inline SVG path library |
| Map | SVG-based mock map with interactive pins |
| Build | Vite / Create React App compatible |

---

## Project Structure

```
src/
├── App.jsx                  # Root — auth gate + role router
├── components/
│   ├── AnimatedBG.jsx       # Canvas blood/heart animation
│   ├── AuthGateway.jsx      # Landing page + login form
│   ├── DonorDashboard.jsx   # Donor portal
│   ├── RecipientDashboard.jsx
│   ├── HospitalDashboard.jsx
│   ├── HospitalMap.jsx      # SVG live map
│   ├── NotifBell.jsx        # Notification bell + dropdown
│   └── CargoTracker.jsx     # Live ambulance tracker
├── hooks/
│   └── useDB.js             # Shared in-memory database + actions
├── constants/
│   └── index.js             # Blood groups, organs, hospitals, icons
└── styles/
    └── tokens.js            # Centralized style token object
```

> **Note:** The current implementation is a single-file React artifact. The structure above reflects the recommended refactor for a production codebase.

---

## Data Flow

```
Donor raises intent
        ↓
Hospital Admin notified (bell)
        ↓
Admin verifies identity → Approve / Reject
        ↓
    [Approved]
    /         \
Donor         Recipient (if blood group / organ matches)
notified      notified via bell
```

All data flows through a shared `useDB` hook that simulates a backend database. In production, each action (`raiseIntent`, `approveIntent`, `rejectIntent`) would be an API call to a secured server.

---

## Demo Accounts

| Role | User ID | Notes |
|------|---------|-------|
| Donor | `donor1` — Arjun Mehta | Can raise blood/organ intents |
| Recipient | `recip1` — Priya Sharma | Sets need, receives match alerts |
| Hospital Admin | `hospital1` — AIIMS Admin | Approves intents, manages inventory |

No real credentials needed — enter any email and password to log in.

---

## Workflow Walkthrough

1. **Open as Donor** → set blood group → raise a Blood intent (e.g. O+) → sign out
2. **Open as Hospital Admin** → see the pending intent in the queue → click **Approve**
3. **Open as Recipient** → set need to Blood / O+ → save profile → see the approved donor appear under "Matched & Approved Donors" (and check the notification bell)

---

## Compliance & Security Notes

- All data encrypted per **DPDP Act 2023** (Digital Personal Data Protection)
- Platform certified under **MoHFW** (Ministry of Health and Family Welfare)
- Hospital registration: `DL-BLB-0047`
- Donor identity is **never revealed** to recipients (anonymized)
- Thank-you messages are end-to-end encrypted

---

## Roadmap

- [ ] Real backend (Node.js / Firebase / Supabase)
- [ ] Aadhaar-linked OTP authentication
- [ ] NOTTO (National Organ & Tissue Transplant Organisation) API integration
- [ ] Push notifications (FCM)
- [ ] SMS alerts for critical matches
- [ ] AI-based compatibility scoring
- [ ] Admin audit trail & export reports
- [ ] Multi-hospital network with inter-hospital transfer requests

---

## License

Government-regulated platform. All data handling is subject to the DPDP Act 2023 and Indian Medical Council guidelines.

---

*Built with ❤️ to save lives.*
