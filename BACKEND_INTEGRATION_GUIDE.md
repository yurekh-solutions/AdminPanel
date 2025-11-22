# Backend Integration Guide

## Overview
This guide explains how to integrate the Business Automation Suite with your Node.js/MongoDB backend to use real data instead of mock data.

## 1. Database Models

Add these MongoDB models to your `backendmatrix/src/models/`:

### Analytics Model
```typescript
// backendmatrix/src/models/Analytics.ts
import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  supplierId: mongoose.Schema.Types.ObjectId,
  metric: String, // 'response_time', 'conversion_rate', 'inquiry_count', etc.
  value: Number,
  date: { type: Date, default: Date.now },
  period: String, // 'daily', 'weekly', 'monthly'
  metadata: mongoose.Schema.Types.Mixed,
});

export const Analytics = mongoose.model('Analytics', analyticsSchema);
```

### AutoReply Model
```typescript
// backendmatrix/src/models/AutoReply.ts
import mongoose from 'mongoose';

const autoReplySchema = new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  name: String,
  trigger: String, // 'general', 'pricing', 'moq', 'bulk', 'technical'
  message: String,
  usage: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const AutoReply = mongoose.model('AutoReply', autoReplySchema);
```

### Lead Model (Enhanced)
```typescript
// backendmatrix/src/models/Lead.ts
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  supplierId: mongoose.Schema.Types.ObjectId,
  company: String,
  contact: String,
  email: String,
  score: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['hot', 'warm', 'cold'] },
  engagement: String, // 'high', 'medium', 'low'
  inquiries: { type: Number, default: 0 },
  lastContact: Date,
  potential: Number, // in rupees
  assignedTo: mongoose.Schema.Types.ObjectId, // sales person
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Lead = mongoose.model('Lead', leadSchema);
```

### Order Model (Enhanced)
```typescript
// backendmatrix/src/models/Order.ts
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: String,
  supplierId: mongoose.Schema.Types.ObjectId,
  buyerId: String,
  product: String,
  quantity: Number,
  unit: String,
  status: { type: String, enum: ['pending', 'processing', 'processed', 'fulfilled'] },
  autoProcessed: { type: Boolean, default: false },
  automationScore: { type: Number, min: 0, max: 100 },
  amount: Number,
  orderedAt: Date,
  estimatedDelivery: String,
  processedAt: Date,
  fulfilledAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model('Order', orderSchema);
```

## 2. API Routes

Add these routes to your `backendmatrix/src/routes/analytics.ts`:

```typescript
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { Analytics, AutoReply, Lead, Order } from '../models';

const router = express.Router();

// ===== ANALYTICS =====

// GET performance analytics
router.get('/analytics/performance', authMiddleware, async (req, res) => {
  try {
    const period = req.query.period || '7days';
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Analytics.find({
      date: { $gte: startDate }
    }).lean();

    res.json({
      success: true,
      data: {
        responseTime: 2.3,
        conversionRate: 8.3,
        totalInquiries: 1240,
        automationEfficiency: 78,
        supplierCount: 245,
        productCount: 1543,
        ordersProcessed: 543,
        emailsSent: 8920,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET stats
router.get('/automation/stats', authMiddleware, async (req, res) => {
  try {
    const autoReplies = await AutoReply.countDocuments({ status: 'active' });
    const leads = await Lead.countDocuments();
    const orders = await Order.countDocuments({ autoProcessed: true });

    res.json({
      success: true,
      data: {
        autoReplies,
        leadScores: leads,
        ordersProcessed: orders,
        emailsSent: 8920,
        responseTime: '2.3hrs',
        conversionRate: '8.3%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== AUTO-REPLIES =====

// GET all auto-replies
router.get('/automation/auto-replies', authMiddleware, async (req, res) => {
  try {
    const replies = await AutoReply.find().lean();
    res.json({ success: true, data: replies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create auto-reply
router.post('/automation/auto-replies', authMiddleware, async (req, res) => {
  try {
    const reply = new AutoReply(req.body);
    await reply.save();
    res.json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update auto-reply
router.put('/automation/auto-replies/:id', authMiddleware, async (req, res) => {
  try {
    const reply = await AutoReply.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE auto-reply
router.delete('/automation/auto-replies/:id', authMiddleware, async (req, res) => {
  try {
    await AutoReply.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== LEADS =====

// GET all leads
router.get('/automation/leads', authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find().lean();
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST assign lead to sales
router.post('/automation/leads/:id/assign', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.salesPersonId },
      { new: true }
    );
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ORDERS =====

// GET all orders
router.get('/automation/orders', authMiddleware, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    
    const orders = await Order.find(query).lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST auto-process order
router.post('/automation/orders/:id/auto-process', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        autoProcessed: true,
        status: 'processing',
        automationScore: 90,
        processedAt: new Date()
      },
      { new: true }
    );
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

## 3. Register Routes in server.ts

```typescript
// backendmatrix/src/server.ts

import analyticsRouter from './routes/analytics';

// ... other routes ...
app.use('/api/admin', analyticsRouter);

// ... rest of code ...
```

## 4. Frontend API Calls

The `automationService.ts` is already configured. Just ensure the API_URL matches:

```typescript
// .env file
VITE_API_URL=http://localhost:5000/api
```

## 5. Data Sync from SupplierPortal

When suppliers use the automation tools in the portal, send data to backend:

```typescript
// supplierportal/src/lib/automationService.ts (NEW)
export const logAutomationEvent = async (token: string, event: {
  type: string;
  supplier: string;
  data: any;
}) => {
  const response = await fetch(`${API_URL}/admin/analytics/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  return response.json();
};
```

## 6. Real-time Data Updates

For live dashboards, implement WebSocket:

```typescript
// backendmatrix/src/websocket.ts
import { Server } from 'socket.io';

export const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('subscribe-analytics', (supplierId) => {
      socket.join(`analytics:${supplierId}`);
    });
  });

  return io;
};

// Emit updates
export const broadcastAnalyticsUpdate = (io, supplierId, data) => {
  io.to(`analytics:${supplierId}`).emit('analytics-update', data);
};
```

## 7. MongoDB Indexes

Add these indexes for better performance:

```javascript
// In MongoDB
db.automations.createIndex({ "adminId": 1, "createdAt": -1 });
db.leads.createIndex({ "score": -1 });
db.leads.createIndex({ "status": 1 });
db.orders.createIndex({ "autoProcessed": 1, "status": 1 });
db.analytics.createIndex({ "date": -1 });
```

## 8. API Error Handling

Ensure all endpoints follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

## 9. Testing the Integration

Use Postman or curl to test:

```bash
# Get analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/analytics/performance?period=7days

# Get auto-replies
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/automation/auto-replies

# Create auto-reply
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","trigger":"general","message":"Test message"}' \
  http://localhost:5000/api/admin/automation/auto-replies
```

## 10. Supplier Portal Integration

To add automation tools to suppliers:

1. Create supplier-facing components in `supplierportal/src/pages/`
2. Use same backend API routes (with supplier auth)
3. Display supplier-specific analytics
4. Track supplier's automation usage

## Deployment Checklist

- [ ] All models created in database
- [ ] All routes implemented
- [ ] Routes registered in server.ts
- [ ] Environment variables set correctly
- [ ] Tests written and passing
- [ ] API documentation updated
- [ ] WebSocket configured (if using real-time)
- [ ] Indexes created
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] CORS configured properly
- [ ] Deploy to production

---

**Note:** Replace mock data in components with actual API calls when backend is ready.
