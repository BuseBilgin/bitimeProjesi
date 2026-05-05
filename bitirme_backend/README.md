# Pill Reminder Backend

A Node.js backend for a pill reminder application with proactive risk analysis using OpenFDA API.

## Features

- User authentication with JWT
- Medication management with proactive risk analysis
- **OpenFDA API Integration** for drug validation and interaction checking
- Known drug interactions database
- Allergy checking system
- MySQL database with encrypted data storage
- RESTful API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=pill_reminder
   JWT_SECRET=your_jwt_secret
   OPENFDA_API_URL=https://api.fda.gov/drug
   ```

3. Set up MySQL database:
   - Run the setup script: `npm run setup-db`
   - This will create the database and tables automatically

4. Start the server:
   ```bash
   npm start
   ```

## Database Configuration

The application is configured to connect to MySQL with the following settings:
- Host: BGRB
- Port: 3306
- User: root
- Password: 347834
- Database: pill_reminder

## Testing

Run tests with:
```bash
npm test
```

Test the server health:
```bash
node test_server.js
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Medications (requires authentication)
- POST /api/medications - Add medication with interaction & allergy checks
- GET /api/medications - Get user's medications
- PUT /api/medications/:id - Update medication
- DELETE /api/medications/:id - Delete medication

## OpenFDA Integration

The system uses OpenFDA API for:

1. **Drug Validation**: Verifies drug names against FDA database
2. **Adverse Events Check**: Detects potential interactions from real adverse event data
3. **Known Interactions**: Includes hardcoded critical drug interactions
4. **Allergy Alerts**: Checks user allergies against new medications

### Example Interaction Response:
```json
{
  "message": "Alerts detected before adding medication",
  "alerts": [
    {
      "medication": {...},
      "type": "interaction",
      "description": "Increased risk of bleeding",
      "severity": "high",
      "source": "Known Interactions Database"
    }
  ],
  "recommendation": "Please consult with your healthcare provider"
}
```

## Testing

Run tests with:
```bash
npm test
```