# Snake Game

## Description

Snake Game is a classic video game where the player controls a snake moving around a playing field. The goal of the game is to collect as many fruits as possible without hitting the walls or yourself.
The game is inspired by the original Nokia mobile phone games and offers a simple but engaging gaming experience.
Players can compete for high scores on the leaderboard, which tracks the best performances across different difficulty levels.

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed

### Production Setup

```bash
# Build and start all services in production mode
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Development Setup

```bash
# Build and start all services in development mode (with hot reload)
docker-compose -f compose.dev.yml up --build -d

# Access the application
# Frontend: http://localhost:5173 (with hot reload)
# Backend API: http://localhost:8080 (with debug port 5005)
```

### Stop Services

```bash
# Stop production
docker-compose down

# Stop development
docker-compose -f compose.dev.yml down
```

## Build Scripts

For a complete build similar to the CI/CD pipeline, use the provided build scripts:

### Unix/Linux/macOS

```bash
# Full build (frontend + backend + Docker image)
./build.sh

# Skip cleaning previous builds
./build.sh --no-clean

# Skip cleaning (faster rebuilds)
./build.sh --no-clean

# Show help
./build.sh --help
```

### Windows

```cmd
REM Full build (frontend + backend + Docker image)
build.bat

REM Show help
build.bat --help
```

The build script will:

1. Clean previous builds
2. Install dependencies for both frontend and backend
3. Run backend tests
4. Build frontend for production
5. Build backend uber-jar with production profile
6. **Rebundle JAR** - Combine frontend assets into backend JAR
7. Output rebundled JAR to `dist/app.jar`

This creates a single JAR file that serves both the API and web UI, identical to the CI/CD pipeline (which uses the same rebundle script).

### Standalone Rebundling

You can also use the rebundling scripts directly:

```bash
# Unix/Linux/macOS
./ci/rebundle.sh backend/target/backend-PROD-SNAPSHOT-runner.jar frontend/dist dist/app.jar

# Windows
ci\rebundle.bat backend\target\backend-PROD-SNAPSHOT-runner.jar frontend\dist dist\app.jar
```

## Manual Setup

### Frontend

For more information about the frontend, see the [Frontend README](./frontend/README.md).

### Backend

For more information about the backend, see the [Backend README](./backend/README.md).

# Frontend

## 1. Prerequisites

### Manual Setup

- **Node.js** (version 20 or higher)
- **npm** (comes with Node.js)

### Docker Setup

- **Docker** and **Docker Compose**

## 2. Technologies and Libraries

- **React** - UI Library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build Tool and Dev Server
- **React Router DOM** - Routing
- **Tailwind CSS** - CSS Framework
- **ESLint & Prettier** - Code Linting and Formatting

## 3. Getting Started

### With Docker (Recommended)

```bash
# Development mode (from project root)
docker-compose -f compose.dev.yml up -d frontend

# Production mode (from project root)
docker-compose up -d frontend

# The frontend will be available at:
# - http://localhost:5173 (Development with hot reload)
# - http://localhost:3000 (Production)
```

### Manual Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build project
npm run build

# Preview build
npm run preview

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

## 4. Testing

The frontend uses **Vitest** as a test framework together with **React Testing Library** for component testing.

### Test Commands

```bash
# Run tests (Watch Mode)
npm test

# Run tests once
npm test -- --run

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Tests focus on logic-heavy components and utilities:

- ✅ **Game logic utilities** (`gameLogic.ts`) - Position generation, fruit spawning, game state initialization
- ✅ **Game constants** (`game.ts`) - Difficulty configurations, direction mappings, key bindings
- ✅ **Game state management** (`useSnakeGame.ts`) - Game loop, keyboard controls, pause/resume, collision detection, score tracking
- ✅ **Interactive components** (`GameControls`, `DifficultySwitcher`) - User interactions and state changes

**Current Coverage:**

- **89.42%** Statement Coverage
- **82.81%** Branch Coverage
- **100%** Function Coverage
- **89.69%** Line Coverage

Purely presentational components without logic are not tested.

### View Coverage Report

After running `npm run test:coverage`, a detailed HTML report is generated:

```bash
# Open HTML report (macOS)
open coverage/index.html

# Open HTML report (Linux)
xdg-open coverage/index.html

# Open HTML report (Windows)
start coverage/index.html
```

## 5. Docker Configuration

### Base Images

- **Build Stage**: `node:20-alpine`
- **Production Stage**: `nginx:alpine`

### Development vs Production

- **Development**: Uses `Dockerfile.dev` with hot reload and volume mounting
- **Production**: Multi-stage build with optimized Nginx serving static files

### Environment Variables

- `VITE_API_URL`: Backend API URL (auto-configured in Docker setup)

### Nginx Configuration

- Serves React app with SPA routing support
- Proxies `/api` requests to backend service
