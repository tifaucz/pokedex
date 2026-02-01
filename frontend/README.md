# Pokedex Frontend

React + TypeScript frontend for the Pokedex application.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router v7
- Axios
- Tailwind CSS

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file (already included):
```
VITE_API_URL=http://localhost:3000
```

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.ts             # Authentication API
│   └── pokemon.ts          # Pokemon API
├── components/             # Reusable components
│   ├── ProtectedRoute.tsx  # Route guard component
│   ├── SortModal.tsx       # Sort options modal
│   └── PokeballIcon.tsx    # Pokeball SVG icon
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state
├── pages/                  # Page components
│   ├── Login.tsx           # Login page
│   ├── PokemonList.tsx     # Main Pokemon list
│   └── PokemonDetail.tsx   # Pokemon detail view
├── test/                   # Test utilities
│   ├── setup.ts            # Vitest setup
│   └── utils.tsx           # Test helpers and mocks
├── types/                  # TypeScript types
│   └── index.ts
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
└── index.css               # Global styles + Tailwind
```

## Features

### Authentication
- Login form with validation
- JWT token storage in localStorage
- Auto-redirect based on auth state
- Logout functionality

### Pokemon List
- Display all Pokemon with images
- Search by name or number
- Sort by name or number (asc/desc)
- Responsive grid layout

### Pokemon Detail
- Pokemon image, name, number
- Type badges with color coding
- About section (weight, height, abilities)
- Description and base stats with visual bars
- Previous/next Pokemon navigation
- Back navigation

### Route Protection
- `/login` - Public
- `/` - Protected (Pokemon list)
- `/pokemon/:id` - Protected (Pokemon detail)

## Demo Credentials

- **Username:** `admin`
- **Password:** `admin`
