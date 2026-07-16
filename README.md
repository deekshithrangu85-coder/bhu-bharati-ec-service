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
│   └── ecController.js
│
├── routes/
│   └── ecRoutes.js
│
├── services/
│   ├── apiScraperService.js
│   └── playwrightService.js
│
├── sessions/
│   └── state.json
│
├── downloads/
│
├── server.js
├── package.json
├── openapi.json
└── README.md
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

Instead of automating browser clicks, this project communicates directly with the internal APIs used by the Bhu Bharati portal.

The service:

- Loads a previously authenticated session.
- Reads cookies and CSRF tokens.
- Resolves District IDs.
- Resolves Mandal IDs.
- Resolves Village IDs.
- Resolves Survey IDs.
- Resolves Khata IDs.
- Generates the EC document.
- Downloads the generated PDF.
- Streams the file to the client.
- Removes temporary files automatically.

This approach significantly improves speed and reliability compared to browser-based automation.

---

# Session Management

Authentication is maintained using Playwright's saved storage state.

```
sessions/
    state.json
```

The application reuses this session to avoid repeated logins.

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
