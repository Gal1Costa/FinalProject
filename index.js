/* eslint-disable */
// This is the main server file - starts everything up
const http = require('http');
const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');
const { config } = require('./config');           // Load settings from .env file
const { authMiddleware } = require('./auth.middleware');  // Check if user is logged in
const { errorHandler } = require('./errors');     // Handle errors nicely
const routes = require('./routes');               // All API endpoints
const { connectPool, getPool } = require('../shared/db');  // Database connection
const { logger } = require('../shared/logger');   // Log messages
const chatGateway = require('../modules/chat/gateway');  // Real-time chat

// External services (stubs for now - not implemented yet)
const firebaseAuth = require('../adapters/firebase.auth');    // User login
const firebaseStorage = require('../adapters/firebase.storage');  // File storage
const maps = require('../adapters/maps.adapter');          // Maps and geocoding
const payments = require('../adapters/payments.adapter');    // Payment processing

let server;
let io;

/**
 * Sets up the Express web server with all middleware and routes
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Allow web browsers to connect to our API
  app.use(cors());

  // Parse JSON data from requests (like when creating a hike)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log every request to console
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ level: 'info', msg: 'request', method: req.method, url: req.originalUrl }));
    next();
  });

  // Make external services available to other parts of the app
  app.locals.adapters = {
    firebaseAuth,      // For checking user login
    firebaseStorage,   // For storing photos/files
    maps,              // For geocoding and maps
    payments,          // For processing payments
  };

  // Check if user is logged in on every request
  app.use(authMiddleware);

  // Health check endpoint - anyone can check if server is running
  app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

  // Add all API routes (hikes, bookings, guides, etc.)
  app.use(routes);

  // Handle any errors that happen
  app.use(errorHandler);

  return app;
}

/**
 * Starts the TrailHub server - this is the main function
 * Sets up database, web server, and real-time chat
 * @param {number} [customPort] - port to run on (default from .env file)
 * @returns {Promise<{ server: import('http').Server, io: import('socket.io').Server, stop: () => Promise<void> }>} 
 */
async function start(customPort) {
  // 1) Get port number from settings
  const port = Number(customPort || config.port);

  // 2) Try to connect to database (PostgreSQL)
  const dbPool = await connectPool();
  if (!dbPool) {
    console.warn('Starting without database connection (development mode)');
  }

  // 3) Load external services (not implemented yet)
  // TODO: Initialize firebase-admin and other SDKs here when implementing
  void firebaseAuth; void firebaseStorage; void payments;

  // 4) Create the web server with all routes and middleware
  const app = createApp();

  // 5) Start HTTP server and real-time chat
  server = http.createServer(app);
  io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PATCH','DELETE'] } });
  chatGateway.register(io);

  // 6) Start listening for requests
  await new Promise((resolve) => server.listen(port, resolve));
  logger.info('TrailHub ready', { port });

  // 7) Return server handles and cleanup function
  async function stop() {
    // Close real-time chat
    if (io) {
      io.removeAllListeners();
      io.close();
    }
    // Close web server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // Close database connection
    try {
      const pool = getPool();
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (_e) {
      // swallow
    }
  }

  return { server, io, stop };
}

if (require.main === module) {
  // Run if executed directly
  start();
}

module.exports = { start };
