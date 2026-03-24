# V-Labs+ Backend API

Express.js + MongoDB REST API for the V-Labs+ Virtual Science Laboratory platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| Database | MongoDB (via Mongoose 8) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Dev server | nodemon |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
cp .env.example .env
# Edit MONGO_URI and JWT_SECRET

# 3. Seed the database with all labs
npm run seed

# 4. Start dev server
npm run dev

# 5. Open http://localhost:5000/health
```

---

## Environment Variables (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/vlabs` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | — |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new student |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | 🔒 JWT | Get current user profile |
| PUT | `/api/auth/profile` | 🔒 JWT | Update name / class |
| PUT | `/api/auth/change-password` | 🔒 JWT | Change password |
| POST | `/api/auth/logout` | 🔒 JWT | Logout (client deletes token) |

#### Register body
```json
{
  "name": "Sam Rozario",
  "email": "sam@school.in",
  "password": "Password123",
  "schoolClass": "Class 11 - Science"
}
```

#### Login body
```json
{ "email": "sam@school.in", "password": "Password123" }
```

#### Login / Register response
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "_id": "...",
    "name": "Sam Rozario",
    "email": "sam@school.in",
    "role": "student",
    "totalLabsCompleted": 0,
    "totalQuizScore": 0
  }
}
```

---

### Labs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/labs` | Public | List all labs. Filter: `?subject=physics&difficulty=easy` |
| GET | `/api/labs/subjects/summary` | Public | Count of labs per subject |
| GET | `/api/labs/:labId` | Public | Full lab detail (theory, quiz questions without answers) |
| GET | `/api/labs/:labId/stats` | Public | Attempt count, avg score, pass rate |
| POST | `/api/labs/:labId/quiz` | 🔒 JWT | Submit quiz answers, get graded result |
| POST | `/api/labs/:labId/simulate` | Optional | Log a simulation run |
| POST | `/api/labs` | 🔒 Admin | Create new lab |
| PUT | `/api/labs/:labId` | 🔒 Admin | Update lab |
| DELETE | `/api/labs/:labId` | 🔒 Admin | Soft-delete lab |

#### Quiz submission body
```json
{
  "answers": [
    { "questionIndex": 0, "selectedIndex": 2 },
    { "questionIndex": 1, "selectedIndex": 0 },
    { "questionIndex": 2, "selectedIndex": 1 }
  ],
  "timeSpent": 120
}
```

#### Quiz response
```json
{
  "success": true,
  "score": 67,
  "passed": true,
  "correctQ": 2,
  "totalQ": 3,
  "detailed": [
    {
      "questionIndex": 0,
      "selectedIndex": 2,
      "isCorrect": false,
      "correctIndex": 0,
      "explanation": "By Ohm's Law I = V/R. Doubling V doubles I."
    }
  ]
}
```

#### Subject filter values
`physics` | `chemistry` | `biology` | `mathematics` | `computer-science`

---

### Progress

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/progress/dashboard` | 🔒 JWT | Full stats + recent attempts |
| GET | `/api/progress/history` | 🔒 JWT | Paginated quiz history. `?page=1&limit=20` |
| GET | `/api/progress/leaderboard` | Public | Top 20 students by score |
| GET | `/api/progress/lab/:labId` | 🔒 JWT | Attempts for a single lab |

---

## Lab IDs (seeded)

| Subject | Lab ID |
|---------|--------|
| Physics | `physics-ohms-law` |
| Physics | `physics-hooks-law` |
| Physics | `physics-simple-pendulum` |
| Physics | `physics-refraction` |
| Chemistry | `chemistry-titration` |
| Chemistry | `chemistry-flame-test` |
| Chemistry | `chemistry-electrolysis` |
| Chemistry | `chemistry-salt-analysis` |
| Biology | `biology-photosynthesis` |
| Biology | `biology-osmosis` |
| Biology | `biology-mitosis` |
| Biology | `biology-dna-extraction` |
| Mathematics | `mathematics-derivatives` |
| CS | `cs-logic-gates` |

---

## Project Structure

```
vlabs_backend/
├── server.js              # Entry point
├── .env.example           # Environment template
├── package.json
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User schema (students, teachers, admin)
│   ├── Lab.js             # Lab schema with quiz questions
│   ├── QuizAttempt.js     # Per-attempt quiz results
│   └── SimulationLog.js   # Simulation usage analytics
├── controllers/
│   ├── authController.js  # Register, login, profile
│   ├── labController.js   # CRUD, quiz grading, simulation logging
│   └── progressController.js # Dashboard, history, leaderboard
├── routes/
│   ├── auth.js
│   ├── labs.js
│   └── progress.js
├── middleware/
│   ├── auth.js            # JWT protect, optionalAuth, requireRole
│   └── errorHandler.js    # Central error + 404 handlers
└── scripts/
    └── seed.js            # Seed all 14 labs + admin user
```

---

## Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — allowlist-based origin control
- **Rate limiting** — 200 req/15 min globally, 20 req/15 min for auth
- **bcryptjs** — passwords hashed with salt rounds = 12
- **JWT** — stateless auth, configurable expiry
- **Mongoose validators** — server-side field validation
- **Password hidden** — `select: false` on password field
- **Role-based access** — student / teacher / admin roles enforced
- **Input body size** — limited to 10 KB to prevent payload attacks

---

## Connecting the Frontend

Add this to your frontend JS (replace `localhost:5000` with your deployed URL):

```javascript
const API = 'http://localhost:5000/api';

// Register
const res = await fetch(`${API}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password, schoolClass })
});
const { token, user } = await res.json();
localStorage.setItem('vlabs_token', token);

// Authenticated request
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('vlabs_token')}`
};
const labs = await fetch(`${API}/labs?subject=physics`, { headers }).then(r => r.json());
```
