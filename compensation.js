/**
 * Compensation Calculator for TravelComp
 * Implements EU261 and US DOT regulations
 */

// Extraordinary circumstances that exempt airlines from compensation
const EXTRAORDINARY_CIRCUMSTANCES = [
  'weather',
  'air_traffic',
  'security',
  'political_instability',
  'safety_risk',
  'strike' // Note: airline staff strikes are NOT extraordinary
];

/**
 * Calculate distance between two airports (simplified)
 * In production, use actual airport coordinates
 */
function calculateDistance(departure, arrival) {
  // Simplified distance calculations for common routes
  // In production, integrate with airport database or API
  const distanceMap = {
    'JFK-LAX': 2475,
    'LAX-JFK': 2475,
    'LHR-JFK': 3459,
    'JFK-LHR': 3459,
    'SFO-ORD': 1846,
    'ORD-SFO': 1846,
    'LAX-SFO': 337,
    'SFO-LAX': 337,
    'LHR-CDG': 215,
    'CDG-LHR': 215
  };

  const key = `${departure}-${arrival}`;
  return distanceMap[key] || 1500; // Default to medium distance
}

/**
 * Determine if route involves EU
 */
function isEURoute(departure, arrival, airline) {
  const euAirports = ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'MUC', 'BCN', 'DUB'];
  const euAirlines = ['BA', 'AF', 'LH', 'KL', 'IB', 'AZ'];

  const departureIsEU = euAirports.includes(departure);
  const arrivalIsEU = euAirports.includes(arrival);
  const airlineIsEU = euAirlines.some(code => airline?.includes(code));

  // EU261 applies if:
  // 1. Flight departs from EU airport (any airline)
  // 2. Flight arrives at EU airport AND operated by EU airline
  return departureIsEU || (arrivalIsEU && airlineIsEU);
}

/**
 * Calculate compensation based on EU261 regulations
 */
function calculateEU261Compensation(flightData) {
  const { distance, delayMinutes, cancelled, reason } = flightData;

  // Check for extraordinary circumstances
  if (EXTRAORDINARY_CIRCUMSTANCES.includes(reason?.toLowerCase())) {
    return {
      eligible: false,
      amount: 0,
      currency: 'EUR',
      reason: 'Extraordinary circumstances - airline not liable',
      regulation: 'EU261'
    };
  }

  // Must be cancelled or delayed 3+ hours
  if (!cancelled && delayMinutes < 180) {
    return {
      eligible: false,
      amount: 0,
      currency: 'EUR',
      reason: 'Delay less than 3 hours - not eligible under EU261',
      regulation: 'EU261'
    };
  }

  // Calculate compensation based on distance
  let amount = 0;
  if (distance <= 1500) {
    amount = 250;
  } else if (distance <= 3500) {
    amount = 400;
  } else {
    amount = 600;
  }

  // Reduce compensation by 50% for delays between 3-4 hours on long flights
  if (!cancelled && delayMinutes >= 180 && delayMinutes < 240 && distance > 3500) {
    amount = 300; // 50% of 600
  }

  return {
    eligible: true,
    amount,
    currency: 'EUR',
    reason: cancelled
      ? `Flight cancelled - eligible for €${amount} under EU261`
      : `Flight delayed ${Math.floor(delayMinutes / 60)}+ hours - eligible for €${amount} under EU261`,
    regulation: 'EU261',
    additionalRights: [
      'Right to care (meals, refreshments, accommodation if needed)',
      'Right to reimbursement or rerouting',
      'Right to information'
    ]
  };
}

/**
 * Calculate compensation based on US DOT regulations
 */
function calculateUSDOTCompensation(flightData) {
  const { delayMinutes, cancelled, deniedBoarding } = flightData;

  // Denied boarding (involuntary bumping) has specific compensation
  if (deniedBoarding) {
    return {
      eligible: true,
      amount: 0, // Varies by delay and ticket price
      currency: 'USD',
      reason: 'Involuntary denied boarding - compensation required',
      regulation: 'US DOT 14 CFR 250',
      benefits: [
        'Up to 400% of one-way fare (max $1,550) for delays 2+ hours',
        'Up to 200% of one-way fare (max $775) for delays 1-2 hours'
      ]
    };
  }

  // Cancellations - no cash compensation but refund required
  if (cancelled) {
    return {
      eligible: true,
      amount: 0,
      currency: 'USD',
      reason: 'Flight cancelled - full refund required',
      regulation: 'US DOT',
      benefits: [
        'Full refund to original payment method',
        'Rebooking on next available flight at no extra cost',
        'Meals and hotel if overnight delay'
      ]
    };
  }

  // Significant delays (3+ hours)
  if (delayMinutes >= 180) {
    return {
      eligible: true,
      amount: 0, // No mandatory cash compensation for delays in US
      currency: 'USD',
      reason: 'Significant delay - care and assistance required',
      regulation: 'US DOT',
      benefits: [
        'Meal vouchers for delays 3+ hours',
        'Hotel accommodation for overnight delays',
        'May be eligible for refund if delay is substantial'
      ]
    };
  }

  return {
    eligible: false,
    amount: 0,
    currency: 'USD',
    reason: 'Does not meet US DOT compensation criteria',
    regulation: 'US DOT'
  };
}

/**
 * Main compensation calculation function
 */
function calculateCompensation(flightData) {
  const {
    flightNumber,
    airline,
    departure,
    arrival,
    delayMinutes = 0,
    cancelled = false,
    reason = null
  } = flightData;

  // Calculate distance
  const distance = flightData.distance || calculateDistance(departure, arrival);

  // Determine applicable regulation
  const isEU = isEURoute(departure, arrival, airline);

  // Prepare enhanced flight data
  const enhancedData = {
    ...flightData,
    distance
  };

  // Calculate compensation based on applicable regulation
  let compensation;
  if (isEU) {
    compensation = calculateEU261Compensation(enhancedData);
  } else {
    compensation = calculateUSDOTCompensation(enhancedData);
  }

  return {
    flightNumber,
    airline,
    route: `${departure} → ${arrival}`,
    distance,
    delay: delayMinutes,
    cancelled,
    ...compensation
  };
}

/**
 * Test scenarios for demonstration
 */
const TEST_SCENARIOS = {
  delayed_3h: {
    flightNumber: 'TEST-3H',
    airline: 'Example Airlines',
    departure: 'JFK',
    arrival: 'LAX',
    delay: 180,
    distance: 2475,
    status: 'delayed',
    cancelled: false,
    reason: 'technical'
  },
  delayed_4h: {
    flightNumber: 'TEST-4H',
    airline: 'British Airways',
    departure: 'LHR',
    arrival: 'JFK',
    delay: 240,
    distance: 3459,
    status: 'delayed',
    cancelled: false,
    reason: 'technical'
  },
  cancelled: {
    flightNumber: 'TEST-CXL',
    airline: 'Example Airlines',
    departure: 'SFO',
    arrival: 'ORD',
    distance: 1846,
    status: 'cancelled',
    cancelled: true,
    reason: 'operational'
  },
  short_delay: {
    flightNumber: 'TEST-1H',
    airline: 'Example Airlines',
    departure: 'LAX',
    arrival: 'SFO',
    delay: 60,
    distance: 337,
    status: 'delayed',
    cancelled: false,
    reason: null
  },
  weather_delay: {
    flightNumber: 'TEST-WX',
    airline: 'Air France',
    departure: 'CDG',
    arrival: 'LHR',
    delay: 300,
    distance: 215,
    status: 'delayed',
    cancelled: false,
    reason: 'weather'
  }
};

/**
 * Get test scenario by name
 */
function getTestScenario(scenarioName) {
  const scenario = TEST_SCENARIOS[scenarioName];
  if (!scenario) {
    return null;
  }

  const compensation = calculateCompensation({
    ...scenario,
    delayMinutes: scenario.delay
  });

  return {
    scenario: scenarioName,
    flight: scenario,
    compensation
  };
}

module.exports = {
  calculateCompensation,
  calculateDistance,
  isEURoute,
  TEST_SCENARIOS,
  getTestScenario
};
