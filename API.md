# API Documentation

## Authentication

All API routes (except `/api/auth/*` and `/api/register`) require authentication via session cookie.

## Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/[...nextauth]` | NextAuth.js handlers | No |
| POST | `/api/register` | User registration | No |

### Dashboard & Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard` | Dashboard statistics | Yes |
| GET | `/api/stats` | System statistics | Yes |
| GET | `/api/health` | Health check | Yes |

### Inventory (Non-Consumable)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/inventory` | List inventory items | Yes | All |
| POST | `/api/inventory` | Create inventory item | Yes | Admin, Moderator |
| GET | `/api/inventory/:id` | Get item details | Yes | All |
| PATCH | `/api/inventory/:id` | Update item | Yes | Admin, Moderator |
| DELETE | `/api/inventory/:id` | Delete item | Yes | Admin |

### Consumables
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/consumables` | List consumables | Yes | All |
| POST | `/api/consumables` | Create consumable | Yes | Admin, Moderator |
| GET | `/api/consumables/:id` | Get consumable details | Yes | All |
| PATCH | `/api/consumables/:id` | Update consumable | Yes | Admin, Moderator |
| DELETE | `/api/consumables/:id` | Delete consumable | Yes | Admin |

### Stock Movements
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/stock-movements` | List movements | Yes | All |
| POST | `/api/stock-movements` | Record movement | Yes | Admin, Moderator |

### Requests
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/requests` | List requests | Yes | All |
| POST | `/api/requests` | Create request | Yes | All |
| PATCH | `/api/requests` | Approve/Reject | Yes | Admin, Moderator |
| GET | `/api/requests/:id` | Get request details | Yes | All |

### Users
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/users` | List users | Yes | Admin |
| POST | `/api/users` | Create user | Yes | Admin |
| PATCH | `/api/users` | Update user | Yes | Admin |

### Departments
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/departments` | List departments | Yes | All |
| POST | `/api/departments` | Create department | Yes | Admin |
| PATCH | `/api/departments/:id` | Update department | Yes | Admin |

### Reports
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/reports` | Generate reports | Yes | Admin, Moderator |

Query Parameters:
- `type`: inventory, consumables, requests, low-stock, expiry
- `startDate`: ISO date string
- `endDate`: ISO date string
- `departmentId`: Department ID

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | List notifications | Yes |
| PATCH | `/api/notifications` | Mark as read | Yes |

### Audit Logs
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/audit-logs` | List audit logs | Yes | Admin |

### Settings
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/settings` | Get settings | Yes | Admin |
| PATCH | `/api/settings` | Update settings | Yes | Admin |

### Upload
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/upload` | Upload files | Yes | Admin, Moderator |

### Search
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/search?q=query` | Global search | Yes |

## Response Format

### Success Response
```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Search & Filter
- `search`: Search query string
- `status`: Filter by status
- `category`: Filter by category
- `departmentId`: Filter by department

### Date Range
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)
