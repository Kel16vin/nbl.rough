import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================================================
// IN-MEMORY DATA STORE (Replace with database later)
// ============================================================================
let orders = [];
let orderIdCounter = 1000;

// NBL Beer Products Database
const PRODUCTS = {
  'Nile Special': { id: 1, price: 75000, category: 'Premium Lager' },
  'Club': { id: 2, price: 65000, category: 'Pilsener' },
  'Castle Lite': { id: 3, price: 70000, category: 'Premium Lager' },
  'Eagle Lager': { id: 4, price: 60000, category: 'Lager' },
  'Extra Lager': { id: 5, price: 55000, category: 'Lager' },
  'Redd\'s': { id: 6, price: 80000, category: 'Premium' },
  'Happos': { id: 7, price: 50000, category: 'Budget' },
  'Nile Gold': { id: 8, price: 75000, category: 'Premium Lager' }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate order data
 * @param {Object} data - Order data from frontend
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateOrder(data) {
  // Check required fields
  if (!data.guests || data.guests < 10 || data.guests > 1000) {
    return { valid: false, error: 'Guests must be between 10 and 1000' };
  }

  if (!data.eventDuration || data.eventDuration < 1 || data.eventDuration > 24) {
    return { valid: false, error: 'Event duration must be between 1 and 24 hours' };
  }

  if (!data.crates || data.crates < 1) {
    return { valid: false, error: 'Crates must be greater than 0' };
  }

  if (!data.delivery || !data.delivery.address || data.delivery.address.trim() === '') {
    return { valid: false, error: 'Delivery address is required' };
  }

  if (!data.smartMix || typeof data.smartMix !== 'object') {
    return { valid: false, error: 'Smart mix breakdown is required' };
  }

  return { valid: true };
}

/**
 * Calculate order total cost
 * @param {Object} smartMix - Smart mix breakdown { nile, club, castle }
 * @returns {number} - Total cost in UGX
 */
function calculateOrderTotal(smartMix) {
  let total = 0;
  
  if (smartMix.nile) {
    total += smartMix.nile * PRODUCTS['Nile Special'].price;
  }
  if (smartMix.club) {
    total += smartMix.club * PRODUCTS['Club'].price;
  }
  if (smartMix.castle) {
    total += smartMix.castle * PRODUCTS['Castle Lite'].price;
  }

  return total;
}

/**
 * Generate unique order number
 * @returns {string} - Order number (e.g., "ORD-20260211-1001")
 */
function generateOrderNumber() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `ORD-${date}-${orderIdCounter}`;
}

/**
 * Send notification (placeholder for future integration)
 * @param {Object} order - Order object
 */
function notifyDeliveryTeam(order) {
  console.log('📬 [NOTIFICATION] Delivery team notified:');
  console.log(`   Order #${order.orderId} - ${order.guests} guests`);
  console.log(`   Delivery: ${order.delivery.address}`);
  console.log(`   Total: UGX ${order.totalCost.toLocaleString()}`);
  
  // Future: Send SMS, email, or push notification
  // TODO: Integrate SMS gateway (AfricastalLink, Africloud, etc.)
  // TODO: Send email to delivery@nbl.co.ug
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health Check
 * GET /health
 * Returns: { status: 'online' }
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'NBL Hub',
    timestamp: new Date().toISOString()
  });
});

/**
 * Place Order
 * POST /api/orders
 * 
 * Request body:
 * {
 *   guests: number,
 *   eventDuration: number,
 *   crates: number,
 *   smartMix: { total, nile, club, castle },
 *   delivery: { address: string }
 * }
 */
app.post('/api/orders', (req, res) => {
  try {
    const data = req.body;

    console.log('\n📥 [INCOMING DATA]');
    console.log(JSON.stringify(data, null, 2));

    // Map new frontend format to backend format
    const mappedData = {
      guests: data.guests,
      eventDuration: data.eventDuration,
      crates: data.totalCrates,
      smartMix: data.breakdown,
      delivery: { address: data.location },
      timestamp: data.timestamp
    };

    console.log('\n📝 [MAPPED DATA]');
    console.log(JSON.stringify(mappedData, null, 2));

    // Validate order
    const validation = validateOrder(mappedData);
    if (!validation.valid) {
      console.log('\n❌ [VALIDATION FAILED]:', validation.error);
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Create order object
    const orderId = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = generateOrderNumber();
    const totalCost = calculateOrderTotal(mappedData.smartMix || data.breakdown);
    const estimatedDelivery = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const order = {
      orderId,
      orderNumber,
      guests: mappedData.guests,
      eventDuration: mappedData.eventDuration,
      crates: mappedData.crates,
      smartMix: mappedData.smartMix || data.breakdown,
      totalCost,
      delivery: mappedData.delivery,
      status: 'pending',
      estimatedDelivery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`\n==========================================`);
    console.log(`🍺 NEW NBL ORDER RECEIVED | ID: #${orderId}`);
    console.log(`------------------------------------------`);
    console.log(`📍 VENUE: ${data.location || 'Not Specified'}`);
    console.log(`👥 GUESTS: ${mappedData.guests} | ⏱️ HOURS: ${mappedData.eventDuration}`);
    console.log(`📦 TOTAL CRATES: ${mappedData.crates}`);
    console.log(`📝 MIX: ${JSON.stringify(mappedData.smartMix || data.breakdown)}`);
    console.log(`💰 TOTAL COST: UGX ${totalCost.toLocaleString()}`);
    console.log(`==========================================\n`);

    // Store order
    orders.push(order);
    orderIdCounter++;

    // Log order
    console.log('\n✅ [ORDER RECEIVED]');
    console.log(`   Order #${order.orderId} (${order.orderNumber})`);
    console.log(`   Guest Count: ${order.guests}`);
    console.log(`   Event Duration: ${order.eventDuration} hours`);
    console.log(`   Total Crates: ${order.crates}`);
    console.log(`   Breakdown: ${JSON.stringify(order.smartMix)}`);
    console.log(`   Total Cost: UGX ${order.totalCost.toLocaleString()}`);
    console.log(`   Delivery: ${order.delivery.address}`);
    console.log(`   Timestamp: ${order.createdAt}`);

    // Notify delivery team
    notifyDeliveryTeam(order);

    // Send success response
    res.status(201).json({
      success: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      message: `Order #${order.orderId} received successfully`,
      estimatedDelivery: order.estimatedDelivery,
      totalCost: order.totalCost
    });

  } catch (error) {
    console.error('❌ [ERROR] Order processing failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process order. Please try again.',
      details: error.message
    });
  }
});

/**
 * Get All Orders (Admin/Testing)
 * GET /api/orders
 * Returns: { success, total, orders }
 */
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    total: orders.length,
    orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
});

/**
 * Get Single Order by ID
 * GET /api/orders/:orderId
 * Returns: { success, order }
 */
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.orderId === Number(orderId));

  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Order #${orderId} not found`
    });
  }

  res.json({
    success: true,
    order
  });
});

/**
 * Update Order Status
 * PATCH /api/orders/:orderId
 * Request body: { status: 'confirmed' | 'dispatched' | 'delivered' }
 */
app.patch('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const orderIndex = orders.findIndex(o => o.orderId === Number(orderId));
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Order #${orderId} not found`
    });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  console.log(`🔄 [STATUS UPDATE] Order #${orderId} → ${status}`);

  res.json({
    success: true,
    message: `Order #${orderId} updated to ${status}`,
    order: orders[orderIndex]
  });
});

/**
 * Delete Order (Admin only)
 * DELETE /api/orders/:orderId
 */
app.delete('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex(o => o.orderId === Number(orderId));

  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Order #${orderId} not found`
    });
  }

  const deletedOrder = orders.splice(orderIndex, 1)[0];
  
  console.log(`🗑️  [ORDER DELETED] Order #${deletedOrder.orderId}`);

  res.json({
    success: true,
    message: `Order #${orderId} deleted`,
    order: deletedOrder
  });
});

/**
 * Get Products (Menu)
 * GET /api/products
 * Returns: { success, products }
 */
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: PRODUCTS
  });
});

/**
 * Get Order Statistics
 * GET /api/stats
 * Returns: { total_orders, total_revenue, pending_orders, etc }
 */
app.get('/api/stats', (req, res) => {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalCost || 0), 0);

  const totalCrates = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.crates, 0);

  const avgGuestCount = totalOrders > 0 
    ? Math.round(orders.reduce((sum, o) => sum + o.guests, 0) / totalOrders)
    : 0;

  res.json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      dispatchedOrders,
      deliveredOrders,
      totalRevenue,
      totalCrates,
      avgGuestCount,
      generatedAt: new Date().toISOString()
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ [GLOBAL ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🍺 NBL HUB SERVER STARTED');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('📊 API Docs:');
  console.log('   POST   /api/orders          - Place new order');
  console.log('   GET    /api/orders          - List all orders');
  console.log('   GET    /api/orders/:id      - Get single order');
  console.log('   PATCH  /api/orders/:id      - Update order status');
  console.log('   DELETE /api/orders/:id      - Delete order');
  console.log('   GET    /api/products        - Get menu');
  console.log('   GET    /api/stats           - Get statistics');
  console.log('🌍 Frontend: http://localhost:5173');
  console.log('🔌 CORS enabled for: http://localhost:5173');
  console.log('════════════════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⛔ Server shutting down...');
  console.log(`📊 Final Stats: ${orders.length} orders processed`);
  process.exit(0);
});

export default app;
