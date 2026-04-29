# Valentine's Garage — MAP711S Assignment

A mobile application for **Valentine's Garage** built with Expo (React Native) for the MAP711S university assignment.

## Overview

Valentine's Garage is a truck service management system that digitises the workshop floor. It replaces paper-based job cards with a live mobile app that mechanics and the garage owner (Valentine) can use from their phones.

## Features

### Truck Check-In
- Record every truck arriving at the garage
- Capture the vehicle's condition (Excellent / Good / Fair / Poor)
- Write detailed condition notes describing damage or visible issues
- Attach up to 6 photos of the vehicle's condition at arrival
- Record the odometer reading (km driven)
- Automatically timestamps and logs which mechanic checked the truck in

### Mechanic Task Collaboration
- Each truck gets a standard 18-task service checklist across 6 categories:
  - Engine, Brakes, Tyres, Electrical, Transmission, Chassis, Fuel
- Mechanics tick off tasks as they complete them
- Each completed task records **who did it** and **when**
- Notes can be added to any task describing work done
- Multiple mechanics can work on the same truck — every action is tracked individually
- Progress bar shows how much of the service is complete

### Management Reports (Valentine — Garage Owner)
- **By Employee** — see every mechanic's completed tasks, trucks worked on, and recent activity
- **By Vehicle** — full audit trail per truck:
  - Arrival condition and notes
  - Arrival photos
  - Task-by-task breakdown: who completed each task and at what time
  - All mechanic notes per task
- Summary dashboard: Active jobs, Completed jobs, Total tasks done

## Grading Criteria (MAP711S)

| Criterion | Implementation |
|-----------|---------------|
| Architecture (20%) | Layered structure — UI components, business logic in context, data layer in AsyncStorage |
| Code Quality (20%) | TypeScript throughout, typed data models, separated components |
| Functionality (20%) | All features above fully working |
| UI & Navigation (20%) | Expo Router tabs + stack navigation, haptic feedback, Montserrat font, branded design |
| Presentation (20%) | Each team member built and can explain their section |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo (React Native) |
| Navigation | Expo Router (file-based) |
| State / Data | React Context + AsyncStorage |
| UI Icons | @expo/vector-icons (Feather) |
| Fonts | Google Fonts — Montserrat |
| Photos | expo-image-picker |
| Haptics | expo-haptics |
| Language | TypeScript |

## Project Structure

```
artifacts/valentines-garage/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Home — truck list
│   │   └── reports.tsx      # Management reports
│   ├── truck/
│   │   └── [id].tsx         # Truck detail + task checklist
│   ├── checkin.tsx          # Truck check-in form
│   ├── login.tsx            # Role selection (Manager / Mechanic)
│   └── _layout.tsx          # Root layout + font loading
├── components/
│   ├── TaskItem.tsx         # Individual task row with notes modal
│   └── TruckCard.tsx        # Truck summary card
├── context/
│   └── AppContext.tsx       # Global state, data models, AsyncStorage
├── constants/
│   └── colors.ts            # Design tokens
├── hooks/
│   └── useColors.tsx        # Theme-aware colour hook
└── assets/
    └── images/              # App icon, logo, truck, engine graphics
```

## Users

| Name | Role |
|------|------|
| Valentine | Garage Owner (Manager) — views reports, monitors progress |
| David Shikongo | Mechanic |
| Thomas Amunyela | Mechanic |
| Pauline Nghifindaka | Mechanic |
| Joseph Hamutenya | Mechanic |

## Running the App

```bash
# Install dependencies
pnpm install

# Start the Expo development server
pnpm --filter @workspace/valentines-garage run dev
```

Then open the Expo Go app on your phone and scan the QR code, or press `w` to open in the browser.

## Group Members — MAP711S

> Add your team members' names here

---

*Built for MAP711S — Mobile Application Programming, 2026*
