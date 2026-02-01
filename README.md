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
- React 19
- TypeScript
- Vite
- React Router v7
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
│       ├── requests/
│       │   ├── auth_spec.rb
│       │   └── pokemons_spec.rb
│       └── services/
│           ├── jwt_service_spec.rb
│           └── pokeapi_service_spec.rb
│
├── frontend/                   # React SPA
│   └── src/
│       ├── api/
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   └── pokemon.ts
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── SortModal.tsx
│       │   └── PokeballIcon.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── PokemonList.tsx
│       │   └── PokemonDetail.tsx
│       ├── test/
│       │   ├── setup.ts
│       │   └── utils.tsx
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
- Type badges with color coding
- About section (weight, height, abilities)
- Description from species data
- Base stats with visual bars
- Navigation to previous/next Pokemon
- Back navigation

## Architecture Decisions

### Backend
- **Rails API mode**: Lightweight, no unnecessary view layer
- **Services layer**: Business logic separated from controllers (JwtService, PokeapiService)
- **Concerns**: Reusable authentication middleware (Authenticatable)
- **Smart caching**: Pokemon list cached for 1 hour (`Rails.cache.fetch`), individual Pokemon fetched fresh for up-to-date details

### Frontend
- **TypeScript**: Type safety and better developer experience
- **Context API**: Simple global state for authentication
- **Axios interceptors**: Automatic token injection on requests
- **Tailwind CSS**: Utility-first styling for rapid development
- **Mobile-first**: Responsive design that works on all screen sizes


## GenAI Tools Usage

### Tool & Workflow

I used **OpenCode CLI** with **Claude Code** and a deliberate **plan-then-execute workflow**:

- **Plan Mode**: Used a stronger model (Claude Opus) for analysis, architecture decisions, and detailed implementation planning
- **Execute Mode**: Used a smaller, faster model to apply the planned changes efficiently

This two-phase approach ensures thoughtful design while maintaining development speed.

### Example Prompts Used

**Architecture Planning** (specifying tech stack + letting AI suggest libraries):

```
Set up a Rails 8 API backend with JWT authentication. 
Use RSpec for testing. I need a login endpoint with 
hardcoded admin/admin credentials. What libraries do 
you recommend for JWT handling?
```
> AI suggested `jwt` gem, I accepted. Also suggested HTTParty for PokeAPI calls.

```
Create a React 18 frontend with TypeScript and Vite. 
Use React Router v6 for routing. I need protected routes 
that redirect unauthenticated users to login. What's a 
good approach for global auth state?
```
> AI suggested Context API (simple) vs Redux (overkill for this). I went with Context.
**Feature Implementation**:
```
Add pagination support to /pokemons endpoint with offset 
and limit params, matching PokeAPI's pagination style.
```
```
Implement search and sort functionality for the Pokemon 
list. Sort by name or number, search by name or number.
```

### Modifications to AI-Generated Code
| Area | AI Generated | My Modifications |
|------|--------------|------------------|
| JWT Service | Basic encode/decode | Added 24h expiration, error handling |
| PokeAPI Service | Direct API calls | Added 1-hour caching with `Rails.cache.fetch` |
| Frontend routing | Basic routes | Added `ProtectedRoute` component with redirect logic |
| Tests | Initial structure | Expanded to 155 tests (60 backend + 95 frontend) |

### Validation Process
1. **Ran tests after each generation** - Ensured AI code didn't break existing functionality
2. **Manual API testing** - Verified endpoints with curl before frontend integration
3. **Code review** - Checked for security issues (JWT secret handling, CORS config)
4. **Linting** - Used RuboCop (backend) and ESLint (frontend) to enforce code quality

### Critical Thinking Applied
- **Rejected** over-engineered auth suggestions when it was not required.
- **Added** caching layer that AI didn't suggest initially for PokeAPI calls.
- **Removed** unnecessary abstractions to keep code simple (KISS principle).

### Generative AI tools
The following task should also be added in the same repo in a README file.
Imagine you're tasked with generating a Table component for a simple task management
system using your preferred language. The system should support the following functionality:
- Create, read, update, and delete tasks (CRUD)
- Each task has a title, description, status, and due_date
- Tasks are associated with a user (assume basic User model exists)

# Instructions: Using your preferred GenAI coding tool (e.g., Cursor, Claude Code, Windsurf, GitHub
Copilot, etc.), write the prompt you would use to generate the API scaffold or full
implementation.
 - We need to create a table component for task management. It should be a simple CRUD where each task has a title description and due date, being associated with an existing user. Explore the current code and generate a detailed plan for implementation, let me know if you have any questions so we can refine the plan before implementing.

# Show the output code (or a representative sample of it): 
 - Here is a sample of the results (I'm using Opencode with Claude Opus 4.5):
```
 Run migrations and verify
 # Generate User model migration
 $ cd backend && bin/rails generate model User username:string password_digest:string --no-test-framework
 invoke  active_record
       create    db/migrate/20260202204151_create_users.rb
       create    app/models/user.rb
 → Read backend/db/migrate/20260202204151_create_users.rb 
 → Read backend/app/models/user.rb 
 ← Edit backend/db/migrate/20260202204151_create_users.rb
 class CreateUsers < ActiveRecord::Migration[8.1]
   def change
     create_table :users do |t|
       t.string :username
       t.string :password_digest
       t.string :username, null: false
       t.string :password_digest, null: false
       t.timestamps
     end
     add_index :users, :username, unique: true
   end
 end
 ← Edit backend/app/models/user.rb
 class User < ApplicationRecord
   has_secure_password
   has_many :tasks, dependent: :destroy
   validates :username, presence: true, uniqueness: true
 end

 Run migrations and verify
 # Generate Task model migration
 $ cd backend && bin/rails generate model Task title:string description:text due_date:date user:references --no-test-framework
 invoke  active_record
       create    db/migrate/20260202204212_create_tasks.rb
       create    app/models/task.rb
 → Read backend/db/migrate/20260202204212_create_tasks.rb 
 → Read backend/app/models/task.rb 
 ← Edit backend/db/migrate/20260202204212_create_tasks.rb
 class CreateTasks < ActiveRecord::Migration[8.1]
   def change
     create_table :tasks do |t|
       t.string :title
       t.string :title, null: false
       t.text :description
       t.date :due_date
       t.references :user, null: false, foreign_key: true
 ← Edit backend/app/models/task.rb
 class Task < ApplicationRecord
   belongs_to :user
   validates :title, presence: true
 end

 Run migrations and verify
 → Read backend/db/seeds.rb 
 ← Edit backend/db/seeds.rb
 #
 #   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
 #     MovieGenre.find_or_create_by!(name: genre_name)
 #   end
 # Create admin user
 User.find_or_create_by!(username: "admin") do |user|
   user.password = "admin"
 end

 Run migrations and verify
 → Read backend/app/controllers/auth_controller.rb 
 ← Edit backend/app/controllers/auth_controller.rb
 def login
   username = params[:username]
   password = params[:password]
   if username == 'admin' && password == 'admin'
     token = JwtService.encode({ username: username })
     render json: { token: token, user: { username: username } }, status: :ok
   user = User.find_by(username: username)
   if user&.authenticate(password)
     token = JwtService.encode({ user_id: user.id, username: user.username })
     render json: { token: token, user: { id: user.id, username: user.username } }, status: :ok
   else
     render json: { error: 'Invalid credentials' }, status: :unauthorized
   end
 end
 Now I need to update the Authenticatable concern to also provide access to the current user:
 → Read backend/app/controllers/concerns/authenticatable.rb 
 ← Edit backend/app/controllers/concerns/authenticatable.rb
   def authenticate_request
     header = request.headers['Authorization']
     header = header.split(' ').last if header
     
     decoded = JwtService.decode(header)
     
     unless decoded
       render json: { error: 'Unauthorized' }, status: :unauthorized
       return
     end
     @current_user = User.find_by(id: decoded[:user_id])
     unless @current_user
       render json: { error: 'Unauthorized' }, status: :unauthorized
     end
   end
   def current_user
     @current_user
   end
 end

 Run migrations and verify
 → Read backend/app/controllers/pokemons_controller.rb 
 # Wrote backend/app/controllers/tasks_controller.rb
 class TasksController < ApplicationController
   include Authenticatable
   before_action :set_task, only: [:show, :update, :destroy]
   def index
     tasks = Task.includes(:user).order(created_at: :desc)
     render json: tasks.map { |task| task_json(task) }, status: :ok
   end
   def show
     render json: task_json(@task), status: :ok
   end
   def create
     task = current_user.tasks.build(task_params)
     if task.save
       render json: task_json(task), status: :created
     else
       render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
     end
   end
   def update
     if @task.update(task_params)
       render json: task_json(@task), status: :ok
     else
       render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
     end
   end
   def destroy
     @task.destroy
     head :no_content
   end
   private
   def set_task
     @task = Task.find(params[:id])
   rescue ActiveRecord::RecordNotFound
     render json: { error: 'Task not found' }, status: :not_found
   end
   def task_params
     params.require(:task).permit(:title, :description, :due_date)
   end
   def task_json(task)
     {
       id: task.id,
       title: task.title,
       description: task.description,
       due_date: task.due_date,
       user: {
         id: task.user.id,
         username: task.user.username
       },
       created_at: task.created_at,
       updated_at: task.updated_at
     }
   end
 end
 Error [3:33]: Layout/SpaceInsideArrayLiteralBrackets: Use space inside array brackets.
 Error [3:58]: Layout/SpaceInsideArrayLiteralBrackets: Use space inside array brackets.
 This offense is not autocorrectable.
 Error [42:26]: Style/StringLiterals: Prefer double-quoted strings unless you need single quotes to avoid extra backslashes for escaping.

 Run migrations and verify
 → Read backend/config/routes.rb 
 ← Edit backend/config/routes.rb
   post 'login', to: 'auth#login'
   # Pokemon endpoints
   resources :pokemons, only: [:index, :show]
   # Task endpoints
   resources :tasks
 end
 # Todos
 [✓] 
 Create User model with migration
 [✓] 
 Create Task model with migration
 [✓] 
 Update seeds.rb with admin user
 [✓] 
 Update auth_controller to use database
 [✓] 
 Create tasks_controller with CRUD
 [✓] 
 Update routes.rb
 [•] 
 Add backend tests
 [ ] 
 Add frontend types
 [ ] 
 Create tasks API module
 [ ] 
 Create TaskFormModal component
 [ ] 
 Create ConfirmModal component
 [ ] 
 Create TaskList page
 [ ] 
 Update App.tsx with route
 [ ] 
 Add frontend tests
 [ ] 
 Run migrations and verify
 → Read backend/spec/requests/auth_spec.rb 
 → Read backend/spec/requests/pokemons_spec.rb 
 → Read backend/spec/rails_helper.rb 
 Now I'll create the backend tests. I need to update the auth_spec to work with the new User model, and create new tests for tasks:
 ← Edit backend/spec/requests/auth_spec.rb
 require 'rails_helper'
 RSpec.describe "Auth", type: :request do
   describe "POST /login" do
     let!(:admin_user) { User.create!(username: 'admin', password: 'admin') }
     context "with valid credentials" do
       it "returns a token" do
         post '/login', params: { username: 'admin', password: 'admin' }
         
         expect(response).to have_http_status(:ok)
         json = JSON.parse(response.body)
         expect(json['token']).to be_present
         expect(json['user']['username']).to eq('admin')
       end
       it "returns a valid JWT token" do
         post '/login', params: { username: 'admin', password: 'admin' }
         
         json = JSON.parse(response.body)
         decoded = JwtService.decode(json['token'])
         
         expect(decoded[:username]).to eq('admin')
       end
       it "includes the username in the response" do
       it "includes the user id and username in the response" do
         post '/login', params: { username: 'admin', password: 'admin' }
         
         json = JSON.parse(response.body)
         expect(json['user']).to be_a(Hash)
         expect(json['user']['id']).to eq(admin_user.id)
         expect(json['user']['username']).to eq('admin')
       end
     end
 Now update the pokemons_spec to work with the new auth that requires user_id in JWT:
 ← Edit backend/spec/requests/pokemons_spec.rb
 require 'rails_helper'
 RSpec.describe "Pokemons", type: :request do
   let(:token) { JwtService.encode({ username: 'admin' }) }
   let!(:user) { User.create!(username: 'admin', password: 'admin') }
   let(:token) { JwtService.encode({ user_id: user.id, username: 'admin' }) }
   let(:headers) { { 'Authorization' => "Bearer #{token}" } }
   describe "GET /pokemons" do
     context "with valid token" do
 ← Edit backend/spec/requests/pokemons_spec.rb
   expect(response).to have_http_status(:unauthorized)
 end
 it "returns unauthorized for expired token" do
   expired_token = JwtService.encode({ username: 'admin' }, 1.second.ago)
   expired_token = JwtService.encode({ user_id: user.id, username: 'admin' }, 1.second.ago)
   get '/pokemons', headers: { 'Authorization' => "Bearer #{expired_token}" }
   
   expect(response).to have_http_status(:unauthorized)
 end
 it "still works when Bearer prefix is missing but token is valid" do
 ```

### Describe how you:
  Validated the AI's suggestions
  Corrected or improved the output, if necessary
  Handled edge cases, authentication, or validations
  Assessed the performance and idiomatic quality of the code  
  - In plan mode I always make the AI not assume anything and ask me questions to improve the plan. By reading the answers and sample code from the plan, its easy to trim most edges on the first implementation.
