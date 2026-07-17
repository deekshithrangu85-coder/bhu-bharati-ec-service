# Bhu Bharati EC Automation API

A high-performance REST API that automates the retrieval and download of **Encumbrance Certificate (EC)** documents from the **Bhu Bharati Telangana Portal**.

This project leverages **Node.js**, **Express.js**, and **Playwright's APIRequestContext** to interact directly with the portal's backend APIs, eliminating the need for browser-based UI automation after authentication.

---

## Features

- API-level automation using Playwright
- Session persistence using saved authentication state
- Automatic CSRF token handling
- Dynamic District, Mandal, Village, Survey, and Khata resolution
- Direct EC PDF generation and download
- RESTful API endpoint
- Temporary file cleanup after download
- Mock mode for local development
- Production mode for live Bhu Bharati portal
- Robust error handling and logging

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Backend Runtime |
| Express.js | REST API Framework |
| Playwright | API-level Automation |
| Chromium | Secure Network Context |
| dotenv | Environment Configuration |
| UUID | Unique File Naming |
| CORS | Cross-Origin Resource Sharing |

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deekshithrangu85-coder/bhu-bharati-ec-service.git
   cd bhu-bharati-ec-service
   ```

2. **Install dependencies:**
   This project utilizes Playwright browser automation. Running `npm install` will automatically invoke the postinstall hook and download the required Playwright Chromium browser binaries:
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and configure the variables:
   ```env
   PORT=3000
   TARGET_URL=https://bhubharati.telangana.gov.in/citizenDashboard
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

---

## Project Architecture

```
                    Client
            (Postman / Frontend)
                     │
                     ▼
          POST /api/ec/download
                     │
                     ▼
             Express Router
                     │
                     ▼
             EC Controller
                     │
                     ▼
         API Scraper Service
                     │
                     ▼
        Bhu Bharati Portal APIs
                     │
                     ▼
         Generate EC Certificate
                     │
                     ▼
            Download PDF File
                     │
                     ▼
         Stream PDF to Client
```

---

## Project Structure

```
bhu-bharati-ec-service/
│
├── controllers/
│   └── ecController.js             # Handles requests and streams the PDF file
│
├── routes/
│   └── ecRoutes.js                 # API route mapping (/api/ec/download)
│
├── scripts/                        # Utility & diagnostic scripts (formerly at root)
│   ├── saveSession.js              # Interactively saves the authenticated session
│   ├── check_session.js             # Verifies session validity
│   ├── launch_with_session.js       # Launches Chromium with saved state for debug
│   └── (dump files & test tools)
│
├── services/
│   ├── apiScraperService.js        # Direct HTTP/API-level scraper logic (no browser UI page)
│   └── playwrightService.js        # Browser UI-level automation logic (Chromium page simulation)
│
├── sessions/
│   └── state.json                  # Saved authentication cookies and CSRF tokens
│
├── Download/                       # Local temporary store for generated PDFs
│
├── server.js                       # Express application bootstrap and mock endpoints
├── package.json                    # Project dependencies and script runner commands
├── swagger.json                    # Swagger OpenAPI definitions
└── README.md                       # Project documentation
```

---

## Workflow

```
Load Saved Session
        │
        ▼
Read Authentication Cookies
        │
        ▼
Extract CSRF Token
        │
        ▼
Resolve District ID
        │
        ▼
Resolve Mandal ID
        │
        ▼
Resolve Village ID
        │
        ▼
Resolve Survey ID
        │
        ▼
Resolve Khata ID
        │
        ▼
Generate EC Certificate
        │
        ▼
Download PDF
        │
        ▼
Save Temporarily
        │
        ▼
Return PDF Response
        │
        ▼
Delete Temporary File
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/bhu-bharati-ec-service.git

cd bhu-bharati-ec-service
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
HEADLESS=true
TARGET_URL=https://bhubharati.telangana.gov.in

# EC Retrieval Automation Mode. Options:
# api     - (Default) Direct REST API/JSON-level requests (faster, runs headlessly)
# browser - Full browser simulation (fills forms, triggers events, enables UI search)
AUTOMATION_MODE=api
```

---

## Run Application

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# API Documentation

## Download EC

**POST**

```
/api/ec/download
```

### Request Body

```json
{
    "district":"Rangareddy",
    "mandal":"Serilingampalle",
    "village":"Kancha Gachibowli",
    "surveyNo":"12/1/A/1/2",
    "khataNo":"60001"
}
```

---

### Success Response

Returns

```
application/pdf
```

The downloaded Encumbrance Certificate.

---

### Error Response

```json
{
    "success": false,
    "message": "Could not find Survey Number."
}
```

---

# How It Works

Instead of automating browser clicks or driving a browser UI, this project communicates **directly** with the backend HTTP/REST endpoints of the Bhu Bharati portal.

The workflow is:
1. **Load Session:** Retrieves saved cookie/CSRF authentication state.
2. **Resolve IDs:** Calls backend select-dropdown API endpoints to resolve structural names to portal IDs:
   - District ID
   - Mandal ID
   - Village ID
   - Survey ID
   - Khata ID
3. **Execute Search:** Posts the resolved parameters to cache the request in the portal session.
4. **Generate & Download:** Triggers the document generation and streams the resulting PDF directly to the client.

This API-level execution is highly robust, lightweight, and completes in a fraction of the time compared to browser-based UI automation.

### The Role of Playwright in API Automation
Although this project does **not** perform page-level browser automation (no pages or UI elements are loaded/clicked during standard service requests), it leverages **Playwright's `APIRequestContext`** internally for the following reasons:
- **Trusted Network Context:** To make requests via Chromium's actual network engine. This automatically provides realistic TLS finger-printing, headers, and connection structures, which bypasses modern anti-bot protections (such as Cloudflare) that flag standard HTTP clients like Axios or Fetch.
- **Automatic State Management:** Cookies and rotated session states are managed natively by Playwright and easily updated in `sessions/state.json`.

---

# Session Management

Authentication is maintained using Playwright's saved storage state in `sessions/state.json`.

To manage and debug sessions, the project provides the following convenient npm commands:

| Command | Script File | Description |
|---------|-------------|-------------|
| `npm run session:save` | `scripts/saveSession.js` | Launches a visible Chromium window to log in manually. Once logged in, press ENTER in the terminal to save state.json. |
| `npm run session:check` | `scripts/check_session.js` | Automated script to verify if the saved session is still valid. |
| `npm run session:launch` | `scripts/launch_with_session.js` | Launches Chromium with the saved state loaded, allowing you to manually inspect portal state/debug. |

---

# Error Handling

The application handles:

- Missing request parameters
- Invalid District names
- Invalid Mandal names
- Invalid Village names
- Invalid Survey numbers
- Invalid Khata numbers
- Session expiration
- CSRF token changes
- Network failures
- PDF download failures
- Temporary file cleanup

---

# Example Request

```bash
curl -X POST http://localhost:3000/api/ec/download \
-H "Content-Type: application/json" \
-d '{
"district":"Rangareddy",
"mandal":"Serilingampalle",
"village":"Kancha Gachibowli",
"surveyNo":"12/1/A/1/2",
"khataNo":"60001"
}'
```

---

# Performance Highlights

- No browser UI interaction after authentication
- API-level communication
- Fast response time
- Lightweight execution
- Automatic cleanup
- Minimal memory usage
- Reusable authenticated sessions

---

# Future Improvements

- Docker support
- Swagger UI integration
- JWT authentication
- Redis session storage
- Batch EC downloads
- Retry mechanism
- Logging with Winston
- Rate limiting
- Unit and Integration tests
- CI/CD pipeline with GitHub Actions

---

# License

This project is intended for educational and automation purposes.

Ensure compliance with the terms of service of the Bhu Bharati portal before using this project in production.

---

# Author

**Deekshith Rangu**

- GitHub: gitclone https://github.com/your-username/bhu-bharati-ec-service.git

---

## Star the Repository

If you found this project useful, consider giving it a ⭐ on GitHub to support the project.
