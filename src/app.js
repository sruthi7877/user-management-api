const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

// Load DB schema and seed managers if not already
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

db.exec(schemaSQL, (err) => {
  if (err) {
    console.error('Error running schema SQL:', err.message);
  } else {
    console.log('Database initialized with schema');
  }
});

// Routes
app.use('/', userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`User Management API listening at http://localhost:${PORT}`);
});
