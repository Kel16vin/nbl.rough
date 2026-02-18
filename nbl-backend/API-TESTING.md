# NBL Backend - API Testing Guide

This guide shows you how to test the NBL Hub backend server using curl or Postman.

## Quick Start

### 1. Start the Server
```bash
cd /Users/ninsiimajohnchris/Desktop/nbl.rough/nbl-backend
node server.js
```

You should see:
```
════════════════════════════════════════════════════════════
🍺 NBL HUB SERVER STARTED
════════════════════════════════════════════════════════════
📍 Server: http://localhost:5000
🏥 Health Check: http://localhost:5000/health
📊 API Docs:
   POST   /api/orders          - Place new order
   GET    /api/orders          - List all orders
   GET    /api/orders/:id      - Get single order
   PATCH  /api/orders/:id      - Update order status
   DELETE /api/orders/:id      - Delete order
   GET    /api/products        - Get menu
   GET    /api/stats           - Get statistics
🌍 Frontend: http://localhost:5173
🔌 CORS enabled for: http://localhost:5173
════════════════════════════════════════════════════════════
```

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "online",
  "service": "NBL Hub",
  "timestamp": "2026-02-11T10:30:45.123Z"
}
```

---

## Endpoints & Examples

### 1. Place Order (POST /api/orders)

**Command:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guests": 50,
    "eventDuration": 4,
    "crates": 9,
    "smartMix": {
      "total": 9,
      "nile": 4,
      "club": 3,
      "castle": 2
    },
    "delivery": {
      "address": "Kampala, Uganda"
    }
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "orderId": 1000,
  "orderNumber": "ORD-20260211-1000",
  "message": "Order #1000 received successfully",
  "estimatedDelivery": "2026-02-13T10:30:45.123Z",
  "totalCost": 705000
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Delivery address is required"
}
```

### 2. Get All Orders (GET /api/orders)

**Command:**
```bash
curl http://localhost:5000/api/orders
```

**Response:**
```json
{
  "success": true,
  "total": 1,
  "orders": [
    {
      "orderId": 1000,
      "orderNumber": "ORD-20260211-1000",
      "guests": 50,
      "eventDuration": 4,
      "crates": 9,
      "smartMix": {
        "total": 9,
        "nile": 4,
        "club": 3,
        "castle": 2
      },
      "totalCost": 705000,
      "delivery": {
        "address": "Kampala, Uganda",
        "coords": null
      },
      "status": "pending",
      "createdAt": "2026-02-11T10:30:45.123Z",
      "estimatedDelivery": "2026-02-13T10:30:45.123Z"
    }
  ]
}
```

### 3. Get Single Order (GET /api/orders/:orderId)

**Command:**
```bash
curl http://localhost:5000/api/orders/1000
```

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": 1000,
    "orderNumber": "ORD-20260211-1000",
    "guests": 50,
    "eventDuration": 4,
    "crates": 9,
    "smartMix": {
      "total": 9,
      "nile": 4,
      "club": 3,
      "castle": 2
    },
    "totalCost": 705000,
    "delivery": {
      "address": "Kampala, Uganda",
      "coords": null
    },
    "status": "pending",
    "createdAt": "2026-02-11T10:30:45.123Z",
    "estimatedDelivery": "2026-02-13T10:30:45.123Z"
  }
}
```

### 4. Update Order Status (PATCH /api/orders/:orderId)

**Command:**
```bash
curl -X PATCH http://localhost:5000/api/orders/1000 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**Valid Statuses:** `pending`, `confirmed`, `dispatched`, `delivered`, `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Order #1000 updated to confirmed",
  "order": {
    "orderId": 1000,
    "status": "confirmed",
    "updatedAt": "2026-02-11T10:35:45.123Z",
    ...
  }
}
```

### 5. Delete Order (DELETE /api/orders/:orderId)

**Command:**
```bash
curl -X DELETE http://localhost:5000/api/orders/1000
```

**Response:**
```json
{
  "success": true,
  "message": "Order #1000 deleted",
  "order": {
    "orderId": 1000,
    ...
  }
}
```

### 6. Get Products/Menu (GET /api/products)

**Command:**
```bash
curl http://localhost:5000/api/products
```

**Response:**
```json
{
  "success": true,
  "products": {
    "Nile Special": {
      "id": 1,
      "price": 75000,
      "category": "Premium Lager"
    },
    "Club": {
      "id": 2,
      "price": 65000,
      "category": "Pilsener"
    },
    "Castle Lite": {
      "id": 3,
      "price": 70000,
      "category": "Premium Lager"
    },
    ...
  }
}
```

### 7. Get Statistics (GET /api/stats)

**Command:**
```bash
curl http://localhost:5000/api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 1,
    "pendingOrders": 1,
    "confirmedOrders": 0,
    "dispatchedOrders": 0,
    "deliveredOrders": 0,
    "totalRevenue": 705000,
    "totalCrates": 9,
    "avgGuestCount": 50,
    "generatedAt": "2026-02-11T10:40:45.123Z"
  }
}
```

---

## Testing with Postman

1. **Import Collection**:
   - File → Import → Paste the following as a collection JSON

2. **Create Request**:
   - Method: POST
   - URL: http://localhost:5000/api/orders
   - Headers: Content-Type: application/json
   - Body (raw JSON):
   ```json
   {
     "guests": 100,
     "eventDuration": 6,
     "crates": 25,
     "smartMix": {
       "total": 25,
       "nile": 10,
       "club": 8,
       "castle": 7
     },
     "delivery": {
       "address": "Entebbe, Uganda"
     }
   }
   ```

---

## Testing End-to-End Flow

### Complete Workflow:

1. **Start Backend**:
   ```bash
   cd nbl-backend && node server.js
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd nbl-portal && npm run dev
   ```

3. **Open Browser**:
   ```
   http://localhost:5173
   ```

4. **Test User Flow**:
   - Enter 50 guests
   - Set 4 hours duration
   - Pick a delivery address
   - Click "Order" button
   - Should see success message with Order ID
   - Check backend terminal for order logs

5. **Verify in Backend**:
   ```bash
   curl http://localhost:5000/api/orders
   ```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| guests | 10-1000 | "Guests must be between 10 and 1000" |
| eventDuration | 1-24 | "Event duration must be between 1 and 24 hours" |
| crates | > 0 | "Crates must be greater than 0" |
| address | Required, non-empty | "Delivery address is required" |
| smartMix | Must be object | "Smart mix breakdown is required" |

---

## Console Output

When an order is successfully placed, you'll see:

```
✅ [ORDER RECEIVED]
   Order #1000 (ORD-20260211-1000)
   Guest Count: 50
   Event Duration: 4 hours
   Total Crates: 9
   Smart Mix: Nile=4, Club=3, Castle=2
   Total Cost: UGX 705,000
   Delivery: Kampala, Uganda
   Timestamp: 2026-02-11T10:30:45.123Z

📬 [NOTIFICATION] Delivery team notified:
   Order #1000 - 50 guests
   Delivery: Kampala, Uganda
   Total: UGX 705,000
```

---

## Database Integration (Future)

Currently, data is stored in memory. To use MongoDB:

```bash
npm install mongoose mongodb
```

Then replace the in-memory arrays with Mongoose schemas in server.js.

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Find process on port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

### CORS Error
Check that frontend URL in server.js matches:
```javascript
origin: 'http://localhost:5173'
```

### Order Not Saving
Check that all required fields are present in request body.

---

**Last Updated:** 11 February 2026
