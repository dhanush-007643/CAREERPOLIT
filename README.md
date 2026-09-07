# CareerPilot Backend

> **Object-Oriented Analysis and Design (OOAD) for a Smart Hiring and Career Development Platform**

A production-ready, modular, and secure RESTful backend engineered in Node.js, Express, MongoDB Atlas, and Mongoose. CareerPilot bridges the gap between aspiring tech freshers and high-growth startups through AI-powered multi-attribute skill matching, an ATS hiring pipeline, interactive assessments, and dynamic career development roadmaps.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - `FRESHER`: Candidate profile, resume management, job search, application tracking, assessment evaluation, career roadmaps, invitations.
   - `STARTUP`: Company profile, job posting (Public/Private), candidate sourcing, ATS Kanban pipeline, interview scheduling.
   - `ADMIN`: Platform-wide governance, job/company moderation, system analytics and KPIs.

2. **AI-Powered Matching Engine**:
   - Multi-attribute weighted scoring algorithm:
     - **Required Skills Match**: 50%
     - **Preferred Skills Match**: 15%
     - **Experience Alignment**: 15%
     - **Education Match**: 10%
     - **Career Interests & Preferred Roles**: 10%
   - Instant candidate explanations (e.g., *"Strong match in React, Node.js. Missing Docker experience."*).
   - Extensible modular architecture for plug-and-play NLP / Sentence Transformers.

3. **Recruitment ATS Pipeline**:
   - `APPLIED` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `INTERVIEW` $\rightarrow$ `SELECTED` / `REJECTED`
   - Complete status history log on every transition.
   - Automated event-driven in-app notifications on stage changes.

4. **Career Development & Skill Assessments**:
   - Dynamic skill-gap analyzer identifying missing high-demand technologies.
   - Milestone-based learning roadmap with curated projects and documentation resources.
   - Automated timed multiple-choice assessments with skill verification upon passing.

5. **Cloud Resume Storage & Multer Processing**:
   - Direct streaming to Cloudinary with secure URLs and metadata tracking.
   - File size validation and MIME filtering (`.pdf`, `.doc`, `.docx`).

6. **Enterprise Security & Reliability**:
   - Helmet HTTP header protection
   - Strict CORS whitelist
   - Express Rate Limiting (Global and Authentication specific)
   - Centralized error handler with standardized JSON envelopes
   - Joi input validation schemas
   - Compound MongoDB unique indexes preventing duplicate relationships

---

## 📐 Architecture Overview (Clean Layered OOAD)

```
backend/
├── src/
│   ├── ai/                  # AI Matching Engine & Similarity Calculators
│   ├── config/              # Database (Mongoose), Cloudinary & Environment config
│   ├── controllers/         # HTTP Request Coordination Layer
│   ├── middleware/          # JWT Auth, RBAC, Rate Limiting, Error Handling, Uploads
│   ├── models/              # Mongoose Domain Schemas & Compound Indexes
│   ├── repositories/        # BaseRepository & Specialized Data Access Layer
│   ├── routes/              # Express REST Endpoints
│   ├── services/            # Core Business Logic & Domain Entities
│   ├── utils/               # ApiResponse wrapper, Custom Errors, Constants, Logger
│   ├── validators/          # Joi Request Validation Schemas
│   └── app.js               # Express application pipeline configuration
├── scripts/
│   └── seed.js              # Full database seeder with demo candidates, jobs & tests
├── tests/                   # Jest + Supertest test suites with MongoMemoryServer
├── server.js                # Server entry point & graceful shutdown listener
├── Dockerfile               # Production multi-stage Alpine Dockerfile
├── docker-compose.yml       # Local development & production Docker Compose
├── API_DOCUMENTATION.md     # Complete REST API endpoint reference
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local MongoDB instance (v6.0+)
- Cloudinary account (optional for local dev/testing fallback)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/careerpilot?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

### 3. Seed Demo Data
Populate the database with demo users, companies, jobs, ATS pipelines, and assessments:
```bash
npm run seed
```

**Demo Credentials created by Seeder:**
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@careerpilot.io` | `Password123!` |
| **Startup** | `recruiter@techpulse.io` | `Password123!` |
| **Fresher** | `alex.johnson@example.com` | `Password123!` |

### 4. Run Locally
```bash
# Development mode with hot-reload:
npm run dev

# Production mode:
npm start
```
The API will be available at `http://localhost:5000/api`.

---

## 🧪 Testing Suite

Run the automated integration tests across all modules using Jest, Supertest, and `mongodb-memory-server` (isolated in-memory test database, no external connection required):

```bash
# Run all test suites
npm test

# Run tests with code coverage report
npm run test:coverage
```

---

## 🐳 Docker Deployment

### Run with Docker Compose
```bash
# Start backend and local MongoDB container
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## 📖 API Documentation Reference

For an exhaustive guide on all endpoints, payload structures, query filters, and response formats, please refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
