# BFF POC

Backend For Frontend (BFF) proof of concept with Auth0 authentication.

## Architecture

```
Angular App (4200) → BFF (3000) → Downstream APIs
                    ↑
Auth Service (3001) → Auth0
```

### Repos

- **auth-service/** - Express app handling Auth0 login/logout/callback
- **bff/** - Express + TypeScript BFF with JWT validation and API proxy
- **angular-app/** - Angular 17 + Material SPA

## Prerequisites

- Node.js 20+
- Auth0 account (tenant, client ID, client secret)
- Docker & Docker Compose (optional)

## Setup

### 1. Auth Service

```bash
cd auth-service
cp .env.example .env
# Edit .env with your Auth0 credentials
npm install
npm run dev
```

### 2. BFF

```bash
cd bff
cp .env.example .env
# Edit .env with your Auth0 domain and audience
npm install
npm run dev
```

### 3. Angular App

```bash
cd angular-app
cp src/environments/environment.ts src/environments/environment.ts
# Edit environment.ts with your Auth0 credentials
npm install
npm start
```

### Docker Compose (all services)

```bash
# Copy .env files first
cp auth-service/.env.example auth-service/.env
cp bff/.env.example bff/.env

# Edit .env files with your Auth0 credentials

docker-compose up --build
```

## Auth0 Configuration

1. Create a Regular Web Application in Auth0
2. Set Allowed Callback URLs: `http://localhost:3001/auth/callback`
3. Set Allowed Logout URLs: `http://localhost:4200`
4. Set Allowed Web Origins: `http://localhost:4200`
5. Copy Domain, Client ID, and Client Secret to `.env` files

## API Endpoints

### Auth Service (3001)

- `GET /auth/login` - Redirect to Auth0 login
- `GET /auth/logout` - Logout and redirect
- `GET /auth/callback` - Auth0 callback
- `GET /auth/me` - Get current user info

### BFF (3000)

- `GET /health` - Health check
- `GET /api/users` - List users (requires JWT)
- `GET /api/users/:id` - Get user by ID (requires JWT)
- `GET /api/users/me` - Get current user from JWT (requires JWT)
- `GET /api/products` - List products (requires JWT)
- `GET /api/products/:id` - Get product by ID (requires JWT)

## Development

### BFF Tests

```bash
cd bff
npm test
```

### TypeScript Check

```bash
cd bff
npm run lint
```
