# HiveK Frontend Integration Guide (MVP)

This document provides complete details for Frontend (FE) integration with the **HiveK Server API** for the core MVP user flow:
1. **Authentication (Local Credentials)**: Sign Up, Sign In, Profile, Token Refresh, Sign Out.
2. **Enterprise Profile Management**: Create Enterprise.
3. **Social Page Linking**: Facebook and Threads OAuth flow & management.

---

## 🌐 Common API Specifications

- **Base URL**: `https://<your-backend-domain>` (or `http://localhost:3000` for local dev)
- **API Version Prefix**: `/client/v1`
- **Global Headers**:
  - `Content-Type: application/json`
  - `x-api-key`: Required for all client endpoints (e.g. `your-api-key-header`)
- **Authentication**:
  - Standard Bearer token header: `Authorization: Bearer <accessToken>`
  - Automatic HttpOnly cookies (`access_token`, `refresh_token`) are also set upon Sign In.

---

## 📦 Standard Response Envelopes

### Success Envelope
All successful HTTP responses wrap the payload in this JSON structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": null
}
```

### Error Envelope
All error responses (Validation, Auth, Business Domain, 4xx/5xx) follow this structure:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BAD_REQUEST", 
    "message": "Error description message",
    "details": [
      {
        "field": "email",
        "message": "email must be a valid email address"
      }
    ]
  },
  "meta": null
}
```
> Common Error Codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `DOMAIN_ERROR`, `INTERNAL_ERROR`.

---

## 🔑 1. Authentication Flow (Local Credentials)

### 1.1. Sign Up (Enterprise Role)
Create a new user account with local email and password for the **Enterprise** portal.

- **Method & Path**: `POST /client/v1/auth/sign-up/enterprise`
- **Auth**: Public (`x-api-key` required)
- **Rate Limit**: 5 requests / 60 seconds

#### Request Headers
```http
Content-Type: application/json
x-api-key: <API_KEY>
```

#### Request Body
```json
{
  "email": "business@acme.com",
  "password": "SecurePassword123!",
  "fullName": "Acme Admin",
  "phone": "+84901234567"
}
```
*Note: `phone` and `fullName` are optional.*

#### Response (200 OK / 201 Created)
```json
{
  "success": true,
  "data": {
    "userId": "66a3d8f1e4b0123456789abc"
  },
  "error": null,
  "meta": null
}
```

---

### 1.2. Sign In
Authenticate using local credentials and receive access and refresh tokens.

- **Method & Path**: `POST /client/v1/auth/sign-in`
- **Auth**: Public (`x-api-key` required)
- **Rate Limit**: 5 requests / 60 seconds

#### Request Body
```json
{
  "email": "business@acme.com",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
Sets HttpOnly cookies `access_token` (1 day) and `refresh_token` (7 days).
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null,
  "meta": null
}
```

---

### 1.3. Get Current Profile
Fetch the current logged-in user details.

- **Method & Path**: `GET /client/v1/auth/profile`
- **Auth**: Bearer Token required

#### Request Headers
```http
Authorization: Bearer <accessToken>
x-api-key: <API_KEY>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "66a3d8f1e4b0123456789abc",
    "email": "business@acme.com",
    "fullName": "Acme Admin",
    "phone": "+84901234567",
    "role": "enterprise",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": false
  },
  "error": null,
  "meta": null
}
```

---

### 1.4. Refresh Token
Issue new access & refresh tokens when the access token expires.

- **Method & Path**: `POST /client/v1/auth/refresh-token`
- **Auth**: Public (Uses `refreshToken` from Cookie or Body)

#### Request Body (Optional if `refresh_token` cookie is present)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "error": null,
  "meta": null
}
```

---

### 1.5. Sign Out
Invalidates current session and clears auth cookies.

- **Method & Path**: `POST /client/v1/auth/sign-out`
- **Auth**: Bearer Token required

#### Response (204 No Content)
Empty body (Cookies `access_token` and `refresh_token` cleared).

---

## 🏢 2. Enterprise Profile Creation

After signing up as an Enterprise user, the user must create their **Enterprise Profile**.

- **Method & Path**: `POST /client/v1/enterprises`
- **Auth**: Bearer Token required (`role = enterprise`, verified user)

#### Request Headers
```http
Authorization: Bearer <accessToken>
x-api-key: <API_KEY>
Content-Type: application/json
```

#### Request Body
```json
{
  "companyName": "Acme Corporation",
  "description": "Leading digital & influencer marketing enterprise.",
  "contactEmail": "contact@acme.com",
  "contactPhone": "+84901234567",
  "website": "https://acme.com",
  "taxId": "0109998887"
}
```
- `companyName`: string (min 1, max 200) **[Required]**
- `description`: string (max 2000) **[Required]**
- `contactEmail`: email **[Required]**
- `contactPhone`: string **[Required]**
- `website`: URL string or null **[Optional]**
- `taxId`: string or null **[Optional]**

#### Response (200 OK / 201 Created)
```json
{
  "success": true,
  "data": {
    "id": "66b1e2f3a4c5678901234567",
    "userId": "66a3d8f1e4b0123456789abc",
    "companyName": "Acme Corporation",
    "description": "Leading digital & influencer marketing enterprise.",
    "contactEmail": "contact@acme.com",
    "contactPhone": "+84901234567",
    "website": "https://acme.com",
    "taxId": "0109998887",
    "logoUrlId": null,
    "isVerified": false,
    "members": [
      {
        "userId": "66a3d8f1e4b0123456789abc",
        "mode": "owner"
      }
    ],
    "createdAt": "2026-07-26T11:15:00.000Z",
    "updatedAt": "2026-07-26T11:15:00.000Z"
  },
  "error": null,
  "meta": null
}
```

---

## 🔗 3. Social Pages Linking (Facebook & Threads)

Enterprise accounts link their social pages/accounts to manage campaigns and automations.

> **Prerequisite**: The logged-in user must have an active Enterprise Profile linked to their user account.

---

### 3.1. Link Facebook Pages (OAuth Workflow)

Connecting Facebook pages uses a **backend-assisted OAuth redirect flow**:

```
[ FE App ]  --->  1. GET /social-pages/facebook/oauth  --->  Returns { url }
[ FE App ]  --->  2. Redirect Browser to Facebook URL
[ User ]    --->  3. Grants Permissions on Facebook
[ FB ]      --->  4. Redirects to Backend Callback: GET /social-pages/facebook/callback?code=...
[ Backend ] --->  5. Exchanges tokens, bulk connects FB pages to Enterprise, redirects to FE REDIRECT_ENDPOINT
```

#### Step 1: Request Facebook OAuth URL
Get the authorization URL containing a secure signed state parameter.

- **Method & Path**: `GET /client/v1/social-pages/facebook/oauth`
- **Auth**: Bearer Token required (`role = enterprise`)

##### Request Headers
```http
Authorization: Bearer <accessToken>
x-api-key: <API_KEY>
```

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "url": "https://www.facebook.com/v19.0/dialog/oauth?client_id=179229...&redirect_uri=https%3A%2F%2Fhivek-main-backend-54ef5f252bc1.herokuapp.com%2Fclient%2Fv1%2Fsocial-pages%2Ffacebook%2Fcallback&scope=pages_show_list%2Cpages_read_engagement...&state=eyJhbGci..."
  },
  "error": null,
  "meta": null
}
```

##### FE Implementation Step:
Window redirect to the returned `url`:
```javascript
window.location.href = response.data.url;
```

#### Step 2: Handle OAuth Redirect Callback (Frontend Side)
Once Facebook authorization completes, the backend callback processes the token exchange and bulk-connects Facebook pages to the Enterprise. Then the backend redirects back to the configured Frontend URL (`REDIRECT_ENDPOINT`).

The frontend handles incoming URL search params:
- **Success Redirect**: `https://<fe-app-url>?success=true`
- **Failure Redirect**: `https://<fe-app-url>?success=false&error=ErrorMessage`

---

### 3.2. Link Threads Account (OAuth Workflow)

Linking Threads accounts follows the standard OAuth 2.0 PKCE / Authorization Code flow.

#### Step 1: Request Threads OAuth URL
- **Method & Path**: `GET /client/v1/social-pages/threads/oauth`
- **Auth**: Bearer Token required (`role = enterprise`)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "url": "https://threads.net/oauth/authorize?client_id=179229...&redirect_uri=https%3A%2F%2Fwebhook.gnourt.me%2Fhivek%2Fclient%2Fv1%2Fsocial-pages%2Fthreads%2Fcallback&response_type=code&scope=threads_basic%2Cthreads_content_publish&state=eyJhbG..."
  },
  "error": null,
  "meta": null
}
```

##### FE Implementation Step:
Redirect browser to `response.data.url`.

#### Step 2: Handle OAuth Redirect Callback
Upon authorization, backend exchanges code for long-lived Threads access token, links the account to the Enterprise profile, and redirects to frontend:
- **Success**: `https://<fe-app-url>?success=true`
- **Failure**: `https://<fe-app-url>?success=false&error=ErrorMessage`

---

### 3.3. Get All Connected Social Pages
Fetch all connected social pages/accounts (Facebook, Threads, etc.) for the current Enterprise.

- **Method & Path**: `GET /client/v1/social-pages`
- **Auth**: Bearer Token required (`role = enterprise`)

#### Request Headers
```http
Authorization: Bearer <accessToken>
x-api-key: <API_KEY>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "66c9a812b3d4567890123401",
      "enterpriseId": "66b1e2f3a4c5678901234567",
      "platformCode": "facebook",
      "pageId": "1029384756",
      "name": "Acme Official Page",
      "username": "acmeofficial",
      "avatarUrl": "https://graph.facebook.com/1029384756/picture",
      "status": "connected",
      "connectedAt": "2026-07-26T11:20:00.000Z"
    },
    {
      "id": "66c9a812b3d4567890123402",
      "enterpriseId": "66b1e2f3a4c5678901234567",
      "platformCode": "threads",
      "pageId": "9876543210",
      "name": "acme_threads",
      "username": "acme_threads",
      "avatarUrl": null,
      "status": "connected",
      "connectedAt": "2026-07-26T11:22:00.000Z"
    }
  ],
  "error": null,
  "meta": null
}
```

---

### 3.4. Disconnect a Social Page
Disconnect/remove a social page from the Enterprise.

- **Method & Path**: `DELETE /client/v1/social-pages/:id`
- **Auth**: Bearer Token required (`role = enterprise`)

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "error": null,
  "meta": null
}
```

---

## ⚡ Quick End-to-End FE Integration Flow Summary

1. **Sign Up**: `POST /client/v1/auth/sign-up/enterprise` -> receives `userId`.
2. **Sign In**: `POST /client/v1/auth/sign-in` -> receives `accessToken` & stores cookies.
3. **Create Enterprise**: `POST /client/v1/enterprises` with `Authorization: Bearer <accessToken>` -> creates Enterprise profile.
4. **Link Facebook**:
   - `GET /client/v1/social-pages/facebook/oauth` -> navigate to `data.url`.
   - On callback return, check URL query param `?success=true`.
5. **Link Threads**:
   - `GET /client/v1/social-pages/threads/oauth` -> navigate to `data.url`.
   - On callback return, check URL query param `?success=true`.
6. **Fetch Connected Pages**: `GET /client/v1/social-pages` -> render list of connected Facebook & Threads pages.
