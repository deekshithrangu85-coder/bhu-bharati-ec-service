# Bhu Bharati EC Automation API Service

This Node.js backend service automates the retrieval and download of the Encumbrance Certificate (EC) from the Bhu Bharati portal and exposes it via a REST API.

To ensure safe testing and deployment, the service supports loading active session states (cookies/local storage) and includes a local mock portal simulation mode.

## Objective & Features
- **Session Reuse (No Re-login needed):** Loads active session cookies securely from `sessions/state.json` to bypass manual login pages and go directly to the EC details search.
- **Automated Property Search:** Automatically fills in form inputs (District, Mandal, Village, Survey No, Khata No) on the search page using Playwright.
- **Direct PDF Download:** Automatically detects, intercepts, and downloads the generated PDF, streaming it back to the client immediately in the HTTP API response.
- **Resource Management:** Automatic cleanup of downloaded temporary PDF files to prevent server storage bloat.
- **OpenAPI/Swagger Docs:** Interactive documentation exposed directly by the service.

---

## Technical Specifications
- **Runtime:** Node.js (v18+)
- **Automation Framework:** Playwright (Chromium)
- **API Framework:** Express.js
- **Primary API Endpoint:** `POST /api/ec/download`

---

## Configuration & Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3000
HEADLESS=true
# Use TARGET_URL to configure the portal destination.
# For local testing, omit or set to: http://localhost:3000/mock-search
# For production portal automation, set to: https://bhubharati.telangana.gov.in/citizenDashboard?Y3NyZnRva2Vu=<token>
TARGET_URL=http://localhost:3000/mock-search
```

---

## Quick Start & Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Session Handling (Bypassing Login Page):**
   To bypass the login page in production, you can first authenticate manually and save the session cookie state:
   - Run the manual login script:
     ```bash
     node saveSession.js
     ```
   - A browser window will open. Perform the manual login. Once you reach the Citizen Dashboard/Search EC Details page, press `ENTER` in your terminal to save the session state to `sessions/state.json`.

3. **Start the API Server:**
   ```bash
   npm run start
   ```

4. **Verify / Run Local E2E Tests:**
   You can run the verification script to spin up the server, send a mock POST request, execute the Playwright automation flow, verify download success, and shut down:
   ```bash
   node scratch/test_service.js
   ```

---

## API Documentation

### 1. Download Encumbrance Certificate
- **URL:** `/api/ec/download`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "district": "Rangareddy",
    "mandal": "Serilingampalle",
    "village": "Kancha Gachibowli",
    "surveyNo": "12/1/a/1/2",
    "khataNo": "60001"
  }
  ```
- **Responses:**
  - **200 OK:** Returns binary stream of `application/pdf` (attachment).
  - **400 Bad Request:** Missing or invalid search parameter structure.
  - **500 Internal Server Error:** Automation retrieval or streaming failure.

### 2. Retrieve Swagger Documentation
- **URL:** `/swagger.json`
- **Method:** `GET`
- **Response:** Raw OpenAPI 3.0 specification JSON schema.
