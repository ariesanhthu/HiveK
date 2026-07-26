# HiveK Frontend Integration Guide: Client Platforms API

This document provides explicit Request and Response details for integrating the **Client Platforms API** (`/client/v1/platforms`) in the HiveK application.

---

## 🌐 Common Specifications

- **Base URL Prefix**: `/client/v1/platforms`
- **Authentication**: **Public Endpoint** (`@Public()`), does not require a user session token.
- **Headers Required**:
  - `x-api-key: <API_KEY>` (Global API security key)
  - `Content-Type: application/json`
- **Response Format**: Standard `ApiResponse` envelope format:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": null
  }
  ```

---

## 📋 1. Get List of Platforms

Retrieves a paginated list of social platforms supported by the HiveK system (e.g. Facebook, Threads, Instagram, TikTok, YouTube).

- **Method & Path**: `GET /client/v1/platforms`
- **Auth**: Public (`x-api-key` required)

### Query Parameters (Optional Filters & Pagination)

| Parameter | Type | Default | Enum / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `cursor` | `string` | `null` | - | Cursor ID for pagination |
| `limit` | `number` | `10` | Min `1`, Max `100` | Number of platforms per page |
| `sort` | `string` | `"desc"` | `"asc"` \| `"desc"` | Sorting order |
| `name` | `string` | - | - | Filter platforms by name (case-insensitive substring) |
| `apiStatus`| `string` | - | `"stable"` \| `"maintenance"` \| `"deprecated"` | Filter by platform API operational status |

---

### Example Request

```http
GET /client/v1/platforms?limit=10&sort=desc&apiStatus=stable
x-api-key: your-api-key-header
```

---

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "66a000000000000000000001",
        "name": "Facebook",
        "baseUrl": "https://facebook.com",
        "apiStatus": "stable",
        "icon": {
          "id": "66a111111111111111111111",
          "url": "https://res.cloudinary.com/hivek/image/upload/v12345/facebook_icon.png",
          "publicId": "hivek/platforms/facebook_icon",
          "size": 12450,
          "format": "png",
          "title": "Facebook Icon",
          "targetType": "platform",
          "targetId": "66a000000000000000000001",
          "targetField": "icon",
          "createdAt": "2026-07-26T00:00:00.000Z",
          "updatedAt": "2026-07-26T00:00:00.000Z"
        }
      },
      {
        "id": "66a000000000000000000002",
        "name": "Threads",
        "baseUrl": "https://threads.net",
        "apiStatus": "stable",
        "icon": {
          "id": "66a111111111111111111112",
          "url": "https://res.cloudinary.com/hivek/image/upload/v12345/threads_icon.png",
          "publicId": "hivek/platforms/threads_icon",
          "size": 10890,
          "format": "png",
          "title": "Threads Icon",
          "targetType": "platform",
          "targetId": "66a000000000000000000002",
          "targetField": "icon",
          "createdAt": "2026-07-26T00:00:00.000Z",
          "updatedAt": "2026-07-26T00:00:00.000Z"
        }
      }
    ],
    "cursor": "66a000000000000000000002",
    "hasNext": false,
    "limit": 10
  },
  "error": null,
  "meta": null
}
```

---

## 🔍 2. Get Platform by ID

Fetch details of a single platform by its unique ID.

- **Method & Path**: `GET /client/v1/platforms/:id`
- **Auth**: Public (`x-api-key` required)

### Path Parameters
- `id` (string, required): The MongoDB ObjectId of the target platform.

### Example Request

```http
GET /client/v1/platforms/66a000000000000000000001
x-api-key: your-api-key-header
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "66a000000000000000000001",
    "name": "Facebook",
    "baseUrl": "https://facebook.com",
    "apiStatus": "stable",
    "icon": {
      "id": "66a111111111111111111111",
      "url": "https://res.cloudinary.com/hivek/image/upload/v12345/facebook_icon.png",
      "publicId": "hivek/platforms/facebook_icon",
      "size": 12450,
      "format": "png",
      "title": "Facebook Icon",
      "targetType": "platform",
      "targetId": "66a000000000000000000001",
      "targetField": "icon",
      "createdAt": "2026-07-26T00:00:00.000Z",
      "updatedAt": "2026-07-26T00:00:00.000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

## ⚡ Error Responses

### 1. Platform Not Found (`404 Not Found`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Platform with ID 66a000000000000000000099 not found",
    "details": undefined
  },
  "meta": null
}
```

### 2. Invalid Filter Parameters (`400 Bad Request`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "message": "apiStatus must be one of: stable, maintenance, deprecated",
    "details": [
      {
        "field": "apiStatus",
        "message": "Invalid enum value"
      }
    ]
  },
  "meta": null
}
```
