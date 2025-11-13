/**
 * TravelComp Frontend JavaScript
 * Handles all UI interactions and API calls
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = window.location.origin + '/api';

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });

  // Show requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';

    // Load claims if claims section
    if (sectionId === 'claims') {
      loadClaims();
    }
  }
}

// ============================================
// FLIGHT SEARCH
// ============================================
document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const flightNumber = document.getElementById('flightNumber').value.trim();
  const flightDate = document.getElementById('flightDate').value;

  await searchFlight(flightNumber, flightDate);
});

async function searchFlight(flightNumber, date) {
  const form = document.getElementById('searchForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const resultsDiv = document.getElementById('flightResults');

  try {
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    resultsDiv.style.display = 'none';

    // Make API call
    const response = await fetch(`${API_BASE}/flight/${flightNumber}?date=${date}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch flight');
    }

    // Display results
    displayFlightResults(result.data);

    // Show success toast
    if (result.mock) {
      showToast('Using mock data (API key not configured)', 'warning');
    } else if (result.cached) {
      showToast('Showing cached flight data', 'success');
    } else {
      showToast('Flight data loaded successfully', 'success');
    }
  } catch (error) {
    console.error('Error searching flight:', error);
    showToast(error.message || 'Failed to search flight', 'error');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function displayFlightResults(flight) {
  const resultsDiv = document.getElementById('flightResults');

  const eligible = flight.eligible;
  const compensation = flight.compensation || flight.compensationDetails;

  resultsDiv.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <div class="result-flight">
          <div class="result-flight-number">${flight.flightNumber}</div>
          <div class="result-airline">${flight.airline}</div>
        </div>
        <div class="result-status ${eligible ? 'status-eligible' : 'status-not-eligible'}">
          ${eligible ? '✓ Eligible' : '✗ Not Eligible'}
        </div>
      </div>

      <div class="result-details">
        <div class="result-detail">
          <span class="result-detail-label">Route</span>
          <span class="result-detail-value">${flight.route || `${flight.departure} → ${flight.arrival}`}</span>
        </div>
        <div class="result-detail">
          <span class="result-detail-label">Status</span>
          <span class="result-detail-value">${flight.status || 'Unknown'}</span>
        </div>
        <div class="result-detail">
          <span class="result-detail-label">Delay</span>
          <span class="result-detail-value">${formatDelay(flight.delay || flight.delayMinutes)}</span>
        </div>
        ${flight.date ? `
        <div class="result-detail">
          <span class="result-detail-label">Date</span>
          <span class="result-detail-value">${formatDate(flight.date)}</span>
        </div>
        ` : ''}
      </div>

      ${eligible && compensation ? `
        <div class="result-compensation">
          <div class="compensation-amount">
            ${compensation.currency || 'EUR'} ${compensation.amount || 0}
          </div>
          <div class="compensation-reason">
            ${compensation.reason || 'Eligible for compensation'}
          </div>
        </div>
      ` : compensation ? `
        <div class="result-detail" style="margin-bottom: 1rem;">
          <span class="result-detail-label">Reason</span>
          <span class="result-detail-value" style="color: var(--text-secondary);">
            ${compensation.reason || 'Does not meet compensation criteria'}
          </span>
        </div>
      ` : ''}

      ${compensation && compensation.benefits ? `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 0.5rem;">
          <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">Your Rights:</div>
          <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
            ${compensation.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${eligible ? `
        <div class="result-actions">
          <button class="btn btn-primary" onclick="prefillClaimForm(${JSON.stringify(flight).replace(/"/g, '&quot;')})">
            Submit Claim
          </button>
        </div>
      ` : ''}
    </div>
  `;

  resultsDiv.style.display = 'block';
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// TEST SCENARIOS
// ============================================
async function testScenario(scenario) {
  const resultsDiv = document.getElementById('flightResults');

  try {
    resultsDiv.style.display = 'none';

    const response = await fetch(`${API_BASE}/test-scenario/${scenario}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch scenario');
    }

    // Display scenario results
    const scenarioData = result.data;
    const flightData = {
      ...scenarioData.flight,
      flightNumber: scenarioData.flight.flightNumber,
      airline: scenarioData.flight.airline,
      route: `${scenarioData.flight.departure} → ${scenarioData.flight.arrival}`,
      status: scenarioData.flight.status,
      delay: scenarioData.flight.delay,
      delayMinutes: scenarioData.flight.delay,
      eligible: scenarioData.compensation.eligible,
      compensation: scenarioData.compensation,
      compensationDetails: scenarioData.compensation
    };

    displayFlightResults(flightData);
    showToast(`Test scenario loaded: ${scenario.replace('_', ' ')}`, 'success');
  } catch (error) {
    console.error('Error loading scenario:', error);
    showToast(error.message || 'Failed to load scenario', 'error');
  }
}

// ============================================
// CLAIMS SUBMISSION
// ============================================
document.getElementById('claimForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    flightNumber: document.getElementById('claimFlightNumber').value.trim().toUpperCase(),
    flightDate: document.getElementById('claimFlightDate').value,
    airline: document.getElementById('claimAirline').value.trim(),
    departure: document.getElementById('claimDeparture').value.trim().toUpperCase(),
    arrival: document.getElementById('claimArrival').value.trim().toUpperCase(),
    issueType: document.getElementById('claimIssueType').value,
    delayMinutes: parseInt(document.getElementById('claimDelay').value) || null
  };

  await submitClaim(formData);
});

async function submitClaim(formData) {
  const form = document.getElementById('claimForm');
  const submitBtn = form.querySelector('button[type="submit"]');

  try {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const response = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit claim');
    }

    // Show success message
    showToast(`Claim submitted! Reference: ${result.claimReference}`, 'success');

    // Reset form
    form.reset();

    // Switch to claims view after 2 seconds
    setTimeout(() => {
      showSection('claims');
    }, 2000);
  } catch (error) {
    console.error('Error submitting claim:', error);
    showToast(error.message || 'Failed to submit claim', 'error');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function prefillClaimForm(flight) {
  // Switch to claim section
  showSection('claim');

  // Prefill form fields
  document.getElementById('claimFlightNumber').value = flight.flightNumber || '';
  document.getElementById('claimFlightDate').value = flight.date || flight.flightDate || '';
  document.getElementById('claimAirline').value = flight.airline || '';
  document.getElementById('claimDeparture').value = flight.departure || '';
  document.getElementById('claimArrival').value = flight.arrival || '';
  document.getElementById('claimDelay').value = flight.delay || flight.delayMinutes || '';

  // Set issue type based on flight status
  if (flight.cancelled) {
    document.getElementById('claimIssueType').value = 'cancellation';
  } else if (flight.delay >= 180) {
    document.getElementById('claimIssueType').value = 'delay';
  }

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// CLAIMS VIEWING
// ============================================
async function loadClaims() {
  const claimsListDiv = document.getElementById('claimsList');

  try {
    claimsListDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading claims...</div>';

    const response = await fetch(`${API_BASE}/claims`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch claims');
    }

    displayClaims(result.claims);
  } catch (error) {
    console.error('Error loading claims:', error);
    claimsListDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>Failed to load claims. Please try again.</p>
      </div>
    `;
  }
}

function displayClaims(claims) {
  const claimsListDiv = document.getElementById('claimsList');

  if (!claims || claims.length === 0) {
    claimsListDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No Claims Yet</h3>
        <p>You haven't submitted any claims. Search for a flight to get started!</p>
        <button class="btn btn-primary mt-2" onclick="showSection('search')">
          Search Flights
        </button>
      </div>
    `;
    return;
  }

  claimsListDiv.innerHTML = claims.map(claim => `
    <div class="claim-card">
      <div class="claim-header">
        <div>
          <div class="claim-reference">${claim.claim_reference}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
            ${claim.flight_number} • ${formatDate(claim.flight_date)}
          </div>
        </div>
        <div class="claim-status ${claim.status}">
          ${claim.status}
        </div>
      </div>

      <div class="claim-details">
        <div class="claim-detail">
          <strong>Airline:</strong> ${claim.airline}
        </div>
        <div class="claim-detail">
          <strong>Route:</strong> ${claim.departure_airport} → ${claim.arrival_airport}
        </div>
        <div class="claim-detail">
          <strong>Issue:</strong> ${formatIssueType(claim.issue_type)}
        </div>
        ${claim.delay_minutes ? `
        <div class="claim-detail">
          <strong>Delay:</strong> ${formatDelay(claim.delay_minutes)}
        </div>
        ` : ''}
        ${claim.compensation_amount ? `
        <div class="claim-detail">
          <strong>Compensation:</strong> ${claim.compensation_currency} ${claim.compensation_amount}
        </div>
        ` : ''}
        <div class="claim-detail">
          <strong>Submitted:</strong> ${formatDateTime(claim.created_at)}
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');

  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDelay(minutes) {
  if (!minutes || minutes === 0) return 'On time';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatIssueType(issueType) {
  const types = {
    'delay': 'Flight Delayed',
    'cancellation': 'Flight Cancelled',
    'denied_boarding': 'Denied Boarding',
    'missed_connection': 'Missed Connection'
  };
  return types[issueType] || issueType;
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Set default flight date to today
  const today = new Date().toISOString().split('T')[0];
  const flightDateInput = document.getElementById('flightDate');
  if (flightDateInput) {
    flightDateInput.value = today;
    flightDateInput.max = today; // Can't search future flights beyond today
  }

  const claimDateInput = document.getElementById('claimFlightDate');
  if (claimDateInput) {
    claimDateInput.max = today;
  }

  // Show hero section by default
  showSection('hero');

  console.log('TravelComp initialized successfully!');
});

// ============================================
// PWA INSTALLATION
// ============================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button if you want to add one
  console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
  showToast('App installed! You can now use TravelComp offline.', 'success');
});

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
