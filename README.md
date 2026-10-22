 <div align="center">

# 🏋️ GymFlow SaaS

### Smart Gym Management System

**Manage members. Track payments. Automate renewals. Simplify gym operations.**

A full-stack MERN application designed to help gym owners manage members, memberships, payments, pending fees, and AI-powered diet plans from one centralized dashboard.

<p>
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<p>
  <img src="https://img.shields.io/badge/Architecture-MERN_Stack-blue?style=flat-square" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Status-Development-orange?style=flat-square" alt="Development Status" />
</p>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#-application-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Application Modules](#-application-modules)
- [Security Best Practices](#-security-best-practices)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 🚀 Overview

**GymFlow SaaS** is a gym management platform built with the MERN stack to simplify the daily operations of fitness centers and gyms.

Traditional gym management often involves manually tracking member records, membership expiry dates, payments, and outstanding fees. GymFlow brings these activities together in a centralized application.

The platform helps gym owners organize member information, monitor revenue-related records, manage membership packages, and communicate with members about renewals and pending payments.

It also includes an AI-powered diet planner designed to generate personalized Indian diet suggestions using Google Gemini.

### 🎯 Project Objectives

- Simplify gym administration and member management.
- Make membership and payment tracking easier.
- Reduce manual effort in identifying expiring memberships.
- Help gym owners follow up on outstanding payments.
- Provide convenient access to membership information.
- Offer AI-assisted diet suggestions to support member engagement.

---

## ✨ Key Features

### 📊 1. Dashboard & Analytics

- View key gym statistics in one place.
- Monitor membership and payment information.
- Get a centralized overview of gym operations.

### 👥 2. Member Management

- Add and manage member records.
- Search and filter members.
- Maintain membership-related information.
- Access member details from the dashboard.

### 🎟️ 3. Membership Management

- Organize membership packages.
- Manage membership duration and expiry information.
- Track renewal requirements.
- Help identify memberships that need attention.

### 💰 4. Payment & Pending Fee Tracking

- Record membership payment information.
- Track paid and outstanding fees.
- Monitor pending dues, also known as *Udhaari*.
- Keep payment records organized for follow-up.

### 💬 5. WhatsApp Reminder Support

- Generate pre-filled WhatsApp messages.
- Prepare reminders for membership expiry.
- Help gym owners follow up on pending payments.

*Reminder delivery depends on the implemented WhatsApp integration and the owner's action.*

### ⏰ 6. Automated Membership Expiry Tracking

- Use scheduled background tasks to check membership dates.
- Update membership statuses according to expiry rules.
- Reduce the need for manual status updates.

### 🔐 7. Authentication & Email OTP Verification

- JWT-based authentication for gym-owner access.
- Email OTP verification during registration.
- Protected access to authenticated functionality.

### 🤖 8. AI-Powered Diet Planner

- Integrate Google Gemini for AI-generated diet suggestions.
- Support personalized Indian diet recommendations.
- Provide an additional fitness-support feature within the platform.

*AI-generated suggestions are informational and should not replace professional medical or nutritional advice.*

### 🧑‍💻 9. Member Portal

- Allow members to check relevant membership details.
- Provide a convenient way to access membership information without relying entirely on the gym owner.

### ☁️ 10. Cloud Database Integration

- Use MongoDB Atlas for cloud-based data storage.
- Use Mongoose for schema definitions and database operations.
- Organize application data into manageable models.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Building the frontend user interface |
| Vite | Frontend development server and build tooling |
| Tailwind CSS | Responsive UI styling |
| Node.js | JavaScript runtime for the backend |
| Express.js | REST API and server-side routing |
| MongoDB Atlas | Cloud database |
| Mongoose | Database schemas, validation, and queries |
| JSON Web Token (JWT) | Authentication |
| Nodemailer | Email delivery and OTP verification |
| Node-cron | Scheduled background tasks |
| Google Gemini API | AI-powered diet suggestions |

---

## 🏗️ Application Architecture

GymFlow follows a client-server architecture using the MERN stack.

```text
                    ┌──────────────────┐
                    │      USERS       │
                    │ Gym Owners       │
                    │ Gym Members      │
                    └────────┬─────────┘
                             │
                             ▼
                 ┌─────────────────────┐
                 │    React + Vite     │
                 │  Tailwind CSS UI    │
                 └──────────┬──────────┘
                            │
                       HTTP / REST
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Node.js + Express │
                 │     REST API        │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      ┌────────────┐  ┌────────────┐  ┌────────────┐
      │  MongoDB   │  │ JWT Auth & │  │ Gemini AI  │
      │   Atlas    │  │ Email OTP  │  │    API     │
      └────────────┘  └────────────┘  └────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Node-cron Jobs  │
                  │ Expiry Tracking  │
                  └──────────────────┘
```

### 🔄 How the Application Works

1. A user interacts with the React frontend.
2. The frontend sends HTTP requests to the Express backend.
3. Backend routes and controllers process incoming requests.
4. Mongoose communicates with MongoDB to read or update data.
5. Authentication middleware protects applicable endpoints.
6. External services, such as email delivery and Gemini AI, handle their respective tasks.
7. Scheduled jobs check membership expiry according to configured rules.
8. The backend returns responses that the frontend displays to the user.

The exact execution flow depends on the implementation in the source code.

---

## 📂 Project Structure

```text
gymflow-saas/
│
├── backend/
│   ├── config/          # Configuration and database setup
│   ├── controllers/     # Request-handling logic
│   ├── middlewares/     # Authentication and request middleware
│   ├── models/          # Mongoose data models
│   ├── routes/          # API route definitions
│   ├── utils/           # Shared utilities
│   ├── seed.js          # Database seed script, if configured
│   ├── server.js        # Backend entry point
│   ├── package.json
│   └── .env             # Local environment variables (not committed)
│
├── web-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/         # API communication
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Application pages
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

*This structure reflects the project layout described above. Adjust it if your actual repository contains additional folders or different filenames.*

---

## ⚙️ Getting Started

Follow these steps to run GymFlow locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or a compatible MongoDB instance
- [Google AI Studio](https://aistudio.google.com/) API key for Gemini functionality
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjusende/gymflow-saas.git
cd gymflow-saas
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Replace each placeholder with your own configuration.

**Important:** Use an email provider's appropriate SMTP credentials or app password. Do not use your normal account password where an app password or other secure credential is required.

Start the backend:

```bash
npm run dev
```

If the `dev` script is not configured in your backend `package.json`, use the start command defined by your project.

### 3. Configure the Frontend

Open a new terminal from the project root:

```bash
cd web-frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Verify the Application

- Confirm that the backend starts without errors.
- Confirm that the database connection succeeds.
- Open the frontend in your browser.
- Test registration and login.
- Check the member and membership screens.
- Test payment tracking and reminders.
- Test Gemini functionality after configuring the API key.

Some features may require additional configuration or valid test data.

---

## 🔑 Environment Variables

| Variable | Description | Required for |
|---|---|---|
| `PORT` | Port used by the backend server | Backend |
| `MONGO_URI` | MongoDB connection string | Database |
| `JWT_SECRET` | Secret used to sign JWTs | Authentication |
| `EMAIL_USER` | Email sender account | OTP emails |
| `EMAIL_PASS` | SMTP credential or email app password | OTP emails |
| `GEMINI_API_KEY` | Google Gemini API key | AI diet planner |
| `NODE_ENV` | Runtime environment | Configuration |

### 🔒 Protect Your Credentials

- Never commit `.env` files to GitHub.
- Add environment files to `.gitignore`.
- Never expose backend secrets in frontend environment variables.
- Use strong secrets and rotate credentials if they are accidentally exposed.
- Keep API keys on the server whenever possible.

---

## 🔌 Application Modules

The backend is organized around these functional areas:

| Module | Responsibility |
|---|---|
| Authentication | Registration, login, and access control |
| Email Verification | OTP delivery and account verification |
| Dashboard | Gym statistics and summary information |
| Members | Member record management |
| Membership Plans | Membership package management |
| Payments | Payment records and pending dues |
| Member Portal | Member-facing membership information |
| AI Diet Planner | Gemini-powered diet suggestions |
| Scheduled Tasks | Membership expiry checks |

For the exact API paths, HTTP methods, and request formats, refer to the backend route files.

---

## 🔐 Security Best Practices

Security is important when an application manages personal information and payment records.

Recommended practices include:

- Validate user input on the server.
- Authenticate protected API requests.
- Enforce authorization at the backend, not only in the frontend.
- Ensure each gym owner can access only their permitted records.
- Hash passwords securely using bcrypt or an appropriate password-hashing algorithm.
- Protect OTP verification and login endpoints against abuse.
- Configure CORS for trusted frontend origins.
- Apply suitable rate limits to sensitive endpoints.
- Avoid returning secrets or internal error details in API responses.
- Validate environment variables during startup.
- Use HTTPS in production.

These are recommended security practices; verify which are already implemented in the codebase before describing them as existing features.

---

## 🗺️ Future Enhancements

Potential improvements for future versions include:

- [ ] Online payment gateway integration.
- [ ] Detailed revenue and membership analytics.
- [ ] PDF invoices and payment receipts.
- [ ] Automated email and WhatsApp notification workflows.
- [ ] Trainer scheduling and workout-plan management.
- [ ] Attendance tracking using QR codes.
- [ ] More detailed member progress tracking.
- [ ] Automated tests for important API endpoints.
- [ ] CI/CD pipeline for deployment.
- [ ] Role-based access for gym owners, trainers, and staff.

These are proposed enhancements, not claims about currently implemented functionality.

---

## 👨‍💻 Author

**Sanjay Sende**

B.Tech Computer Science Engineering | Full-Stack Developer

- 🌐 **Portfolio:** [sanjay-sportfolio.vercel.app](https://sanjay-sportfolio.vercel.app/)
- 💻 **GitHub:** [github.com/Sanjusende](https://github.com/Sanjusende)
- 🔗 **LinkedIn:** [Visit my LinkedIn profile](https://www.linkedin.com/)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

<div align="center">

### Built with ❤️ using the MERN Stack

*Making everyday gym management simpler and smarter.*

</div>
