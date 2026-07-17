# 🚀 Bhu Bharati EC Automation API

> A high-performance REST API that automates the retrieval and download of **Encumbrance Certificate (EC)** documents from the **Bhu Bharati Telangana Portal** using **API-level automation**.

Instead of automating browser interactions, this project communicates directly with the portal's backend APIs through **Playwright's `APIRequestContext`**, resulting in significantly faster execution, lower resource usage, and improved reliability.

---

## 📖 Overview

The Bhu Bharati portal requires users to manually navigate through multiple dependent dropdowns and generate an Encumbrance Certificate (EC). This project automates the entire workflow by interacting directly with the portal's backend services after authentication.

### Key Benefits

- ⚡ API-level automation (No browser UI interaction after authentication)
- 🔒 Persistent authenticated sessions
- 🛡 Automatic CSRF token management
- 📄 Direct EC PDF generation and download
- 📦 Lightweight and scalable architecture
- 🔄 Automatic temporary file cleanup
- 📝 Swagger API documentation
- ⚙ Robust error handling and logging

---

# 🏗 Architecture

```text
                    Client
           (Postman / Frontend)
                     │
                     ▼
          POST /api/ec/download
                     │
                     ▼
            Express REST API
                     │
                     ▼
             EC Controller
                     │
                     ▼
        API Scraper Service
                     │
                     ▼
     Bhu Bharati Backend APIs
                     │
                     ▼
         Generate EC Document
                     │
                     ▼
          Download PDF Response
                     │
                     ▼
          Stream PDF to Client
```

---

# ✨ Features

- RESTful API architecture
- API-level automation using Playwright
- Session persistence using Storage State
- Automatic CSRF token extraction
- Dynamic resolution of:
  - District
  - Mandal
  - Village
  - Survey Number
  - Khata Number
- Direct PDF generation
- Automatic cleanup of temporary files
- Production & Mock mode support
- Session validation utilities
- Detailed logging
- Swagger documentation

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| Playwright | APIRequestContext |
| Chromium | Trusted Network Context |
| dotenv | Environment Variables |
| UUID | Unique File Naming |
| Swagger | API Documentation |
| CORS | Cross-Origin Resource Sharing |

---

# 📂 Project Structure

```text
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
├── scripts/
│   ├── saveSession.js
│   ├── check_session.js
│   └── launch_with_session.js
│
├── sessions/
│   └── state.json
│
├── Download/
│
├── server.js
├── package.json
├── swagger.json
└── README.md
```

---

# ⚙ Installation

## Prerequisites

- Node.js 20+
- npm
- Playwright
- Valid Bhu Bharati authenticated session

---

## Clone Repository

```bash
git clone https://github.com/deekshithrangu85-coder/bhu-bharati-ec-service.git

cd bhu-bharati-ec-service
```

---

## Install Dependencies

```bash
npm install
```

Playwright will automatically download the required Chromium binaries.

---

## Configure Environment Variables

Create a `.env` file.

```env
PORT=3000

HEADLESS=true

TARGET_URL=https://bhubharati.telangana.gov.in

AUTOMATION_MODE=api
```

Available automation modes:

| Mode | Description |
|------|-------------|
| api | API-level automation (Recommended) |
| browser | Browser UI automation |

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

# 📑 Available Scripts

| Command | Description |
|----------|-------------|
| npm start | Start production server |
| npm run dev | Development mode |
| npm run session:save | Save authenticated session |
| npm run session:check | Validate saved session |
| npm run session:launch | Launch browser using saved session |

---

# 📚 API Documentation

Swagger UI

```
http://localhost:3000/api-docs
```

---

## Download EC

**POST**

```
/api/ec/download
```

### Request Body

```json
{
  "district": "Rangareddy",
  "mandal": "Serilingampalle",
  "village": "Kancha Gachibowli",
  "surveyNo": "12/1/A/1/2",
  "khataNo": "60001"
}
```

---

### Success Response

```
application/pdf
```

Returns the generated Encumbrance Certificate.

---

### Error Response

```json
{
  "success": false,
  "message": "Could not find Survey Number."
}
```

---

# 🔄 Workflow

```text
Load Saved Session
        │
        ▼
Read Authentication State
        │
        ▼
Extract CSRF Token
        │
        ▼
Resolve District
        │
        ▼
Resolve Mandal
        │
        ▼
Resolve Village
        │
        ▼
Resolve Survey
        │
        ▼
Resolve Khata
        │
        ▼
Generate EC
        │
        ▼
Download PDF
        │
        ▼
Stream Response
        │
        ▼
Delete Temporary File
```

---

# ⚡ How It Works

The service communicates directly with the Bhu Bharati backend APIs instead of interacting with browser UI components.

### Processing Steps

1. Load authenticated session.
2. Extract authentication cookies and CSRF token.
3. Resolve District ID.
4. Resolve Mandal ID.
5. Resolve Village ID.
6. Resolve Survey Number.
7. Resolve Khata Number.
8. Submit EC request.
9. Download PDF.
10. Stream PDF to client.
11. Remove temporary file.

---

# 🔐 Session Management

Authentication is maintained using Playwright Storage State.

Session information is stored in:

```
sessions/state.json
```

Generate a new session:

```bash
npm run session:save
```

Validate session:

```bash
npm run session:check
```

Launch browser with saved session:

```bash
npm run session:launch
```

---

# 🛡 Error Handling

The application handles:

- Missing request parameters
- Invalid District
- Invalid Mandal
- Invalid Village
- Invalid Survey Number
- Invalid Khata Number
- Session expiration
- CSRF token rotation
- Portal validation errors
- Network failures
- PDF download failures
- Automatic temporary file cleanup

---

# 🚀 Performance Highlights

- API-level execution
- No browser interaction after authentication
- Fast EC retrieval
- Low memory consumption
- Persistent authenticated sessions
- Automatic cleanup
- Lightweight architecture

---

# 🔮 Future Enhancements

- Docker support
- Redis session storage
- Batch EC downloads
- Retry mechanism
- Winston logging
- Rate limiting
- Unit & Integration testing
- GitHub Actions CI/CD
- Monitoring & Metrics

---

# 📜 Disclaimer

This project was developed for educational and research purposes.

Users are responsible for complying with the terms of service of the Bhu Bharati portal and all applicable laws before using this software.

---

# 👨‍💻 Author

**Deekshith Rangu**

- GitHub: https://github.com/deekshithrangu85-coder

---

## ⭐ Support

If you found this project helpful, consider giving it a **Star ⭐** on GitHub.
