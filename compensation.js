/**
 * Compensation Calculator for TravelComp
 * Implements EU261 and US DOT regulations
 */

// ============================================
// AIRPORT DATABASE - Global Coverage
// ============================================

// European Union Airports (Major & Regional)
const EU_AIRPORTS = [
  // United Kingdom
  'LHR', 'LGW', 'STN', 'LTN', 'MAN', 'EDI', 'BHX', 'GLA', 'BRS', 'NCL',
  // France
  'CDG', 'ORY', 'NCE', 'LYS', 'TLS', 'MRS', 'BOD', 'NTE', 'BSL',
  // Germany
  'FRA', 'MUC', 'TXL', 'DUS', 'HAM', 'CGN', 'STR', 'BER', 'HAJ', 'NUE',
  // Spain
  'MAD', 'BCN', 'AGP', 'PMI', 'VLC', 'SVQ', 'ALC', 'BIO', 'IBZ',
  // Italy
  'FCO', 'MXP', 'VCE', 'NAP', 'BGY', 'PSA', 'BLQ', 'CTA', 'LIN',
  // Netherlands
  'AMS', 'EIN', 'RTM',
  // Belgium
  'BRU', 'CRL',
  // Ireland
  'DUB', 'ORK', 'SNN',
  // Austria
  'VIE', 'SZG', 'INN',
  // Switzerland
  'ZRH', 'GVA', 'BSL',
  // Portugal
  'LIS', 'OPO', 'FAO',
  // Greece
  'ATH', 'HER', 'RHO', 'CFU', 'JTR',
  // Scandinavia
  'CPH', 'ARN', 'OSL', 'HEL', 'BGO', 'GOT', 'STO',
  // Poland
  'WAW', 'KRK', 'GDN', 'WRO',
  // Czech Republic
  'PRG',
  // Hungary
  'BUD',
  // Romania
  'OTP', 'CLJ',
  // Bulgaria
  'SOF', 'VAR',
  // Croatia
  'ZAG', 'DBV', 'SPU',
  // Iceland
  'KEF',
  // Malta
  'MLA',
  // Cyprus
  'LCA', 'PFO'
];

// United States Airports (Major & Regional)
const US_AIRPORTS = [
  // Major Hubs
  'ATL', 'DFW', 'DEN', 'ORD', 'LAX', 'JFK', 'LAS', 'MCO', 'MIA', 'CLT',
  'SEA', 'EWR', 'SFO', 'PHX', 'IAH', 'BOS', 'FLL', 'MSP', 'LGA', 'DTW',
  'PHL', 'SLC', 'DCA', 'BWI', 'MDW', 'SAN', 'TPA', 'PDX', 'STL', 'HNL',
  // Regional Hubs
  'AUS', 'BNA', 'OAK', 'SJC', 'RDU', 'SMF', 'SNA', 'MCI', 'CLE', 'PIT',
  'IND', 'CMH', 'SJU', 'RSW', 'SAT', 'JAX', 'MKE', 'OMA', 'RNO', 'TUS',
  'BUF', 'ONT', 'BDL', 'ABQ', 'BUR', 'OGG', 'KOA', 'LIH', 'ANC', 'BOI',
  'MSY', 'PBI', 'RIC', 'CHS', 'SAV', 'DAY', 'DSM', 'GRR', 'TUL', 'ELP',
  'CVG', 'MEM', 'OKC', 'SYR', 'ROC', 'ALB', 'GSO', 'GSP', 'ICT', 'COS'
];

// Canadian Airports
const CANADA_AIRPORTS = [
  'YYZ', 'YVR', 'YUL', 'YYC', 'YOW', 'YEG', 'YHZ', 'YWG', 'YQB', 'YYJ'
];

// Asia-Pacific Airports (Major)
const ASIA_AIRPORTS = [
  // China
  'PEK', 'PVG', 'CAN', 'CTU', 'SZX', 'HGH', 'XIY', 'CKG', 'KMG', 'NKG',
  // Japan
  'NRT', 'HND', 'KIX', 'NGO', 'FUK', 'OKA', 'CTS',
  // South Korea
  'ICN', 'GMP', 'PUS',
  // Southeast Asia
  'SIN', 'BKK', 'DMK', 'KUL', 'CGK', 'MNL', 'HAN', 'SGN', 'HKG',
  // India
  'DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'COK',
  // Australia
  'SYD', 'MEL', 'BNE', 'PER', 'ADL', 'OOL', 'CNS',
  // New Zealand
  'AKL', 'CHC', 'WLG', 'ZQN'
];

// Middle East Airports
const MIDDLE_EAST_AIRPORTS = [
  'DXB', 'AUH', 'DOH', 'KWI', 'BAH', 'MCT', 'RUH', 'JED', 'CAI', 'TLV', 'AMM', 'BEY'
];

// Latin America Airports
const LATAM_AIRPORTS = [
  'MEX', 'GRU', 'GIG', 'EZE', 'BOG', 'LIM', 'SCL', 'CUN', 'PTY', 'UIO', 'CCS'
];

// Africa Airports
const AFRICA_AIRPORTS = [
  'JNB', 'CPT', 'DUR', 'CAI', 'ADD', 'NBO', 'LOS', 'ACC', 'ALG', 'TUN', 'CMN', 'CPT'
];

// ============================================
// AIRLINE DATABASE
// ============================================

// European Airlines
const EU_AIRLINES = [
  'British Airways', 'BA', 'Air France', 'AF', 'Lufthansa', 'LH',
  'KLM', 'KL', 'Iberia', 'IB', 'Alitalia', 'AZ', 'Ryanair', 'FR',
  'easyJet', 'U2', 'Vueling', 'VY', 'TAP Portugal', 'TP', 'Swiss', 'LX',
  'Austrian Airlines', 'OS', 'SAS', 'SK', 'Finnair', 'AY', 'Aer Lingus', 'EI',
  'LOT Polish', 'LO', 'Turkish Airlines', 'TK', 'Brussels Airlines', 'SN'
];

// US Airlines
const US_AIRLINES = [
  'American Airlines', 'AA', 'United Airlines', 'UA', 'Delta Air Lines', 'DL',
  'Southwest Airlines', 'WN', 'JetBlue', 'B6', 'Alaska Airlines', 'AS',
  'Spirit Airlines', 'NK', 'Frontier Airlines', 'F9', 'Allegiant', 'G4',
  'Hawaiian Airlines', 'HA', 'Sun Country', 'SY'
];

// Canadian Airlines
const CANADA_AIRLINES = [
  'Air Canada', 'AC', 'WestJet', 'WS', 'Porter Airlines', 'PD'
];

// Asian Airlines
const ASIA_AIRLINES = [
  'Singapore Airlines', 'SQ', 'Cathay Pacific', 'CX', 'ANA', 'NH',
  'Japan Airlines', 'JL', 'Korean Air', 'KE', 'Asiana', 'OZ',
  'China Southern', 'CZ', 'China Eastern', 'MU', 'Air China', 'CA',
  'Thai Airways', 'TG', 'Malaysia Airlines', 'MH', 'Qantas', 'QF',
  'Air India', 'AI', 'IndiGo', '6E', 'AirAsia', 'AK'
];

// Middle East Airlines
const MIDDLE_EAST_AIRLINES = [
  'Emirates', 'EK', 'Qatar Airways', 'QR', 'Etihad', 'EY',
  'Saudi Arabian', 'SV', 'Kuwait Airways', 'KU', 'Royal Jordanian', 'RJ'
];

// Latin America Airlines
const LATAM_AIRLINES = [
  'LATAM', 'LA', 'Aeromexico', 'AM', 'Copa Airlines', 'CM',
  'Avianca', 'AV', 'GOL', 'G3', 'Azul', 'AD'
];

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
 * Calculate distance between two airports
 * Enhanced with major route database
 */
function calculateDistance(departure, arrival) {
  // Comprehensive distance calculations for common routes (in km)
  const distanceMap = {
    // US Domestic Routes
    'JFK-LAX': 3983, 'LAX-JFK': 3983,
    'JFK-SFO': 4139, 'SFO-JFK': 4139,
    'LAX-SFO': 543, 'SFO-LAX': 543,
    'ORD-LAX': 2802, 'LAX-ORD': 2802,
    'SFO-ORD': 2960, 'ORD-SFO': 2960,
    'ATL-LAX': 3212, 'LAX-ATL': 3212,
    'DFW-LAX': 1989, 'LAX-DFW': 1989,
    'MIA-JFK': 1759, 'JFK-MIA': 1759,
    'BOS-LAX': 4180, 'LAX-BOS': 4180,
    'SEA-LAX': 1542, 'LAX-SEA': 1542,
    'DEN-LAX': 1389, 'LAX-DEN': 1389,
    'LAS-LAX': 379, 'LAX-LAS': 379,
    'PHX-LAX': 600, 'LAX-PHX': 600,
    'SAN-LAX': 182, 'LAX-SAN': 182,

    // Transatlantic Routes
    'LHR-JFK': 5541, 'JFK-LHR': 5541,
    'LHR-LAX': 8781, 'LAX-LHR': 8781,
    'CDG-JFK': 5837, 'JFK-CDG': 5837,
    'FRA-JFK': 6206, 'JFK-FRA': 6206,
    'AMS-JFK': 5862, 'JFK-AMS': 5862,
    'LHR-SFO': 8636, 'SFO-LHR': 8636,
    'LHR-BOS': 5269, 'BOS-LHR': 5269,
    'CDG-LAX': 9097, 'LAX-CDG': 9097,
    'FRA-SFO': 9149, 'SFO-FRA': 9149,

    // European Routes
    'LHR-CDG': 344, 'CDG-LHR': 344,
    'LHR-FRA': 659, 'FRA-LHR': 659,
    'LHR-AMS': 370, 'AMS-LHR': 370,
    'LHR-MAD': 1264, 'MAD-LHR': 1264,
    'LHR-BCN': 1138, 'BCN-LHR': 1138,
    'LHR-FCO': 1449, 'FCO-LHR': 1449,
    'CDG-FRA': 448, 'FRA-CDG': 448,
    'FRA-MUC': 300, 'MUC-FRA': 300,
    'AMS-BCN': 1238, 'BCN-AMS': 1238,

    // Asia-Pacific Routes
    'SIN-LHR': 10857, 'LHR-SIN': 10857,
    'HKG-JFK': 12989, 'JFK-HKG': 12989,
    'NRT-LAX': 8795, 'LAX-NRT': 8795,
    'SYD-LAX': 12051, 'LAX-SYD': 12051,
    'DXB-LHR': 5476, 'LHR-DXB': 5476,
    'DOH-LHR': 5148, 'LHR-DOH': 5148,

    // North America-Asia
    'LAX-NRT': 8795, 'NRT-LAX': 8795,
    'SFO-HKG': 11125, 'HKG-SFO': 11125,
    'LAX-SIN': 14114, 'SIN-LAX': 14114,
    'JFK-NRT': 10838, 'NRT-JFK': 10838,

    // Cross-Regional
    'DXB-JFK': 11003, 'JFK-DXB': 11003,
    'SIN-SYD': 6305, 'SYD-SIN': 6305,
    'MEX-LAX': 2490, 'LAX-MEX': 2490,
    'GRU-JFK': 7693, 'JFK-GRU': 7693
  };

  const key = `${departure}-${arrival}`;
  if (distanceMap[key]) {
    return distanceMap[key];
  }

  // Calculate approximate distance based on region
  const isIntercontinental = checkIntercontinental(departure, arrival);
  if (isIntercontinental) {
    return 8000; // Long-haul default
  }

  const isTransatlantic = checkTransatlantic(departure, arrival);
  if (isTransatlantic) {
    return 6000; // Transatlantic default
  }

  // Default to medium distance
  return 2000;
}

/**
 * Check if route is intercontinental
 */
function checkIntercontinental(departure, arrival) {
  const regions = [
    { name: 'EU', airports: EU_AIRPORTS },
    { name: 'US', airports: US_AIRPORTS },
    { name: 'ASIA', airports: ASIA_AIRPORTS },
    { name: 'ME', airports: MIDDLE_EAST_AIRPORTS }
  ];

  let depRegion = null;
  let arrRegion = null;

  for (const region of regions) {
    if (region.airports.includes(departure)) depRegion = region.name;
    if (region.airports.includes(arrival)) arrRegion = region.name;
  }

  return depRegion && arrRegion && depRegion !== arrRegion;
}

/**
 * Check if route is transatlantic
 */
function checkTransatlantic(departure, arrival) {
  const euDep = EU_AIRPORTS.includes(departure);
  const euArr = EU_AIRPORTS.includes(arrival);
  const usDep = US_AIRPORTS.includes(departure) || CANADA_AIRPORTS.includes(departure);
  const usArr = US_AIRPORTS.includes(arrival) || CANADA_AIRPORTS.includes(arrival);

  return (euDep && usArr) || (usDep && euArr);
}

/**
 * Determine if route involves EU
 */
function isEURoute(departure, arrival, airline) {
  const departureIsEU = EU_AIRPORTS.includes(departure);
  const arrivalIsEU = EU_AIRPORTS.includes(arrival);
  const airlineIsEU = EU_AIRLINES.some(code =>
    airline?.toUpperCase().includes(code.toUpperCase())
  );

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
