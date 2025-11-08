# Gravity Jump Game

## Overview

An interactive 3D physics simulation game built with React and Three.js that demonstrates gravitational effects across different celestial bodies. Players control an astronaut who can jump on various planets and moons, experiencing realistic gravity differences. The application combines a React-based frontend with an Express backend, using Drizzle ORM for database operations with PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**3D Rendering**: The application uses React Three Fiber (@react-three/fiber) as a React renderer for Three.js, enabling declarative 3D scene composition. Additional libraries include:
- @react-three/drei for helper components (OrbitControls, KeyboardControls)
- @react-three/postprocessing for visual effects
- GLSL shader support via vite-plugin-glsl

**State Management**: Zustand is used for lightweight state management with multiple stores:
- `useGravityGame`: Manages planet selection, player mass, gravity calculations, and jump states
- `useGame`: Controls game phase states (ready, playing, ended)
- `useAudio`: Handles audio playback and mute controls

**UI Components**: Radix UI primitives wrapped with custom styling provide accessible component patterns. TailwindCSS with custom theme extensions handles styling. The design system uses CSS custom properties for theming.

**Project Structure**:
- `/client/src/components` - React components including 3D scene elements (Astronaut, Planet, GameScene) and UI components
- `/client/src/lib/stores` - Zustand state management stores
- `/client/src/lib` - Utility functions and query client configuration
- Path aliases configured: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript using ESM modules

**API Structure**: RESTful API with routes prefixed with `/api`. The `registerRoutes` function in `server/routes.ts` sets up HTTP server and route handlers.

**Development Mode**: Vite dev server runs in middleware mode during development, providing HMR and serving the React application. In production, static files are served from the built output.

**Storage Layer**: Abstract storage interface (`IStorage`) allows for multiple implementations:
- `MemStorage`: In-memory storage for development/testing
- Database storage implementation uses the same interface for consistency

**Logging**: Custom request logging middleware captures API calls with timing, status codes, and response payloads

### Data Storage

**ORM**: Drizzle ORM provides type-safe database operations with PostgreSQL dialect

**Database Schema** (`shared/schema.ts`):
- `users` table with id (serial primary key), username (unique text), and password (text)
- Schema validation using Zod via `drizzle-zod` for runtime type checking

**Migrations**: Drizzle Kit manages schema migrations with output in `/migrations` directory

**Connection**: Uses Neon serverless driver (@neondatabase/serverless) for PostgreSQL connections via `DATABASE_URL` environment variable

### External Dependencies

**Database**: PostgreSQL (likely Neon serverless) accessed via connection string in `DATABASE_URL` environment variable

**Font Loading**: Inter font family loaded via @fontsource/inter

**Asset Types**: Support for 3D models (.gltf, .glb) and audio files (.mp3, .ogg, .wav) configured in Vite

**Development Tools**:
- TypeScript for type safety across the entire stack
- ESBuild for production server bundling
- Replit-specific vite plugin for runtime error overlay

**Key Third-Party Libraries**:
- React Query (@tanstack/react-query) for server state management
- date-fns for date manipulation
- class-variance-authority and clsx for dynamic className generation
- cmdk for command palette functionality
- nanoid for unique ID generation

**Build Process**: 
- Client: Vite builds React app to `dist/public`
- Server: ESBuild bundles server code to `dist/index.js` with external packages
- Production runs compiled output via Node.js