# Project Delphi - Server

A secure REST API server for Project Delphi built with Express.js, TypeScript, and PostgreSQL. The server handles authentication using Google OAuth and provides endpoints for managing student and admin roles.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **TypeScript** compiler (`tsx` is included in dev dependencies)

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- **Express** - Web framework
- **PostgreSQL (pg)** - Database driver
- **TypeScript** - Type-safe JavaScript
- **tsx** - TypeScript execution & watch mode for development
- **Google Auth Library** - Google OAuth authentication
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing support
- **JWT** - JSON Web Tokens for authentication

### 2. Configure Environment Variables

Create a `.env` file in the project root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=project_delphi

# Client Configuration
CLIENT_URL=http://localhost:3000

# JWT — REQUIRED. The server will refuse to start if this is not set.
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

Replace the values with your actual configuration:
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Your PostgreSQL credentials
- `JWT_SECRET` - A long, random secret string (required — the server will not start without it)
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID (from Google Cloud Console)

### 3. Set Up the Database

**Create PostgreSQL Database:**

```bash
psql -U postgres -c "CREATE DATABASE project_delphi;"
```

**Run Database Migrations:**

```bash
npm run db:migrate
```

This will execute the SQL migrations from `src/db/migrations/` to set up the necessary tables.

## Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with watch mode enabled via `tsx`. The server will automatically restart when you make changes to the code.

**Output:**
```
Server running on http://localhost:5000
Environment: development
[DB] PostgreSQL connected successfully
[DB] New client connected to PostgreSQL
```

## API Endpoints

### Health Check

Check if the server is running:

```http
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Authentication

#### Google OAuth Login

Authenticate a user using their Google ID token:

```http
POST http://localhost:5000/api/auth/google
Content-Type: application/json

{
  "id_token": "your_google_id_token_here",
  "role": "student"
}
```

**Parameters:**
- `id_token` (string, required) - Google ID token obtained from the Google OAuth flow
- `role` (string, required) - User role (`"student"` or `"admin"`)

**Student Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "roll_number": "F20210001",
    "student_name": "Jane Doe",
    "email": "f20210001@hyderabad.bits-pilani.ac.in",
    "start_year": 2021,
    "end_year": 2025
  }
}
```

**Admin Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "admin_name": "John Smith",
    "email": "training@hyderabad.bits-pilani.ac.in"
  }
}
```

> **Note:** The JWT payload carries `roll_number` as the identity field (`id`) for
> students, and `email` for admins. Internal surrogate keys (`student_id`,
> `admin_id`) are never returned in API responses.

## Obtaining a Google ID Token

To authenticate with the Google OAuth endpoint, you need a valid Google ID token. Follow these steps:

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production frontend URL
7. Copy the **Client ID** (you'll need this for your frontend)

### Step 2: Get the ID Token from the Frontend

In your frontend application (React/Vue/Angular), use the Google Sign-In library:

**Installation:**
```bash
npm install @react-oauth/google  # for React
# or
npm install vue3-google-login    # for Vue
```

**Example with React:**
```jsx
import { GoogleLogin } from '@react-oauth/google';

function LoginComponent() {
  const handleSuccess = (credentialResponse) => {
    const idToken = credentialResponse.credential;
    
    // Send to backend
    fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: idToken,
        role: 'student'
      })
    });
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

### Step 3: Send ID Token to Backend

The frontend sends the ID token to your server's `/api/auth/google` endpoint, which validates it and returns a JWT token for authenticated requests.

## Testing API Requests

### Option 1: Using the REST Client File

A `test.rest` file is included in the project for testing API endpoints using REST Client extensions (VS Code extension: `REST Client` by Huachao Mao).

1. Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VS Code
2. Open `test.rest` file
3. Click "Send Request" button above any request to test it

### Option 2: Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Google OAuth login
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "your_google_id_token_here",
    "role": "student"
  }'
```

### Option 3: Using Postman

1. Open [Postman](https://www.postman.com/)
2. Create a new request
3. Set the method (GET, POST, etc.)
4. Enter the URL (e.g., `http://localhost:5000/api/health`)
5. Add headers and body as needed
6. Click Send

### Option 4: Using Thunder Client

1. Install [Thunder Client](https://www.thunderclient.com/) extension in VS Code
2. Create a new request
3. Enter the URL and method
4. Send the request

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.ts        # PostgreSQL connection pool (10 s timeout)
│   │   └── jwt.ts       # JWT sign/verify (throws if JWT_SECRET missing)
│   ├── controllers/     # Route handlers
│   │   └── authController.ts  # Google OAuth — student & admin login
│   ├── db/              # Database layer
│   │   ├── migrate.ts         # Migration runner
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # authenticate (JWT) + authorize (role guard)
│   │   └── logger.ts    # Request/response logger
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.ts      # POST /api/auth/google
│   │   └── roles/             # Role-specific routes (in progress)
│   │       ├── studentRoutes.ts
│   │       └── adminRoutes.ts
│   ├── types/           # TypeScript interfaces & types
│   │   └── index.ts
│   ├── utils/           # Shared utilities
│   │   └── asyncHandler.ts    # Wraps async handlers, forwards errors to next()
│   └── index.ts         # Server entry point + global error handler
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── test.rest            # REST Client test file (VS Code)
└── README.md            # This file
```

## Troubleshooting

### Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify the database exists: `psql -U postgres -l`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change the PORT in `.env` file
- Or kill the process using port 5000:
  - **Windows:** `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - **macOS/Linux:** `lsof -i :5000` then `kill -9 <PID>`

### Missing Environment Variables

**Error:** `Error: JWT_SECRET environment variable is not set`

**Solution:** Add `JWT_SECRET=your_long_random_secret` to your `.env` file. This variable is required — the server will not start without it.

**Error:** `Error: Cannot read property 'host' of undefined`

**Solution:**
- Ensure `.env` file exists in the project root
- Verify all required variables are set (see Environment Variables Reference)

### TypeScript Compilation Errors

**Solution:**
- Ensure TypeScript is installed: `npm install --save-dev typescript`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Development Workflow

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Make code changes** - The server will auto-reload

3. **Test your changes** using REST Client or Postman

4. **Run database migrations** when schema changes:
   ```bash
   npm run db:migrate
   ```

## Environment Variables Reference

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| PORT | 5000 | No | Server port |
| NODE_ENV | development | No | Environment (development/production) |
| DB_HOST | localhost | Yes | PostgreSQL host |
| DB_PORT | 5432 | No | PostgreSQL port |
| DB_USER | postgres | Yes | PostgreSQL username |
| DB_PASSWORD | - | Yes | PostgreSQL password |
| DB_NAME | project_delphi | Yes | Database name |
| CLIENT_URL | http://localhost:3000 | No | Frontend client URL (for CORS) |
| JWT_SECRET | - | **Yes** | Secret for signing JWTs — server won't start without this |
| JWT_EXPIRES_IN | 7d | No | JWT expiry duration (e.g. `1d`, `7d`, `24h`) |
| GOOGLE_CLIENT_ID | - | Yes | Google OAuth client ID |

