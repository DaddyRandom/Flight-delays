/**
 * Database initialization and management for TravelComp
 * Using better-sqlite3 for development
 */

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DATABASE_URL || './travelcomp.db';

// Initialize database connection
const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
function initializeDatabase() {
  console.log('Initializing database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Claims table
  db.exec(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      claim_reference TEXT UNIQUE NOT NULL,
      flight_number TEXT NOT NULL,
      flight_date DATE NOT NULL,
      airline TEXT NOT NULL,
      departure_airport TEXT NOT NULL,
      arrival_airport TEXT NOT NULL,
      issue_type TEXT NOT NULL,
      status TEXT DEFAULT 'submitted',
      delay_minutes INTEGER,
      compensation_amount DECIMAL(10,2),
      compensation_currency TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Flight searches cache table
  db.exec(`
    CREATE TABLE IF NOT EXISTS flight_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_number TEXT NOT NULL,
      flight_date DATE NOT NULL,
      airline TEXT,
      status TEXT,
      delay_minutes INTEGER,
      raw_data TEXT,
      searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
    CREATE INDEX IF NOT EXISTS idx_claims_reference ON claims(claim_reference);
    CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
    CREATE INDEX IF NOT EXISTS idx_flight_searches_number ON flight_searches(flight_number);
    CREATE INDEX IF NOT EXISTS idx_flight_searches_date ON flight_searches(flight_date);
  `);

  console.log('Database initialized successfully!');
}

/**
 * Generate unique claim reference
 * Format: TC-YYYYMMDD-XXXXX
 */
function generateClaimReference() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TC-${dateStr}-${random}`;
}

// Initialize database FIRST before creating prepared statements
initializeDatabase();

/**
 * Database queries
 */
const queries = {
  // Claims
  insertClaim: db.prepare(`
    INSERT INTO claims (
      user_id, claim_reference, flight_number, flight_date,
      airline, departure_airport, arrival_airport, issue_type,
      status, delay_minutes, compensation_amount, compensation_currency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getAllClaims: db.prepare(`
    SELECT * FROM claims ORDER BY created_at DESC
  `),

  getClaimById: db.prepare(`
    SELECT * FROM claims WHERE id = ?
  `),

  getClaimByReference: db.prepare(`
    SELECT * FROM claims WHERE claim_reference = ?
  `),

  getClaimsByUserId: db.prepare(`
    SELECT * FROM claims WHERE user_id = ? ORDER BY created_at DESC
  `),

  updateClaimStatus: db.prepare(`
    UPDATE claims SET status = ? WHERE id = ?
  `),

  // Flight searches
  insertFlightSearch: db.prepare(`
    INSERT INTO flight_searches (
      flight_number, flight_date, airline, status,
      delay_minutes, raw_data
    ) VALUES (?, ?, ?, ?, ?, ?)
  `),

  getRecentFlightSearch: db.prepare(`
    SELECT * FROM flight_searches
    WHERE flight_number = ? AND flight_date = ?
    AND datetime(searched_at) > datetime('now', '-5 minutes')
    ORDER BY searched_at DESC LIMIT 1
  `),

  // Users (for future authentication)
  insertUser: db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, phone)
    VALUES (?, ?, ?, ?, ?)
  `),

  getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `)
};

/**
 * Helper functions for database operations
 */
const dbHelpers = {
  /**
   * Create a new claim
   */
  createClaim(claimData) {
    const reference = generateClaimReference();
    const result = queries.insertClaim.run(
      claimData.userId || null,
      reference,
      claimData.flightNumber,
      claimData.flightDate,
      claimData.airline,
      claimData.departure,
      claimData.arrival,
      claimData.issueType,
      'submitted',
      claimData.delayMinutes || null,
      claimData.compensationAmount || null,
      claimData.compensationCurrency || null
    );

    return {
      id: result.lastInsertRowid,
      claimReference: reference
    };
  },

  /**
   * Get all claims
   */
  getAllClaims() {
    return queries.getAllClaims.all();
  },

  /**
   * Get claim by ID
   */
  getClaimById(id) {
    return queries.getClaimById.get(id);
  },

  /**
   * Get claim by reference
   */
  getClaimByReference(reference) {
    return queries.getClaimByReference.get(reference);
  },

  /**
   * Cache flight search result
   */
  cacheFlightSearch(flightData) {
    queries.insertFlightSearch.run(
      flightData.flightNumber,
      flightData.flightDate,
      flightData.airline || null,
      flightData.status || null,
      flightData.delayMinutes || null,
      JSON.stringify(flightData.raw || {})
    );
  },

  /**
   * Get cached flight search
   */
  getCachedFlightSearch(flightNumber, flightDate) {
    return queries.getRecentFlightSearch.get(flightNumber, flightDate);
  }
};

module.exports = {
  db,
  queries,
  dbHelpers,
  generateClaimReference
};
