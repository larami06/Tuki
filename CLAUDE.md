# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tuki** is a full-stack educational mobile app for children. It has two independent parts:
- `src/backend/` — .NET 8 / ASP.NET Core REST API with PostgreSQL
- `tuki-mobile/` — React Native / Expo (TypeScript) cross-platform app

---

## Commands

### Backend (`src/backend/`)

```bash
dotnet restore          # Restore NuGet packages
dotnet build            # Build all projects
dotnet run --project TUKI.API   # Run the API (http://localhost:5273)
```

Database migrations (EF Core, run from `src/backend/`):
```bash
dotnet ef migrations add <Name> --project TUKI.Infrastructure --startup-project TUKI.API
dotnet ef database update --project TUKI.Infrastructure --startup-project TUKI.API
```

### Mobile (`tuki-mobile/`)

```bash
npm install             # Install dependencies
npm run start           # Start Expo dev server
npm run android         # Run on Android emulator
npm run ios             # Run on iOS simulator
npm run web             # Run in browser
npm run lint            # Lint with expo lint (eslint-config-expo)
```

---

## Architecture

### Backend — Clean Architecture (4 layers)

```
TUKI.Domain          ← Entities (Usuario) + repository interfaces. No external deps.
TUKI.Application     ← Services, DTOs, AutoMapper profiles. References Domain only.
TUKI.Infrastructure  ← EF Core DbContext (Npgsql/PostgreSQL) + repository impls.
TUKI.API             ← ASP.NET Core controllers, DI wiring, Swagger middleware.
```

Dependency direction: API → Application → Domain ← Infrastructure.  
All DTO mappings are centralized in `TUKI.Application/Mappings/MappingProfile.cs`.

**Database:** PostgreSQL `tuki_db` on `localhost:5432`. Connection string lives in `TUKI.API/appsettings.json` (`Password=sua_senha` is a placeholder — update locally).

**Current API surface:**
```
GET    /api/usuarios
GET    /api/usuarios/{id}
POST   /api/usuarios   { "nick": string, "idade": int, "avatar": string }
```

### Mobile — Expo Router + service layer

```
app/                  ← File-based routes (Expo Router auto-registers these)
  (tabs)/             ← Tab-navigator screens
  cadastro.tsx        ← Registration route
  login.tsx           ← Login route
src/screens/          ← Heavier screen components (e.g. CadastroScreen.tsx)
src/services/
  api.ts              ← HTTP calls to backend
  storage.ts          ← AsyncStorage wrapper for local user persistence
hooks/                ← Custom hooks (theme/color scheme)
```

The API base URL in `src/services/api.ts` is hardcoded to `192.168.18.40:5276` (a LAN IP for physical-device testing). Update this when running against a different host.

Routing is purely file-based — adding a file under `app/` creates a route automatically. No manual route registration needed.

### Key config flags (app.json)

- `newArchEnabled: true` — React Native new architecture
- `reactCompiler: true` — React Compiler enabled
- `typedRoutes: true` — Expo Router typed routes

TypeScript is in strict mode with path alias `@/*` → project root.
