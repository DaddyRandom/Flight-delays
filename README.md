# ✈️ TravelComp - Flight Compensation Tracker

A full-stack web application for tracking flight compensation eligibility under EU261 and US DOT regulations. Search flights, calculate compensation, and submit claims - all in one modern, mobile-responsive Progressive Web App.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## 🌟 Features

- **Real-time Flight Search**: Search for flights using flight number and date
- **Compensation Calculator**: Automatic calculation based on EU261 and US DOT regulations
- **Claims Management**: Submit and track compensation claims
- **Test Scenarios**: Built-in test scenarios for demonstration
- **Mobile-First Design**: Fully responsive with modern glassmorphism UI
- **Progressive Web App**: Installable on mobile devices with offline support
- **Database Persistence**: SQLite for development, PostgreSQL-ready for production

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Flight-delays
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your AviationStack API key (optional for testing):
   ```
   AVIATION_API_KEY=your_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3001
   ```

## 📋 API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Flight Search
```
GET /api/flight/:flightNumber?date=YYYY-MM-DD
```
Search for flight information and compensation eligibility.

**Example:**
```bash
curl "http://localhost:3001/api/flight/BA123?date=2024-11-10"
```

### Test Scenarios
```
GET /api/test-scenario/:scenario
```
Get predefined test scenarios.

**Available scenarios:**
- `delayed_3h` - 3-hour delay (US domestic)
- `delayed_4h` - 4-hour delay (international)
- `cancelled` - Cancelled flight
- `short_delay` - 1-hour delay (not eligible)
- `weather_delay` - Weather-related delay (extraordinary circumstances)

**Example:**
```bash
curl "http://localhost:3001/api/test-scenario/delayed_4h"
```

### Submit Claim
```
POST /api/claims
Content-Type: application/json

{
  "flightNumber": "BA123",
  "flightDate": "2024-11-10",
  "airline": "British Airways",
  "departure": "LHR",
  "arrival": "JFK",
  "issueType": "delay",
  "delayMinutes": 240
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "flightNumber": "BA123",
    "flightDate": "2024-11-10",
    "airline": "British Airways",
    "departure": "LHR",
    "arrival": "JFK",
    "issueType": "delay",
    "delayMinutes": 240
  }'
```

### Get All Claims
```
GET /api/claims
```
Retrieve all submitted claims.

### Get Claim by ID
```
GET /api/claims/:id
```
Retrieve a specific claim by ID.

### Get Claim by Reference
```
GET /api/claim-reference/:reference
```
Retrieve a claim by its reference number (e.g., TC-20241113-A1B2C).

## 💰 Compensation Rules

### EU261 Regulation

The application implements EU261 compensation rules:

| Distance | Compensation |
|----------|--------------|
| ≤ 1,500 km | €250 |
| 1,500 - 3,500 km | €400 |
| > 3,500 km | €600 |

**Requirements:**
- Flight delayed 3+ hours or cancelled
- Departs from EU or arrives in EU with EU airline
- Not due to extraordinary circumstances

**Extraordinary Circumstances (not eligible):**
- Weather conditions
- Air traffic control restrictions
- Security risks
- Political instability

### US DOT Regulations

**Cancellations:**
- Full refund to original payment method
- Rebooking on next available flight

**Significant Delays (3+ hours):**
- Meal vouchers
- Hotel accommodation for overnight delays
- Possible refund eligibility

**Denied Boarding:**
- Up to 400% of one-way fare (max $1,550) for delays 2+ hours
- Up to 200% of one-way fare (max $775) for delays 1-2 hours

## 🎨 Frontend Features

### Mobile-Responsive Design
- Dark theme with blue/teal accents
- Glassmorphism effects
- Touch-friendly (44px+ tap targets)
- Smooth animations and transitions

### Progressive Web App (PWA)
- Installable on mobile devices
- Offline functionality with service worker
- App-like experience on mobile

### User Interface Sections
1. **Hero/Landing** - Value proposition and how it works
2. **Flight Search** - Search and view flight compensation eligibility
3. **Submit Claim** - Form to submit compensation claims
4. **My Claims** - View and track submitted claims

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Claims Table
```sql
CREATE TABLE claims (
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
);
```

### Flight Searches Cache
```sql
CREATE TABLE flight_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_number TEXT NOT NULL,
  flight_date DATE NOT NULL,
  airline TEXT,
  status TEXT,
  delay_minutes INTEGER,
  raw_data TEXT,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-Origin Resource Sharing enabled
- **Input Validation**: All user inputs validated
- **SQL Injection Prevention**: Parameterized queries
- **Environment Variables**: Sensitive data in .env

## 📱 Testing the Application

### Using Test Scenarios

The easiest way to test is using the built-in test scenarios:

1. Navigate to the **Search Flight** section
2. Click one of the test scenario buttons:
   - **3h Delay** - Shows eligible US flight
   - **4h Delay** - Shows eligible EU flight
   - **Cancelled** - Shows cancelled flight
   - **Short Delay** - Shows ineligible flight

### Manual Flight Search

Without an API key, the app generates realistic mock data:

1. Enter any flight number (e.g., "AA123", "BA456")
2. Select a date
3. Click "Search Flight"
4. View compensation eligibility

### Submitting a Claim

1. Go to **Submit Claim** section
2. Fill in flight details
3. Click "Submit Claim"
4. View claim in **My Claims** section

## 🚢 Deployment

### Railway.app

1. **Connect GitHub repository**
2. **Set environment variables:**
   ```
   NODE_ENV=production
   PORT=3001
   AVIATION_API_KEY=your_api_key
   DATABASE_URL=./travelcomp.db
   ```
3. **Deploy automatically** on push to main branch

### Render.com

1. **Create new Web Service**
2. **Build Command:** `npm install`
3. **Start Command:** `node server.js`
4. **Environment Variables:**
   - Same as Railway above
5. **Deploy**

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production database (PostgreSQL recommended)
- [ ] Add real AviationStack API key
- [ ] Configure CORS for your domain
- [ ] Setup monitoring (e.g., Sentry)
- [ ] Enable HTTPS
- [ ] Setup custom domain (optional)

## 📁 Project Structure

```
Flight-delays/
├── server.js              # Express server and API routes
├── database.js            # Database schema and queries
├── compensation.js        # Compensation calculation logic
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── README.md             # This file
└── public/               # Frontend files
    ├── index.html        # Main HTML file
    ├── styles.css        # Responsive CSS
    ├── app.js            # Frontend JavaScript
    ├── manifest.json     # PWA manifest
    ├── service-worker.js # Service worker for offline support
    └── favicon.svg       # App icon
```

## 🔧 Technology Stack

**Backend:**
- Express.js - Web framework
- better-sqlite3 - Database (development)
- axios - HTTP client for API calls
- helmet - Security middleware
- cors - CORS middleware
- express-rate-limit - Rate limiting

**Frontend:**
- Vanilla HTML/CSS/JavaScript - No frameworks
- Progressive Web App (PWA)
- Service Worker for offline support
- Modern CSS with glassmorphism

**APIs:**
- AviationStack API (optional, falls back to mock data)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Locked
```bash
# Remove database and restart
rm travelcomp.db*
npm start
```

### API Key Issues
- The app works without an API key using mock data
- To use real flight data, sign up at https://aviationstack.com
- Free tier: 100 requests/month

### PWA Not Installing
- Ensure you're using HTTPS (required for PWA)
- Check that manifest.json is accessible
- Verify service worker is registered

## 📝 Future Enhancements

- [ ] User authentication (JWT)
- [ ] Email notifications
- [ ] Document upload (boarding passes, receipts)
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Export claims to PDF

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Development

### Running in Development Mode

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Running Tests

```bash
npm test
```

### Code Style

- ES6+ JavaScript
- 2-space indentation
- Semicolons required
- Single quotes for strings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for travelers seeking fair compensation**
