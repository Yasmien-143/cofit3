# Co-Fit Gym Management

Co-Fit is a React + Vite + Tailwind gym platform with role-based portals:
- Member Portal
- Trainer Portal
- Admin Portal

It includes signup/login, plan enrollment, trainer scheduling, member progress tracking, and admin management tools.

## Tech Stack
- React + Vite
- TypeScript
- Tailwind CSS
- Express (`server.js`) for production serving
- LocalStorage as the current data layer

## Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```
4. Run production server:
   ```bash
   node server.js
   ```

## Aiven MySQL Connection
Configure these environment variables (same values you shared):

| Variable | Value |
|---|---|
| `DB_HOST` | `mysql-57630db-yasmientosloc-3e32.e.aivencloud.com` |
| `DB_PORT` | `23248` |
| `DB_USER` | `avnadmin` |
| `DB_NAME` | `cofit1` |
| `DB_PASSWORD` | your real password |
| `DB_SSL` | `true` |

After setting env vars, run server and verify:
```bash
node server.js
```
Then open:
- `GET /health`
- `GET /api/db-status`
- `GET /api/bootstrap` (should return current system data)

If `/api/db-status` returns `connected: true`, the app server is connected to Aiven.

### Live Data Sync Behavior
- On app load, frontend calls `/api/bootstrap` and hydrates local state from MySQL (`cofit1`).
- On each create/update/delete action in the app, the system posts `/api/sync` so database state stays current.
- UI shows data that exists in the connected database snapshot.

## Deploy on GitHub
1. Create a new GitHub repo.
2. Push project:
   ```bash
   git init
   git add .
   git commit -m "Initial Co-Fit setup"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
3. CI is included at:
   - `.github/workflows/ci.yml`
   - It builds automatically on push/PR.

## Deploy on Render
Manual Render web service setup:
1. New Web Service -> Connect repo.
2. Build command:
   ```bash
   npm install && npm run build
   ```
3. Start command:
   ```bash
   node server.js
   ```
4. Environment:
   - `NODE_VERSION=20`
   - `PORT` is auto-provided by Render
   - add DB vars from **Aiven MySQL Connection** section

## Deploy in AI Workbench / Cloud Workbench
Use the same production commands:
1. `npm install`
2. `npm run build`
3. `node server.js`

Expose port `3000` (or your platform `PORT` env var).

### Workbench Setup Table
Use this checklist when creating your Workbench app/service.

| Item | Value |
|---|---|
| Runtime | Node.js 20 |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Start Command | `node server.js` |
| App Port | `3000` |
| Health Check | `/health` |
| Static Output | `dist/` |

### Workbench Environment Table
| Variable | Required | Example |
|---|---|---|
| `PORT` | Platform-provided | `3000` |
| `NODE_ENV` | Optional | `production` |
| `DB_HOST` | Yes (for DB) | `mysql-57630db-yasmientosloc-3e32.e.aivencloud.com` |
| `DB_PORT` | Yes (for DB) | `23248` |
| `DB_USER` | Yes (for DB) | `avnadmin` |
| `DB_PASSWORD` | Yes (for DB) | `********` |
| `DB_NAME` | Yes (for DB) | `cofit1` |
| `DB_SSL` | Yes (for Aiven) | `true` |

### Workbench Database Tables (Complete)
If your Workbench includes PostgreSQL/MySQL and you want server-side persistence, create these tables.

```sql
-- users table for members/trainers/admin
CREATE TABLE users (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('member','trainer','admin')),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- member profiles
CREATE TABLE members (
  user_id VARCHAR(40) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trainer_id VARCHAR(40) REFERENCES users(id) ON DELETE SET NULL,
  membership_status VARCHAR(20) NOT NULL CHECK (membership_status IN ('active','inactive','pending','unpaid')),
  plan VARCHAR(20) CHECK (plan IN ('basic','pro','elite')),
  joined_date DATE NOT NULL,
  last_payment_date DATE,
  next_payment_date DATE,
  training_time VARCHAR(50),
  goal TEXT,
  height NUMERIC(6,2)
);

-- trainer profiles
CREATE TABLE trainers (
  user_id VARCHAR(40) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) DEFAULT 5.0,
  experience VARCHAR(120),
  is_approved BOOLEAN DEFAULT FALSE,
  bio TEXT
);

-- trainer specializations
CREATE TABLE trainer_specializations (
  id SERIAL PRIMARY KEY,
  trainer_id VARCHAR(40) REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(120) NOT NULL
);

-- payment transactions
CREATE TABLE payments (
  id VARCHAR(40) PRIMARY KEY,
  member_id VARCHAR(40) REFERENCES users(id) ON DELETE CASCADE,
  member_name VARCHAR(120) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('completed','pending','failed')),
  plan VARCHAR(120) NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('cash','e-wallet')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- trainer-member sessions
CREATE TABLE sessions (
  id VARCHAR(40) PRIMARY KEY,
  member_id VARCHAR(40) REFERENCES users(id) ON DELETE CASCADE,
  trainer_id VARCHAR(40) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  category VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled','completed','cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- member progress logs
CREATE TABLE progress_logs (
  id SERIAL PRIMARY KEY,
  member_id VARCHAR(40) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  height NUMERIC(6,2),
  body_fat NUMERIC(5,2) DEFAULT 0,
  notes TEXT
);

-- editable website settings (single-row or key/value strategy)
CREATE TABLE settings (
  key VARCHAR(120) PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Workbench Data Rule (Important)
- Show only records from your database/local storage tables.
- Do not use fallback demo accounts or hardcoded profile data in UI.
- Authenticate by exact email + password match and load by that user ID only.

## Data Schema (Current)
Data is stored in browser LocalStorage.

### Storage Keys
- `cofit_members`
- `cofit_trainers`
- `cofit_payments`
- `cofit_sessions`
- `cofit_settings`
- `cofit_admin`

### Storage Table
| Key | Description |
|---|---|
| `cofit_members` | Member accounts and profiles |
| `cofit_trainers` | Trainer accounts and profiles |
| `cofit_payments` | Membership transactions |
| `cofit_sessions` | Trainer-member sessions |
| `cofit_settings` | Editable website/footer/services content |
| `cofit_admin` | Master admin login |

### Core Types

#### User
```ts
{
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'member' | 'trainer' | 'admin';
  avatar?: string;
}
```

#### Member
```ts
{
  ...User,
  trainerId?: string,
  membershipStatus: 'active' | 'inactive' | 'pending' | 'unpaid',
  plan?: 'basic' | 'pro' | 'elite',
  joinedDate: string,
  lastPaymentDate?: string,
  nextPaymentDate?: string,
  trainingTime?: string,
  goal?: string,
  height?: number,
  progress?: Array<{
    date: string,
    weight: number,
    height?: number,
    bodyFat: number,
    notes: string
  }>
}
```

#### Trainer
```ts
{
  ...User,
  specialization: string[],
  members: string[],
  schedule: Array<{ day: string, time: string, focus?: string }>,
  rating: number,
  experience: string,
  isApproved: boolean,
  bio?: string
}
```

#### Session
```ts
{
  id: string,
  memberId: string,
  trainerId: string,
  date: string,
  time: string,
  category: string,
  status: 'scheduled' | 'completed' | 'cancelled'
}
```

#### Payment
```ts
{
  id: string,
  memberId: string,
  memberName: string,
  amount: number,
  date: string,
  status: 'completed' | 'pending' | 'failed',
  plan: string,
  method: 'cash' | 'e-wallet'
}
```

#### GymSettings
```ts
{
  brandName: string,
  address: string,
  mapUrl: string,
  phone: string,
  email: string,
  operatingHours: string,
  brandDescription: string,
  internalPortalLabel: string,
  footerCopyright: string,
  socialLinks: Array<{ id: string, label: string, href: string }>,
  quickLinks: Array<{ id: string, label: string, href: string }>,
  services: Array<{ id: string, title: string, description: string, image: string }>
}
```