# 🚀 Quick Start - NBL Portal (Full Stack)

Get the entire NBL Party Portal up and running in minutes!

---

## Prerequisites
- Node.js 16+ installed
- npm installed
- Two terminal windows/tabs open

---

## Step 1️⃣: Install Dependencies

### Terminal 1 - Frontend Setup
```bash
cd /Users/ninsiimajohnchris/Desktop/nbl.rough/nbl-portal
npm install
```

### Terminal 2 - Backend Setup
```bash
cd /Users/ninsiimajohnchris/Desktop/nbl.rough/nbl-backend
npm install
```

---

## Step 2️⃣: Start the Backend Server

### Terminal 2 (Backend)
```bash
cd /Users/ninsiimajohnchris/Desktop/nbl.rough/nbl-backend
npm start
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

✅ **Backend is running!**

---

## Step 3️⃣: Start the Frontend Server

### Terminal 1 (Frontend)
```bash
cd /Users/ninsiimajohnchris/Desktop/nbl.rough/nbl-portal
npm run dev
```

You should see:
```
VITE v7.2.4  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

✅ **Frontend is running!**

---

## Step 4️⃣: Open Your Browser

Navigate to:
```
http://localhost:5173
```

You should see the NBL Party Portal with:
- Header with logo
- Hero "PARTY STARTER" section
- Input form (guests, date, duration, delivery)
- Smart Mix results area (3 brand cards)

---

## Step 5️⃣: Test the Application

### Complete Order Flow:

1. **Enter Guest Count**: Use slider or input (try 50)
2. **Pick Event Date**: Select any date
3. **Set Duration**: Set to 4 hours
4. **Enter Delivery Address**: 
   - Type an address (e.g., "Kampala, Uganda")
   - Select from dropdown OR click "Map" to pick location
5. **Check Smart Mix Preview**: Shows crate breakdown
6. **Click "Order" Button**: 
   - Should show success message with Order ID
   - Check backend terminal for logs

---

## Verify Backend Received Order

### Option 1: Check Backend Logs
Look at Terminal 2 (Backend) - should show:
```
✅ [ORDER RECEIVED]
   Order #1000 (ORD-20260211-1000)
   Guest Count: 50
   ...
```

### Option 2: Query Orders via curl
```bash
curl http://localhost:5000/api/orders
```

---

## API Endpoints Quick Reference

| Method | URL | Purpose |
|--------|-----|---------|
| POST | http://localhost:5000/api/orders | Place order |
| GET | http://localhost:5000/api/orders | List all orders |
| GET | http://localhost:5000/api/orders/1000 | Get order #1000 |
| GET | http://localhost:5000/api/products | View menu |
| GET | http://localhost:5000/api/stats | View stats |
| GET | http://localhost:5000/health | Health check |

---

## 🧪 Full Test Scenario

### Test with curl (while frontend & backend are running):

```bash
# Test 1: Create an order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Test 2: View all orders
curl http://localhost:5000/api/orders

# Test 3: Get statistics
curl http://localhost:5000/api/stats

# Test 4: Update order status
curl -X PATCH http://localhost:5000/api/orders/1000 \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## 📱 Mobile Testing

1. Open DevTools (F12)
2. Click device toolbar toggle
3. Select any mobile device (iPhone 12, Pixel 5, etc.)
4. Everything should work perfectly on mobile!

---

## ⚡ Common Issues & Fixes

### Issue: "Connection to NBL Hub failed"
**Fix**: Make sure backend is running in Terminal 2
```bash
cd nbl-backend && npm start
```

### Issue: White blank page
**Fix**: Check that frontend is running in Terminal 1
```bash
cd nbl-portal && npm run dev
```

### Issue: Port 5000 already in use
**Fix**: Kill existing process
```bash
lsof -i :5000
kill -9 <PID>
```

### Issue: Map not loading
**Fix**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🎉 Success Checklist

- [ ] Backend server running on port 5000 ✅
- [ ] Frontend app running on port 5173 ✅
- [ ] Browser shows NBL Party Portal homepage ✅
- [ ] Can enter guest count and see auto-calculation ✅
- [ ] Can pick delivery address from map ✅
- [ ] Can click "Order" and see success message ✅
- [ ] Backend terminal shows order received logs ✅
- [ ] Can query http://localhost:5000/api/orders to see order ✅

---

## 📚 Next Steps

- Read `/nbl-backend/API-TESTING.md` for detailed API examples
- Read `/README.md` for full documentation
- Customize order processing logic as needed
- Integrate with real database
- Add payment processing
- Deploy to production!

---

## 🆘 Need Help?

1. Check `/README.md` - Troubleshooting section
2. Check `/nbl-backend/API-TESTING.md` - API examples
3. Look at browser DevTools Console for errors
4. Check backend terminal for logs

---

**Happy ordering! 🍺**
