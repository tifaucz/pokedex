# Pokedex Backend API

Ruby on Rails API backend for the Pokedex application.

## Tech Stack

- Ruby 3.4.7
- Ruby on Rails 8.1 (API mode)
- SQLite
- JWT for authentication
- HTTParty for PokeAPI integration
- RSpec for testing

## Setup

```bash
# Install dependencies
bundle install

# Start the server
bundle exec rails server -p 3000
```

The API will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Authenticate user, returns JWT token |
| GET | `/pokemons` | Yes | Get all Pokemon |
| GET | `/pokemons/:id` | Yes | Get Pokemon details by ID |

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Example Requests

**Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "username": "admin" }
}
```

**Get All Pokemon:**
```bash
curl http://localhost:3000/pokemons \
  -H "Authorization: Bearer <token>"
```

**Get Pokemon by ID:**
```bash
curl http://localhost:3000/pokemons/1 \
  -H "Authorization: Bearer <token>"
```

## Running Tests

```bash
bundle exec rspec
```

## Project Structure

```
app/
├── controllers/
│   ├── concerns/
│   │   └── authenticatable.rb    # JWT auth middleware
│   ├── application_controller.rb
│   ├── auth_controller.rb        # Login endpoint
│   └── pokemons_controller.rb    # Pokemon endpoints
└── services/
    ├── jwt_service.rb            # JWT encode/decode
    └── pokeapi_service.rb        # PokeAPI integration

spec/
├── requests/
│   ├── auth_spec.rb              # Auth endpoint tests
│   └── pokemons_spec.rb          # Pokemon endpoint tests
└── services/
    ├── jwt_service_spec.rb       # JWT service tests
    └── pokeapi_service_spec.rb   # PokeAPI service tests
```

## Architecture

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic (JWT, PokeAPI integration)
- **Concerns**: Reusable authentication middleware

## Demo Credentials

- **Username:** `admin`
- **Password:** `admin`
