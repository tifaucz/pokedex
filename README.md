# Pokedex

A full-stack Pokemon application built with React (frontend) and Ruby on Rails (backend).

## User Story

> As a Pokemon trainer, I want to log into the Pokedex app so I can browse and search through all Pokemon, view their details including abilities and moves, and easily navigate through the sorted list.

## Tech Stack

### Backend
- Ruby 3.4.7
- Ruby on Rails 8.1 (API mode)
- SQLite
- JWT for authentication
- HTTParty for PokeAPI integration
- RSpec for testing

### Frontend
- React 18
- TypeScript
- Vite
- React Router v6
- Axios
- Tailwind CSS

## Project Structure

```
pokedex/
├── backend/                    # Rails API
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── concerns/
│   │   │   │   └── authenticatable.rb
│   │   │   ├── auth_controller.rb
│   │   │   └── pokemons_controller.rb
│   │   └── services/
│   │       ├── jwt_service.rb
│   │       └── pokeapi_service.rb
│   └── spec/
│       └── requests/
│           ├── auth_spec.rb
│           └── pokemons_spec.rb
│
├── frontend/                   # React SPA
│   └── src/
│       ├── api/
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   └── pokemon.ts
│       ├── components/
│       │   └── ProtectedRoute.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── PokemonList.tsx
│       │   └── PokemonDetail.tsx
│       ├── types/
│       │   └── index.ts
│       └── App.tsx
│
└── REQUIREMENTS.md             # Original project requirements
```

## Setup & Running

### Prerequisites
- Ruby 3.4+
- Node.js 18+
- npm

### Backend

```bash
cd backend

# Install dependencies
bundle install

# Start the server (runs on port 3000)
bundle exec rails server -p 3000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on port 5173)
npm run dev
```

### Running Both

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend && bundle exec rails server -p 3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Then open http://localhost:5173 in your browser.

## Demo Credentials

- **Username:** `admin`
- **Password:** `admin`

## Testing

The project includes comprehensive test coverage for both frontend and backend.

### Backend Tests (RSpec)

**60 tests** covering:
- Authentication endpoints (login, credentials validation)
- Pokemon API endpoints (list, detail, authorization)
- JWT Service (encode, decode, expiration, tampering)
- PokeAPI Service (fetching, error handling, data transformation)

```bash
cd backend

# Run all tests with documentation format
bundle exec rspec

# Run with progress dots (faster output)
bundle exec rspec --format progress

# Run specific test file
bundle exec rspec spec/requests/auth_spec.rb

# Run with test profiling (shows slowest tests)
bundle exec rspec --profile
```

**Example output:**
```
Auth
  POST /login
    with valid credentials
      returns a token
      returns a valid JWT token
    with invalid credentials
      returns an error for wrong username
      returns an error for wrong password

JwtService
  .encode
    encodes a payload into a JWT token
    includes expiration time in the token
  .decode
    decodes a valid JWT token
    returns nil for an invalid token

60 examples, 0 failures
```

### Frontend Tests (Vitest)

**95 tests** covering:
- Login page (form validation, API calls, error handling, loading states)
- AuthContext (login, logout, state persistence)
- ProtectedRoute (redirect logic, authenticated access)
- PokemonList (loading, error, rendering, search, sort, navigation)
- PokemonDetail (loading, error, all sections, navigation, type colors)
- API clients (auth, pokemon, interceptors)

```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test src/pages/Login.test.tsx
```

**Example output:**
```
 ✓ src/api/auth.test.ts (4 tests)
 ✓ src/api/pokemon.test.ts (8 tests)
 ✓ src/contexts/AuthContext.test.tsx (9 tests)
 ✓ src/components/ProtectedRoute.test.tsx (4 tests)
 ✓ src/pages/Login.test.tsx (10 tests)
 ✓ src/pages/PokemonList.test.tsx (22 tests)
 ✓ src/pages/PokemonDetail.test.tsx (29 tests)
 ✓ src/api/client.test.ts (9 tests)

 Test Files  8 passed (8)
      Tests  95 passed (95)
```

### Test Summary

| Area | Framework | Tests | Coverage |
|------|-----------|-------|----------|
| Backend | RSpec + WebMock | 60 | Auth, API, Services |
| Frontend | Vitest + Testing Library | 95 | Components, Hooks, API |
| **Total** | | **155** | |

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Authenticate user, returns JWT token |
| GET | `/pokemons` | Yes | Get all Pokemon |
| GET | `/pokemons/:id` | Yes | Get Pokemon details by ID |

### Example Requests

**Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Get Pokemon (with token):**
```bash
curl http://localhost:3000/pokemons \
  -H "Authorization: Bearer <your-token>"
```

## Features

### Authentication
- Login with username/password
- JWT token-based authentication
- Token stored in localStorage
- Protected routes with automatic redirects

### Pokemon List
- Display all Pokemon with images
- Search by name or number
- Sort by name or number (ascending/descending)
- Responsive grid layout (2-5 columns based on screen size)

### Pokemon Detail
- Pokemon image, name, and number
- Abilities list
- Moves list
- Forms list
- Back navigation

## Architecture Decisions

### Backend
- **Rails API mode**: Lightweight, no unnecessary view layer
- **Services layer**: Business logic separated from controllers (JwtService, PokeapiService)
- **Concerns**: Reusable authentication middleware (Authenticatable)
- **No caching**: Direct PokeAPI calls for fresh data (per requirements)

### Frontend
- **TypeScript**: Type safety and better developer experience
- **Context API**: Simple global state for authentication
- **Axios interceptors**: Automatic token injection on requests
- **Tailwind CSS**: Utility-first styling for rapid development
- **Mobile-first**: Responsive design that works on all screen sizes
