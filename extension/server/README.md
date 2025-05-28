# Cookie Extractor Server

Express.js server that receives cookies from the Chrome extension using JWT authentication.

## Features

- JWT authentication
- API endpoint to receive cookies
- Detailed logging of received cookies

## Installation

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the server:
   ```
   npm start
   ```
   
   Or for development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

**POST /api/login**

Authenticates with the server and returns a JWT token.

Request body:
```json
{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "your-jwt-token"
}
```

### Submit Cookies

**POST /api/cookies**

Submits cookies to the server. Requires JWT authentication.

Headers:
```
Authorization: Bearer your-jwt-token
```

Request body:
```json
{
  "cookies": [
    { 
      "name": "cookie1", 
      "value": "value1", 
      "domain": "localhost",
      "path": "/",
      "secure": false,
      "httpOnly": false
    }
  ],
  "url": "http://localhost:3000"
}
```

Response:
```json
{
  "success": true,
  "message": "Received 1 cookies successfully"
}
```

## Security Notice

This is a development server intended for local testing. For production use, you should:

1. Use a more secure authentication method
2. Store credentials securely (not hardcoded)
3. Use HTTPS
4. Implement proper validation and sanitization
5. Set appropriate CORS settings 