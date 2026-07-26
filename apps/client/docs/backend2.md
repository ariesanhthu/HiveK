# HiveK Frontend Integration Guide: "Get By Me" Endpoints

This document provides explicit Request and Response details for retrieving the current user's **Enterprise Profiles** ("Get Enterprise By Me") and connected **Social Pages** ("Get Social Pages By Me").

---

## 🌐 Common Specs & Authentication

- **Base URL Prefix**: `/client/v1`
- **Headers Required**:
  - `Authorization: Bearer <accessToken>`
  - `x-api-key: <API_KEY>`
  - `Content-Type: application/json`
- **Response Format**: Wrapped in the standard `ApiResponse` envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": { ... }
  }
  ```

---

## 🏢 1. Get Enterprise By Me

Retrieves all enterprise profiles owned by or accessible to the currently authenticated user (as owner or member).

- **Method & Path**: `GET /client/v1/enterprises/me`
- **Auth Guard**: `JwtAuthGuard`, `RolesGuard` (`@Roles('enterprise')`), `UserVerifiedGuard`

### Query Parameters (Optional)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cursor` | `string` | `null` | Pagination cursor ID for next page |
| `limit` | `number` | `10` | Number of items per page (min 1, max 100) |
| `sort` | `string` | `"desc"` | Sort direction (`"asc"` \| `"desc"`) |
| `companyName`| `string` | - | Filter by company name substring |
| `contactEmail`| `string`| - | Filter by contact email |
| `taxId` | `string` | - | Filter by tax ID |
| `isVerified` | `boolean`| - | Filter by verification status (`true` \| `false`) |

### Example Request

```http
GET /client/v1/enterprises/me?limit=10&sort=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key-header
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "data": [
      {
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
        "knowledgeBase": {
          "rawText": "Enterprise overview document",
          "externalLinks": [
            "https://acme.com/about"
          ],
          "updatedAt": "2026-07-26T11:15:00.000Z"
        },
        "createdAt": "2026-07-26T11:15:00.000Z",
        "updatedAt": "2026-07-26T11:15:00.000Z"
      }
    ],
    "cursor": "66b1e2f3a4c5678901234567",
    "hasNext": false,
    "limit": 10
  },
  "error": null,
  "meta": null
}
```

---

## 📱 2. Get Social Pages By Me

Retrieves all social pages (Facebook Pages, Threads accounts, Instagram profiles) connected to the current user's active Enterprise profile.

> **Note**: The backend automatically resolves the `enterpriseId` associated with the authenticated user's `userId`.

- **Method & Path**: `GET /client/v1/social-pages`
- **Auth Guard**: `JwtAuthGuard`, `RolesGuard` (`@Roles('enterprise')`), `UserVerifiedGuard`

### Example Request

```http
GET /client/v1/social-pages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-api-key: your-api-key-header
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "66c9a812b3d4567890123401",
      "enterpriseId": "66b1e2f3a4c5678901234567",
      "platformId": "66a000000000000000000001",
      "platformCode": "facebook",
      "pageId": "1029384756",
      "pageName": "Acme Official Facebook Page",
      "pictureUrl": "https://graph.facebook.com/1029384756/picture",
      "followerCount": 15400,
      "webhookVerifyToken": "wh_sec_a1b2c3d4e5f6",
      "isActive": true,
      "createdAt": "2026-07-26T11:20:00.000Z",
      "updatedAt": "2026-07-26T11:20:00.000Z"
    },
    {
      "id": "66c9a812b3d4567890123402",
      "enterpriseId": "66b1e2f3a4c5678901234567",
      "platformId": "66a000000000000000000002",
      "platformCode": "threads",
      "pageId": "9876543210",
      "pageName": "acme_threads_account",
      "pictureUrl": null,
      "followerCount": 3200,
      "webhookVerifyToken": "wh_sec_9z8y7x6w5v4u",
      "isActive": true,
      "createdAt": "2026-07-26T11:22:00.000Z",
      "updatedAt": "2026-07-26T11:22:00.000Z"
    }
  ],
  "error": null,
  "meta": null
}
```

---

## ⚡ Error Scenarios

### 1. User has no Enterprise profile yet (for `GET /client/v1/social-pages`)
If a user calls `GET /client/v1/social-pages` before creating an enterprise profile:

**HTTP Status**: `403 Forbidden`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "User is not associated with any enterprise profile.",
    "details": undefined
  },
  "meta": null
}
```

### 2. Missing or Expired Auth Token
**HTTP Status**: `401 Unauthorized`
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access",
    "details": undefined
  },
  "meta": null
}
```
