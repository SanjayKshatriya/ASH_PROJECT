// Stub routes for IoT, Admin, Payments, Community
const express = require('express');

// IoT Routes
const iotRouter = express.Router();
const auth = require('../middleware/auth.middleware');
iotRouter.get('/readings/:farmId', auth, (req, res) => res.json({ success: true, data: [] }));
iotRouter.post('/readings', auth, (req, res) => res.status(201).json({ success: true }));
iotRouter.get('/alerts/:farmId', auth, (req, res) => res.json({ success: true, data: [] }));
module.exports.iotRouter = iotRouter;

// Admin Routes
const adminRouter = express.Router();
adminRouter.get('/stats', auth, (req, res) => res.json({ success: true, data: { farmers: 50248, buyers: 1284, revenue: 42000000, scans: 2847 } }));
adminRouter.get('/farmers', auth, (req, res) => res.json({ success: true, data: [] }));
adminRouter.get('/orders', auth, (req, res) => res.json({ success: true, data: [] }));
module.exports.adminRouter = adminRouter;

// Payment Routes
const paymentRouter = express.Router();
paymentRouter.post('/create-order', auth, (req, res) => res.json({ success: true, data: { orderId: 'pay_demo', key: process.env.RAZORPAY_KEY_ID } }));
paymentRouter.post('/verify', auth, (req, res) => res.json({ success: true, message: 'Payment verified' }));
module.exports.paymentRouter = paymentRouter;

// Community Routes
const communityRouter = express.Router();
communityRouter.get('/posts', (req, res) => res.json({ success: true, data: [] }));
communityRouter.post('/posts', auth, (req, res) => res.status(201).json({ success: true }));
communityRouter.post('/posts/:id/like', auth, (req, res) => res.json({ success: true }));
module.exports.communityRouter = communityRouter;
