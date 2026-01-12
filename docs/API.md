# API Documentation - Smart Food Supply Chain

Base URL: `http://localhost:8000/api/v1` (development)

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login to the system.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@smartfood.local",
    "role": "super_admin",
    "school_id": null,
    "vendor_id": null
  }
}
```

#### POST /auth/register
Register new user (requires admin authentication).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "vendor1",
  "email": "vendor@example.com",
  "password": "password123",
  "role": "vendor",
  "vendor_id": 1,
  "school_id": null
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

### Documents (DDT/Invoices)

#### POST /documents
Upload a new DDT/Invoice document.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `ddt_number` (string, required)
- `school_id` (integer, required)
- `vendor_id` (integer, required)
- `document_date` (date, required, format: YYYY-MM-DD)
- `products` (JSON array, required)
- `document_photo` (file, required, JPEG/PNG, max 10MB)
- `document_pdf` (file, optional, PDF, max 25MB)

**Response:**
```json
{
  "success": true,
  "id": 123,
  "hash": "a1b2c3d4e5f6...",
  "status": "verified",
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### GET /documents
Get all documents for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "ddt_number": "DDT001",
      "school_name": "Scuola Primaria Milano Centro",
      "vendor_name": "BioFood Italia S.r.l.",
      "document_date": "2025-01-15",
      "products": "[{\"name\":\"Tomatoes\",\"quantity\":\"50\",\"unit\":\"kg\"}]",
      "status": "verified",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /documents/{id}
Get a specific document by ID.

**Headers:** `Authorization: Bearer <token>`

### Menus

#### POST /menus
Create a new menu.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request:**
```json
{
  "school_id": 1,
  "menu_date": "2025-01-20",
  "menu_type": "daily",
  "items": [
    {
      "name": "Pasta al Pomodoro",
      "ingredients": [
        {
          "name": "Pasta",
          "document_ids": [1]
        },
        {
          "name": "Tomatoes",
          "document_ids": [1, 2]
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "menu_id": 456,
  "status": "draft",
  "message": "Menu created successfully"
}
```

#### GET /menus
Get all menus for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

#### GET /menus/{id}
Get a specific menu by ID (public access for published menus).

#### POST /menus/{id}/publish
Publish a menu (validates DDT coverage and generates QR code).

**Headers:** `Authorization: Bearer <token>`

**Response (Success):**
```json
{
  "success": true,
  "menu_id": 456,
  "menu_hash": "x9y8z7w6v5...",
  "qr_code_url": "http://localhost:8000/qr-codes/menu_456_x9y8z7w6.png",
  "verification_url": "http://localhost:3000/verify/menu/456",
  "published_at": "2025-01-15T11:00:00Z"
}
```

**Response (Error - Incomplete DDT Coverage):**
```json
{
  "error": "incomplete_ddt_coverage",
  "message": "Menu has incomplete DDT coverage",
  "missing": [
    {
      "item": "Pasta al Pomodoro",
      "ingredient": "Tomatoes",
      "message": "No DDT linked"
    }
  ]
}
```

### Verification (Public)

#### GET /verify/menu/{id}
Verify a menu (public, no authentication required).

**Response:**
```json
{
  "success": true,
  "menu": {
    "id": 456,
    "menu_date": "2025-01-20",
    "menu_type": "daily",
    "items": [...],
    "published_at": "2025-01-15T11:00:00Z",
    "qr_code_url": "..."
  },
  "school": {
    "name": "Scuola Primaria Milano Centro",
    "address": "Via Roma 123, 20100 Milano",
    "region": "Lombardia"
  },
  "documents": [
    {
      "id": 1,
      "ddt_number": "DDT001",
      "vendor_name": "BioFood Italia S.r.l.",
      "document_date": "2025-01-15",
      "document_hash": "a1b2c3...",
      "public_chain_anchored_at": "2025-01-16T02:00:00Z"
    }
  ],
  "verification": {
    "verified": true,
    "private_chain": true,
    "public_chain": true,
    "hash": "x9y8z7...",
    "tx_hash": "0xabc123...",
    "verification_count": 5
  }
}
```

#### GET /verify/hash/{hash}
Verify a specific hash (public, no authentication required).

**Response:**
```json
{
  "success": true,
  "hash": "a1b2c3d4e5f6...",
  "exists": true,
  "type": "document",
  "private_chain_timestamp": "2025-01-15T10:30:00Z",
  "public_chain_tx": "0xabc123...",
  "public_chain_block": 12345678,
  "public_chain_anchored_at": "2025-01-16T02:00:00Z",
  "verification_count": 3
}
```

### Schools

#### GET /schools
Get all schools (filtered by user role).

**Headers:** `Authorization: Bearer <token>`

#### GET /schools/{id}
Get a specific school by ID.

**Headers:** `Authorization: Bearer <token>`

### Vendors

#### GET /vendors
Get all vendors (filtered by user role).

**Headers:** `Authorization: Bearer <token>`

#### GET /vendors/{id}
Get a specific vendor by ID.

**Headers:** `Authorization: Bearer <token>`

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Missing field: ddt_number"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred"
}
```

## Rate Limiting

No rate limiting is currently implemented. For production, consider implementing rate limiting to prevent abuse.

## Pagination

Currently, all list endpoints return all results. For production with large datasets, implement pagination using `page` and `per_page` query parameters.
