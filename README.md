<div align="center">

# Red Tetris

**Real-time multiplayer Tetris** built with a Node.js server, bidirectional sockets, and a fully functional React client.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

</div>

---

## 🎬 Demo

https://github.com/user-attachments/assets/44d407c4-84b6-49c1-b8a0-c32dca6458f6

> Multiplayer match: each player sees their own board, their opponents' live *spectrum*, and receives penalty lines whenever an opponent clears several rows at once.

---

## 📖 About the project

**Red Tetris** is a multiplayer reimagining of the classic Tetris, built as a project at [42](https://www.42madrid.com/). It keeps the core of the original game (tetrominoes, rotation rules, line clears) and adds a competitive layer:

- Every player has **their own 10×20 board** and all players receive **the same sequence of pieces**.
- Clearing *n* lines at once sends **n − 1 indestructible penalty lines** to every opponent.
- Each opponent's **name and *spectrum*** (height of the highest block per column) is visible and updates in real time.
- **No scoring in the base mode**: the last player standing wins. Solo play is also supported.
- Games are created and joined through the URL: `http://<host>:<port>/<room>/<player>`.

The project is designed as an exercise in **client/server architecture**, **functional vs. object-oriented programming**, and **real-time communication**.

---

## ✨ Features

| Area | Details |
|------|---------|
| 🎮 Gameplay | Original pieces, rotation, horizontal movement, soft drop and hard drop |
| 👥 Multiplayer | Multiple concurrent rooms, one game per room, host with automatic handover |
| 📡 Real time | Socket.IO for spectrum, pieces, penalties and room state |
| 🧪 Quality | Unit tests with Vitest and enforced coverage thresholds |
| 🐳 Deployment | Docker + Docker Compose, separate development and production setups |
| ⭐ Bonus | Ghost piece, next-piece preview, scoring, room chat and global Top 3 |

### Controls

| Key | Action |
|:---:|--------|
| `←` / `→` | Move piece |
| `↑` | Rotate |
| `↓` | Soft drop |
| `Space` | Hard drop |

---

## 🏗️ Architecture

```
┌────────────────────────────┐         HTTP (index.html, bundle.js)        ┌──────────────────────────────┐
│        CLIENT (SPA)        │ ◄────────────────────────────────────────── │       SERVER (Node.js)       │
│  React + Zustand + Vite    │                                             │  Express + Socket.IO         │
│                            │ ◄────────── Socket.IO events ─────────────► │                              │
│  • PURE game logic         │                                             │  • Game / Player / Piece     │
│  • Board rendering         │                                             │  • GameManager (rooms)       │
│  • Isolated socket layer   │                                             │  • Piece distribution        │
└────────────────────────────┘                                             └──────────────────────────────┘
```

### Responsibility split

| Responsibility | Client | Server |
|----------------|:------:|:------:|
| Movement, rotation, collisions and line clearing | ✅ | |
| Own spectrum computation | ✅ | |
| Room, player and host management | | ✅ |
| Piece generation and distribution (same sequence for everyone) | | ✅ |
| Validation of incoming data (names, spectrum, cleared lines) | | ✅ |
| Penalty computation and dispatch | | ✅ |
| End-of-game and winner detection | | ✅ |

### Key design decisions

- **Functional client, no `this`.** All board and piece logic (`collision`, `movement`, `rotation`, `merge`, `lines`, `penalty`, `spectrum`…) consists of **pure functions** that take a state and return a new one, never mutating anything. This makes them trivial to test.
- **Object-oriented server.** `Game`, `Player`, `Piece` and `GameManager` classes, with each room's state encapsulated.
- **Same piece sequence for everyone.** The server keeps one piece list per game and a `nextPieceIndex` per player: each player consumes the sequence at their own pace, but always in the same order.
- **Fully encapsulated Socket.IO.** No component or store imports `socket.io-client`; only `socket/socketMiddleware.ts` does. It translates server events into state changes and subscribes to the game store to emit events back. The UI is unaware a socket exists.
- **The server never trusts the client.** Type and range of everything received is validated (names via regex, spectrum as 10 integers between 0 and 20, cleared lines between 2 and 4 to trigger penalties, etc.).
- **Single server in production.** Express serves `index.html`, `bundle.js` and static assets, with a fallback to `index.html` for the SPA's `/:room/:player` routes.

---

## 🔌 Network protocol (Socket.IO)

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ room, name }` | Join a room with a name |
| `start` | — | Host starts (or restarts) the game |
| `needPieces` | `count?` | Request more pieces when the queue runs low |
| `spectrum` | `number[10]` | Player's column heights |
| `linesCleared` | `number` | Lines cleared in one move |
| `lost` | — | The player has lost |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `joined` | `{ room, name }` | Join confirmation |
| `joinError` | `invalid_name \| already_started \| name_taken` | Reason for rejection |
| `state` | `{ room, status, players[] }` | Public room state (includes spectrum) |
| `pieces` | `PieceType[]` | Batch of pieces for that player |
| `penalty` | `number` | Penalty rows to add |
| `startError` | `not_in_room \| game_not_found \| cannot_start` | Reason the start failed |
| `gameOver` | `{ winner \| null }` | End of game |

> **Bonus:** `chat` (both directions) and `topScores` (server → client).

### Game lifecycle

```
waiting ──(host starts)──► playing ──(1 player left alive / solo: 0 alive)──► finished
   ▲                                                                              │
   └────────────────────────── new game (start) ◄─────────────────────────────────┘
```

- Once a game has started, **no new players can join** until the next round.
- If the host leaves, the role is automatically passed to another player.
- Empty rooms are removed from memory. **There is no data persistence.**

---

## 🛠️ Tech stack

**Client:** React 19 · TypeScript · Vite · Zustand · React Router (`BrowserRouter`) · socket.io-client  
**Server:** Node.js · Express 5 · Socket.IO · TypeScript  
**Testing:** Vitest · @vitest/coverage-v8 · Testing Library · jsdom  
**DevOps:** Docker · Docker Compose · Makefile · multi-stage builds

> Project constraints respected: no `<table>`, layouts built with CSS Grid/Flexbox, and no canvas, SVG or DOM-manipulation libraries.

---

## 🚀 Getting started

### Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- `make`
- *(Optional, without Docker)* Node.js LTS and npm

### 1. Clone and configure

```bash
git clone https://github.com/<your-username>/red-tetris.git
cd red-tetris
cp .env.example .env
```

The `.env` file is git-ignored; no credentials are stored in the repository.

### 2. Pick a mode

| Command | What it does |
|---------|--------------|
| `make up` | **Development**: client with hot reload on `:5173`, server on `:3000` |
| `make eval` | **Production**: a single Express server on `:3000` serving client + sockets |
| `make eval-bonus` | Production **with all bonus features** (ghost piece, next piece, scoring, chat, Top 3) |
| `make test` | Runs client and server tests with a coverage report |
| `make logs` / `make eval-logs` | Follow logs |
| `make down` / `make eval-clean` / `make eval-bonus-clean` | Stop containers |
| `make clean` / `make re` | Clean everything / rebuild from scratch |

### 3. Play

Open in your browser:

```
http://localhost:3000/<room>/<your-name>
```

For example, `http://localhost:3000/room1/anna` and, in another tab, `http://localhost:3000/room1/luke`.  
The first player to join is the **host** and presses *Start game*. To play solo, just join on your own.

> In development mode (`make up`) the client is served at `http://localhost:5173/<room>/<player>`.

<details>
<summary><b>Running without Docker</b></summary>

```bash
# Server
cd server && npm ci && npm run build

# Client
cd ../client && npm ci && npm run build

# Start (serves the client from client/dist)
cd ../server && npm start
```

</details>

---

## 🧪 Testing

Unit tests run with **Vitest** and coverage is measured with the **V8** provider. Thresholds are **enforced in the configuration**: if they are not met, the command fails.

| Metric | Minimum threshold |
|--------|:-----------------:|
| Statements | 70 % |
| Functions | 70 % |
| Lines | 70 % |
| Branches | 50 % |

```bash
make test                      # client + server, in containers

# or, without Docker:
cd client && npm test          # game engine, stores, spectrum
cd server && npm test          # Game, Player, Piece, GameManager, validation
```

**What is tested**

- **Client:** pure engine functions (collisions, movement, rotation, piece merging, line clearing, penalties, spectrum) and game store actions.
- **Server:** `Game` rules (adding players, host handover, start, end of game, winner), consistent piece distribution, input validation and room management in `GameManager`.

HTML reports are available at `client/coverage/index.html` and `server/coverage/index.html`.

---

## ⭐ Bonus features

The extras live in the [`bonus/`](./bonus) folder and **only contain the files they modify or add** relative to the base version; the `Dockerfile` overlays them on top of the main code at build time. This keeps the base version untouched.

- **Ghost piece:** outline showing where the current piece will land.
- **Next piece:** preview of the next piece in the queue.
- **Scoring:** live points and lines counter.
- **Room chat:** messages of up to 50 characters, visible only to players in the same room.
- **Global Top 3:** best scores across all rooms since the server started (in memory).

```bash
make eval-bonus
```

---

## 📁 Repository structure

```
.
├── client/                    # SPA (React + Vite + Zustand)
│   ├── src/
│   │   ├── game/              # PURE logic: board, pieces, rotation, collision,
│   │   │                      #   movement, merge, lines, penalty, spectrum + view components
│   │   ├── hooks/             # useGameLoop, useGameControls, useRoom
│   │   ├── socket/            # socket.ts, events.ts, socketMiddleware.ts 
│   │   └── store/             # gameStore (match) and roomStore (room/connection)
│   └── tests/
├── server/                    # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── classes/           # Game, Player, Piece, GameManager
│   │   └── utils/             # input validation
│   └── tests/
├── bonus/                     # Extras: only modified/added files
├── docker/                    # Dockerfiles (client dev, server dev, production)
├── docker-compose.yml         # Development
├── docker-compose.prod.yml    # Production
├── Makefile
└── .env.example
```

---

## 🔒 Security and best practices

- Strict server-side validation of **all** client input.
- The author name of each chat message is set by the server, not the client.
- No credentials or secrets in the repository (`.env` ignored, `.env.example` as a template).
- Docker images based on `node:lts-alpine`, with multi-stage builds and dev dependencies excluded in production.

---

## 👤 Author

**Victor** — student at [42 Madrid](https://www.42madrid.com/)

- GitHub: [victordiezcuesta](https://github.com/victordiezcuesta)
- LinkedIn: [Victor Diez Cuesta](https://www.linkedin.com/in/victor-diez-cuesta/)

---

<div align="center">
<sub>Built as part of the 42 curriculum · Red Tetris</sub>
</div>
