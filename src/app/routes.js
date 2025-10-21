/* eslint-disable */
// This file defines all the API endpoints and who can access them
const { Router } = require('express');
const { requireRole } = require('./roles.middleware');

const router = Router();

// Health check - anyone can check if server is running
router.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

// Identity - get current user info (need to be logged in)
router.get('/api/me', requireRole('hiker','guide','admin'), (req, res) => {
  res.status(200).json({ todo: 'return current user info' });
});

// Guides - view guide profiles (anyone) or update own profile (guides only)
router.get('/api/guides/:id', requireRole('visitor','hiker','guide','admin'), (req, res) => {
  res.status(200).json({ todo: 'get guide by id' });
});
router.patch('/api/guides/me', requireRole('guide'), (req, res) => {
  res.status(200).json({ todo: 'update my guide profile' });
});

// Hikes - view hikes (anyone) or create hikes (guides only)
router.get('/api/hikes', requireRole('visitor','hiker','guide','admin'), (req, res) => {
  res.status(200).json({ todo: 'list hikes' });
});
router.get('/api/hikes/:id', requireRole('visitor','hiker','guide','admin'), (req, res) => {
  res.status(200).json({ todo: 'get hike by id' });
});
router.post('/api/hikes', requireRole('guide'), (req, res) => {
  res.status(201).json({ todo: 'create hike' });
});

// Bookings - create/cancel bookings (hikers only)
router.post('/api/bookings', requireRole('hiker'), (req, res) => {
  res.status(201).json({ todo: 'create booking' });
});
router.delete('/api/bookings/:id', requireRole('hiker'), (req, res) => {
  res.status(204).json({ todo: 'delete booking if owner' });
});

// Reviews - create reviews (hikers) or view reviews (anyone)
router.post('/api/reviews', requireRole('hiker'), (req, res) => {
  res.status(201).json({ todo: 'create review' });
});
router.get('/api/guides/:id/reviews', requireRole('visitor','hiker','guide','admin'), (req, res) => {
  res.status(200).json({ todo: 'list reviews for guide' });
});

// Admin - only admins can access these
router.get('/api/admin/overview', requireRole('admin'), (req, res) => {
  res.status(200).json({ todo: 'admin overview' });
});
router.get('/api/admin/analytics', requireRole('admin'), (req, res) => {
  res.status(200).json({ todo: 'admin analytics' });
});

module.exports = router;
