// Vercel serverless function wrapper
// This imports the built Express app from the backend
const app = require('../apps/backend/dist/app').default;

module.exports = app;
