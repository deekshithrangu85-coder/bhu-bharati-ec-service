<div align="center">

# 🚀 Bhu Bharati EC Automation API

### ⚡ High-Performance REST API for Automated Encumbrance Certificate (EC) Retrieval

![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-5.x-black?style=for-the-badge&logo=express)
![Playwright](https://img.shields.io/badge/Playwright-Automation-green?style=for-the-badge&logo=playwright)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)

</div>

---

## 📖 Overview

**Bhu Bharati EC Automation API** is a RESTful backend application that automates the retrieval and download of **Encumbrance Certificate (EC)** documents from the **Bhu Bharati Telangana Portal**.

Unlike traditional browser automation, this project communicates directly with the portal's backend APIs using **Playwright's APIRequestContext**, resulting in significantly faster execution and reduced browser interaction after authentication.

---

# ✨ Features

- 🚀 API-Level Automation
- 🔐 Persistent Session Management
- 🔄 Automatic CSRF Token Synchronization
- 📍 Dynamic District, Mandal & Village Resolution
- 📄 Automatic EC PDF Download
- ⚡ High-Speed HTTP Requests
- 🛡️ Robust Error Handling
- 🧹 Automatic Temporary File Cleanup
- 🌐 Mock Mode for Local Development
- ☁️ Production Mode Support

---

# 🛠 Tech Stack

| Technology | Description |
|------------|-------------|
| 🟢 Node.js | Backend Runtime |
| ⚡ Express.js | REST API Framework |
| 🎭 Playwright | API-Level Automation |
| 🌍 Chromium | Secure Browser Network Context |
| 🔐 dotenv | Environment Configuration |
| 📦 UUID | Unique File Naming |
| 🌐 CORS | Cross-Origin Resource Sharing |

---

# 🏗 System Architecture

```text
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

# 📁 Project Structure

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
├── sessions/
│
├── downloads/
│
├── server.js
├── package.json
├── swagger.json
├── README.md
└── .env
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/deekshithrangu85-coder/bhu-bharati-ec-service.git

cd bhu-bharati-ec-service
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a **.env** file

```env
PORT=3000

HEADLESS=true

TARGET_URL=https://bhubharati.telangana.gov.in
```

---

## 4️⃣ Start Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

# 📡 API Endpoint

## Download Encumbrance Certificate

### POST

```
/api/ec/download
```

---

## 📥 Request Body

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

## 📤 Success Response

```
HTTP/1.1 200 OK

Content-Type: application/pdf
```

Returns the downloaded EC Certificate PDF.

---

## ❌ Error Response

```json
{
    "success": false,
    "message": "Could not find Survey Number."
}
```

---

# 🔄 Workflow

```text
Saved Session
      │
      ▼
Read Cookies
      │
      ▼
Read CSRF Token
      │
      ▼
District Lookup
      │
      ▼
Mandal Lookup
      │
      ▼
Village Lookup
      │
      ▼
Survey Lookup
      │
      ▼
Khata Lookup
      │
      ▼
Generate EC
      │
      ▼
Download PDF
      │
      ▼
Return Response
```

---

# ⚡ Performance

✅ API-Level Communication

✅ No Browser UI Interaction After Login

✅ Dynamic CSRF Token Rotation

✅ Session Persistence

✅ Fast PDF Retrieval

✅ Automatic Cleanup

---

# 🛡 Error Handling

The application handles:

- ✅ Missing Request Parameters
- ✅ Invalid District
- ✅ Invalid Mandal
- ✅ Invalid Village
- ✅ Invalid Survey Number
- ✅ Invalid Khata Number
- ✅ Session Expiration
- ✅ CSRF Token Changes
- ✅ Network Errors
- ✅ PDF Download Failures

---

# 🧪 Example cURL Request

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

# 🚀 Future Enhancements

- 🐳 Docker Support
- 📘 Swagger UI
- 🔐 JWT Authentication
- ⚡ Redis Session Cache
- 📦 Batch EC Downloads
- 🔁 Retry Mechanism
- 📊 Logging with Winston
- 🚦 Rate Limiting
- ✅ Unit Testing
- 🚀 GitHub Actions CI/CD

---

# 📜 License

This project is intended for educational and automation purposes.

Please ensure compliance with the **Bhu Bharati Portal Terms of Service** before deploying or using this project in production.

---

# 👨‍💻 Author

**Deekshith Rangu**

🐙 GitHub: https://github.com/deekshithrangu85-coder

---

<div align="center">

## ⭐ Support

If you found this project useful,

### ⭐ Star this repository

It helps others discover the project and supports future improvements.

**Happy Coding! 🚀**

</div>
