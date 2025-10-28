# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a physical computing project for a **Tug of War multiplayer web game** with Arduino Uno hardware integration. The system consists of:

- **Frontend**: React + TypeScript web interface where users join teams and click to compete
- **Backend**: WebSocket server for real-time game state synchronization
- **Arduino Uno**: Physical robot controller with servo, LEDs, buzzer, and LCD display

The game tracks clicks from two teams (Left vs Right), updates a physical servo arm to indicate which team is winning, and triggers victory animations with LEDs/buzzer when a team wins.

## Architecture

### Frontend (`/frontend`)
- **Tech Stack**: React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Current State**: Basic name input form (placeholder app from "CaseCanvas")
- **Needs Implementation**: Team selection, click tracking, real-time score display, WebSocket client

### Backend (`/backend`)
- **Current State**: Empty directory
- **Needs Implementation**: WebSocket server, game state management, serial communication with Arduino Uno

### Arduino Integration
- **Hardware**: Arduino Uno connected via USB serial
- **Components**: Servo motor, LEDs, buzzer, LCD display
- **Communication**: Serial protocol from backend (e.g., `SCORE:45:55`, `WIN:LEFT`)

## Development Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start dev server (port 3000)
npm run build        # Production build
npm test             # Run tests
```

### Key Files
- `frontend/src/App.tsx` - Main React component (currently a simple form)
- `frontend/src/components/ui/` - shadcn/ui components (Button, Card, Input, Label)
- `frontend/src/styling/index.css` - Tailwind CSS with custom CSS variables for theming
- `frontend/tailwind.config.js` - Tailwind configuration with HSL color system

## Styling System

Uses shadcn/ui's theming approach:
- CSS custom properties defined in `frontend/src/styling/index.css` under `:root`
- Colors use HSL format: `hsl(var(--primary))`
- Unified black/white/gray palette (no colors currently defined)
- Border radius controlled via `--radius` variable

## TypeScript Configuration

Strict mode enabled with:
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- Path alias: `@/*` maps to `./src/*`
- Target: ES2020 with React JSX transform

## Game Implementation Notes

When building the tug of war game:

1. **WebSocket Protocol**: Design messages for team joins, clicks, score updates, game state
2. **Serial Protocol**: Define commands Arduino expects (score ratios, win events, reset)
3. **Game State**: Track click counts per team, calculate position (-100 to +100), detect wins
4. **Timing**: Support timed rounds (30-60s) or threshold-based wins
5. **Arduino Firmware**: Not yet in repo - will need `.ino` sketch for servo/LED/LCD control

## Git Workflow

- Main branch: `main`
- Recent commits show UI refactoring (switched to shadcn/ui, removed canvas)
- Clean working directory at conversation start
