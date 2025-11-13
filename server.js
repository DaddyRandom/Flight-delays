/**
 * TravelComp Express Server
 * Main server file with all API endpoints
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const { dbHelpers } = require('./database');
const { calculateCompensation, getTestScenario } = require('./compensation');

const app = express();
const PORT = process.env.PORT || 3001;
const AVIATION_API_KEY = process.env.AVIATION_API_KEY;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for now
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files (frontend)
app.use(express.static('public'));

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/flight/:flightNumber
 * Search for flight information
 */
app.get('/api/flight/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const { date } = req.query;

    // Validate flight number format
    if (!flightNumber || !/^[A-Z]{2,3}\d{1,4}$/i.test(flightNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flight number format. Expected format: AA123 or ABC1234'
      });
    }

    const flightDate = date || new Date().toISOString().split('T')[0];

    // Check cache first
    const cached = dbHelpers.getCachedFlightSearch(flightNumber.toUpperCase(), flightDate);
    if (cached) {
      console.log('Returning cached flight data');
      const parsedData = JSON.parse(cached.raw_data);
      return res.json({
        success: true,
        data: parsedData,
        cached: true
      });
    }

    // If no API key, return mock data
    if (!AVIATION_API_KEY || AVIATION_API_KEY === 'your_aviationstack_api_key_here') {
      console.log('No API key configured, returning mock data');
      const mockData = generateMockFlightData(flightNumber, flightDate);

      // Cache the mock data
      dbHelpers.cacheFlightSearch({
        flightNumber: flightNumber.toUpperCase(),
        flightDate,
        airline: mockData.airline,
        status: mockData.status,
        delayMinutes: mockData.delay,
        raw: mockData
      });

      return res.json({
        success: true,
        data: mockData,
        mock: true
      });
    }

    // Call AviationStack API
    const apiUrl = `http://api.aviationstack.com/v1/flights`;
    const response = await axios.get(apiUrl, {
      params: {
        access_key: AVIATION_API_KEY,
        flight_iata: flightNumber
      },
      timeout: 10000
    });

    if (response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      const flightData = parseAviationStackResponse(flight);

      // Cache the result
      dbHelpers.cacheFlightSearch({
        flightNumber: flightNumber.toUpperCase(),
        flightDate,
        airline: flightData.airline,
        status: flightData.status,
        delayMinutes: flightData.delay,
        raw: flightData
      });

      return res.json({
        success: true,
        data: flightData
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
  } catch (error) {
    console.error('Error fetching flight:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight information',
      details: error.message
    });
  }
});

/**
 * GET /api/test-scenario/:scenario
 * Get predefined test scenarios
 */
app.get('/api/test-scenario/:scenario', (req, res) => {
  try {
    const { scenario } = req.params;
    const scenarioData = getTestScenario(scenario);

    if (!scenarioData) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found',
        available: ['delayed_3h', 'delayed_4h', 'cancelled', 'short_delay', 'weather_delay']
      });
    }

    res.json({
      success: true,
      data: scenarioData
    });
  } catch (error) {
    console.error('Error fetching scenario:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenario',
      details: error.message
    });
  }
});

/**
 * POST /api/claims
 * Submit a new compensation claim
 */
app.post('/api/claims', async (req, res) => {
  try {
    const {
      userId,
      flightNumber,
      flightDate,
      airline,
      departure,
      arrival,
      issueType,
      delayMinutes,
      compensationAmount,
      compensationCurrency
    } = req.body;

    // Validate required fields
    if (!flightNumber || !flightDate || !airline || !departure || !arrival || !issueType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['flightNumber', 'flightDate', 'airline', 'departure', 'arrival', 'issueType']
      });
    }

    // Create claim in database
    const result = dbHelpers.createClaim({
      userId,
      flightNumber,
      flightDate,
      airline,
      departure,
      arrival,
      issueType,
      delayMinutes,
      compensationAmount,
      compensationCurrency
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claimReference: result.claimReference,
      id: result.id
    });
  } catch (error) {
    console.error('Error creating claim:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to submit claim',
      details: error.message
    });
  }
});

/**
 * GET /api/claims
 * Get all claims
 */
app.get('/api/claims', (req, res) => {
  try {
    const claims = dbHelpers.getAllClaims();
    res.json({
      success: true,
      claims,
      count: claims.length
    });
  } catch (error) {
    console.error('Error fetching claims:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claims',
      details: error.message
    });
  }
});

/**
 * GET /api/claims/:id
 * Get claim by ID
 */
app.get('/api/claims/:id', (req, res) => {
  try {
    const { id } = req.params;
    const claim = dbHelpers.getClaimById(id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    res.json({
      success: true,
      claim
    });
  } catch (error) {
    console.error('Error fetching claim:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claim',
      details: error.message
    });
  }
});

/**
 * GET /api/claim-reference/:reference
 * Get claim by reference number
 */
app.get('/api/claim-reference/:reference', (req, res) => {
  try {
    const { reference } = req.params;
    const claim = dbHelpers.getClaimByReference(reference);

    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    res.json({
      success: true,
      claim
    });
  } catch (error) {
    console.error('Error fetching claim:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claim',
      details: error.message
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate mock flight data for testing
 */
function generateMockFlightData(flightNumber, date) {
  const airlines = ['United Airlines', 'American Airlines', 'Delta Air Lines', 'British Airways', 'Lufthansa'];
  const airports = ['JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'SFO', 'ATL'];

  const randomDelay = Math.floor(Math.random() * 300);
  const departure = airports[Math.floor(Math.random() * airports.length)];
  let arrival = airports[Math.floor(Math.random() * airports.length)];
  while (arrival === departure) {
    arrival = airports[Math.floor(Math.random() * airports.length)];
  }

  const flightData = {
    flightNumber: flightNumber.toUpperCase(),
    airline: airlines[Math.floor(Math.random() * airlines.length)],
    departure,
    arrival,
    route: `${departure} → ${arrival}`,
    status: randomDelay > 180 ? 'delayed' : 'on-time',
    delay: randomDelay,
    delayMinutes: randomDelay,
    cancelled: false,
    date
  };

  // Calculate compensation
  const compensation = calculateCompensation(flightData);

  return {
    ...flightData,
    eligible: compensation.eligible,
    compensation: compensation.eligible ? {
      amount: compensation.amount,
      currency: compensation.currency,
      reason: compensation.reason
    } : null,
    compensationDetails: compensation
  };
}

/**
 * Parse AviationStack API response
 */
function parseAviationStackResponse(flight) {
  const departure = flight.departure?.iata || 'N/A';
  const arrival = flight.arrival?.iata || 'N/A';
  const airline = flight.airline?.name || 'Unknown';
  const flightNumber = flight.flight?.iata || 'N/A';

  // Calculate delay
  const scheduledDeparture = new Date(flight.departure?.scheduled);
  const actualDeparture = new Date(flight.departure?.actual || flight.departure?.estimated);
  const delayMinutes = Math.max(0, Math.floor((actualDeparture - scheduledDeparture) / 60000));

  const flightData = {
    flightNumber,
    airline,
    departure,
    arrival,
    route: `${departure} → ${arrival}`,
    status: flight.flight_status || 'unknown',
    delay: delayMinutes,
    delayMinutes,
    cancelled: flight.flight_status === 'cancelled',
    date: flight.flight_date
  };

  // Calculate compensation
  const compensation = calculateCompensation(flightData);

  return {
    ...flightData,
    eligible: compensation.eligible,
    compensation: compensation.eligible ? {
      amount: compensation.amount,
      currency: compensation.currency,
      reason: compensation.reason
    } : null,
    compensationDetails: compensation
  };
}

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║       TravelComp Server Running          ║
║                                          ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Database: ${process.env.DATABASE_URL || './travelcomp.db'}    ║
║                                          ║
║  API Endpoints:                          ║
║  - GET  /api/health                      ║
║  - GET  /api/flight/:flightNumber        ║
║  - GET  /api/test-scenario/:scenario     ║
║  - POST /api/claims                      ║
║  - GET  /api/claims                      ║
║  - GET  /api/claims/:id                  ║
║                                          ║
║  Frontend: http://localhost:${PORT}        ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
