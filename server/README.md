# Project Delphi - Server

A secure REST API server for Project Delphi built with Express.js, TypeScript, and PostgreSQL. The server handles authentication using Google OAuth and provides endpoints for managing student and admin roles.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **TypeScript** compiler (`ts-node` is included in dev dependencies)

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- **Express** - Web framework
- **PostgreSQL (pg)** - Database driver
- **TypeScript** - Type-safe JavaScript
- **Nodemon** - Auto-reload during development
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

# Google OAuth (Optional - for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
```

Replace the values with your actual configuration:
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Your PostgreSQL credentials
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

This starts the server with hot-reload enabled via Nodemon. The server will automatically restart when you make changes to the code.

**Output:**
```
Server is running on http://localhost:5000
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

**Response:**
```json
{
  "success": true,
  "message": "User authenticated successfully",
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student"
  },
  "token": "jwt_token_here"
}
```

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
│   ├── config/          # Configuration files (database, JWT, etc.)
│   │   ├── db.ts        # PostgreSQL connection pool setup
│   │   └── jwt.ts       # JWT configuration
│   ├── controllers/      # Business logic for routes
│   │   └── authController.ts
│   ├── db/              # Database migrations
│   │   ├── migrate.ts   # Migration runner
│   │   └── migrations/  # SQL migration files
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication middleware
│   │   └── logger.ts    # Request/response logger
│   ├── routes/          # API route definitions
│   │   ├── authRoutes.ts
│   │   └── roles/       # Role-based routes
│   │       ├── studentRoutes.ts
│   │       └── adminRoutes.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts         # Server entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── test.rest            # REST client test file
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

**Error:** `Error: Cannot read property 'host' of undefined`

**Solution:**
- Ensure `.env` file exists in the project root
- Verify all required variables are set

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

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment (development/production) |
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USER | postgres | PostgreSQL username |
| DB_PASSWORD | - | PostgreSQL password |
| DB_NAME | project_delphi | Database name |
| CLIENT_URL | http://localhost:3000 | Frontend client URL (for CORS) |
| GOOGLE_CLIENT_ID | - | Google OAuth client ID |

## Security Features

- **Helmet** - Sets secure HTTP headers
- **CORS** - Configured for specific origins
- **JWT** - Secure token-based authentication
- **Google OAuth** - Secure third-party authentication
- **Input Validation** - Uses express-validator
- **Request Logging** - All requests are logged for debugging

## Next Steps

- Implement student routes (currently commented in `index.ts`)
- Implement admin routes
- Add more comprehensive error handling
- Set up unit tests
- Deploy to production server

## Support

For issues or questions, please check the project's issue tracker or contact the development team.
