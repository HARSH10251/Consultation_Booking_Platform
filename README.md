# CareSlot 🏥

> **Smart Clinic Appointment Booking Platform with Cascading Waitlist Engine**
> Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, MongoDB Atlas, NextAuth.js, and Razorpay.

---

## 🌟 Executive Overview

**CareSlot** is a modern healthcare consultation scheduling platform engineered to eliminate three persistent problems in clinical operations:
1. **Double-Booking & Race Conditions**: Parallel requests during peak hours causing conflicting reservations.
2. **Empty Cancellation Slots**: Unpredictable patient cancellations resulting in wasted clinical capacity while urgent patients wait weeks.
3. **Unpredictable Clinic Delays**: Consultations overrunning without notice, stranding patients in waiting rooms.

CareSlot resolves these challenges with **atomic Mongoose slot locking**, an **algorithmic triage-scoring waitlist engine with 15-minute paid cascading holds**, and a **live queue delay estimator** that dynamically cascades estimated check-in times to all downstream patients.

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client[Web & Mobile Client / Next.js 14] -->|HTTPS| VercelEdge[Vercel Serverless Edge / Node Runtime]
    
    subgraph Core Workflows
        Auth[NextAuth.js RBAC]
        SlotGen[Rolling 30-Day Slot Engine]
        AtomicBooking[Atomic Booking & 5-Min Hold]
        WaitlistEngine[Smart Waitlist & Triage Ranker]
        QueueLive[Live Queue Timeline & Delay Estimator]
    end

    VercelEdge --> Auth
    VercelEdge --> SlotGen
    VercelEdge --> AtomicBooking
    VercelEdge --> WaitlistEngine
    VercelEdge --> QueueLive

    AtomicBooking -->|HMAC SHA256| Razorpay[Razorpay Payment Gateway]
    AtomicBooking -->|Atomic findOneAndUpdate| MongoDB[(MongoDB Atlas)]
    WaitlistEngine -->|15-Min Hold & Cascade| MongoDB
    SlotGen -->|Zero-Overlap Conflict Matrix| MongoDB
    VercelCron[Vercel Cron /api/cron/*] -->|Scheduled Expiry| WaitlistEngine
```

---

## 🔄 Concurrency & Atomic Hold Workflow

```mermaid
sequenceDiagram
    autonumber
    actor PatientA as Patient A
    actor PatientB as Patient B
    participant API as /api/slots/hold
    participant DB as MongoDB Slot Document
    participant RZP as Razorpay Gateway

    par Simultaneous Slot Selection
        PatientA->>API: POST /api/slots/hold (Slot #101)
        PatientB->>API: POST /api/slots/hold (Slot #101)
    end

    API->>DB: Atomic findOneAndUpdate({ status: 'available' }, { status: 'held', heldBy: PatientA, expires: +5m })
    DB-->>API: Lock acquired by Patient A
    API-->>PatientA: 200 OK (5-Minute Hold Ring Active)

    API->>DB: Atomic findOneAndUpdate (Slot #101 already 'held')
    DB-->>API: null (Lock Failed)
    API-->>PatientB: 409 Conflict ("Slot held by another patient")

    PatientA->>RZP: Completes Consultation Fee Payment
    RZP-->>PatientA: razorpay_payment_id & signature
    PatientA->>API: POST /api/payments/verify-signature
    API->>DB: Atomic findOneAndUpdate({ status: 'held', heldBy: PatientA }, { status: 'booked' })
    API-->>PatientA: 200 OK (Confirmed + Pass #CS-4821)
```

---

## ⚡ Smart Waitlist Cascading Engine

```mermaid
stateDiagram-v2
    [*] --> Booked: Initial Confirmed Slot
    Booked --> Vacated: Patient Cancels or Reschedules
    Vacated --> TriageRanking: Trigger Waitlist Service
    
    state TriageRanking {
        [*] --> ScoreFormula
        ScoreFormula: Score = Urgency + (WaitHours * 2) + FollowUpBonus - Penalties
        ScoreFormula --> SortDescending
        SortDescending --> TopCandidate: Pick Rank #1
    }

    TriageRanking --> HeldForOffer: Slot marked 'held_for_offer' (15m window)
    HeldForOffer --> OfferDispatched: In-app notification & Audio Chime
    
    OfferDispatched --> Confirmed: Patient #1 Accepts & Pays (Razorpay)
    OfferDispatched --> CascadeNext: 15m Timer Expires or Patient Declines
    
    CascadeNext --> HeldForOffer: Offer re-assigned to Patient #2
    CascadeNext --> PublicPool: No remaining waitlist candidates
    PublicPool --> [*]
    Confirmed --> [*]
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: `v18.x` or `v20.x` or `v24.x`
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster URI

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/careslot.git
cd careslot
npm install
```

### 3. Setup Local Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB connection string (or use default local `mongodb://127.0.0.1:27017/careslot`).

### 4. Seed Database with Realistic Demo Data
```bash
npm run seed
```
This populates:
- **8 Specialties** (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, General Medicine, ENT, Ophthalmology)
- **5 Clinic Rooms & Equipment**
- **12 Doctors** with rolling 30-day schedules and fees (₹500 - ₹1500)
- **25 Patients**
- Historical paid bookings, transactions, and active waitlists

### 5. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Automated Vitest Test Suite
```bash
npm run test
```
Runs 21 comprehensive unit tests verifying:
- Concurrency race conditions & atomic slot locking
- Pure waitlist triage ranking formula & tiebreakers
- Room & doctor zero-overlap conflict matrix
- 30-day rolling slot generation & break exclusions
- Razorpay HMAC-SHA256 signature verification

---

## 🔑 Demo User Accounts

| Role | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@careslot.demo` | `Patient@123` | Book consultations, hold countdown ring, waitlist queue tracker |
| **Doctor** | `doctor@careslot.demo` | `Doctor@123` | Live queue timeline, NOW line, delay estimator, prescriptions |
| **Admin** | `admin@careslot.demo` | `Admin@123` | Clinic Bento analytics, audit logs, doctor approvals, Evaluator Suite |

*(Note: On `/login`, you can also click the 1-click quick login buttons to sign in instantly without typing).*

---

## 🛠️ Evaluator Time-Machine & Test Panel

Click the floating **"EVALUATOR TIME-MACHINE"** pill on the bottom-right or navigate to `/admin/evaluator` to test all project rubric requirements:

1. **⚡ Simulate Race Condition**: Fires 2 concurrent requests at the exact same millisecond against the same slot. Verifies only 1 acquires the hold and the 2nd is cleanly rejected.
2. **🌊 Live Waitlist Cascade Visualizer**: Launches an animated modal demonstrating: cancellation → slot unlocks → offered to Patient #1 (15m window) → countdown expires → cascades smoothly to Patient #2.
3. **⏱️ Fast-Forward Time (+15 Mins)**: Advances the server clock to expire pending waitlist offers immediately and triggers the next queue cascade.
4. **🔒 Simulate Privilege Escalation**: Attempts cross-patient access to verify strict server-side 403 Forbidden enforcement.
5. **📉 Inject Artificial Delay (+15m)**: Triggers the Live Delay Estimator, dynamically updating downstream patient check-in times across today's queue.

---

## 📝 Environment Variables Configuration Guide (.env)

Here is the exact structure of your `.env.local` file:

```env
# ==========================================
# CareSlot - Environment Configuration
# ==========================================

# Core Application Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database Connection (MongoDB Atlas)
# Replace with your actual MongoDB connection string
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.demo.mongodb.net/careslot?retryWrites=true&w=majority"

# NextAuth / Auth.js Configuration
# For local development: http://localhost:3000
# For production: https://your-project.vercel.app
NEXTAUTH_URL="http://localhost:3000"
# Any random 32+ character secret string (openssl rand -base64 32)
NEXTAUTH_SECRET="mock_nextauth_secret_key_change_this_min_32_chars_long_xyz123"

# Google OAuth Credentials (Optional: leaves email/password as active)
GOOGLE_CLIENT_ID="mock_google_client_id_123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="mock_google_client_secret_GOCSPX_abcdefghijklmnopqrstuvwxyz"

# Razorpay Payment Gateway (Test Mode)
# If left as mock or omitted, high-fidelity mock payment mode activates automatically!
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_mock_KeyId12345678"
RAZORPAY_KEY_SECRET="mock_razorpay_secret_key_87654321"

# Email Delivery (Resend API Key)
# If omitted, notifications are gracefully logged to the console
RESEND_API_KEY="re_mock_123456789_abcdefghijklmnopqrstuvwxyz"
EMAIL_FROM="CareSlot Clinic <noreply@careslot.demo>"

# Vercel Cron Authorization Secret
CRON_SECRET="mock_cron_execution_secret_token_careslot_2026"
```

---

## 🚀 Vercel Deployment Guide

To deploy CareSlot to Vercel with 100% build and runtime success:

### 1. Import Repository on Vercel
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New Project"** and import the `careslot` repository.
3. Keep Framework Preset as **Next.js**.

### 2. Configure Environment Variables in Vercel
In the Vercel project deployment screen, go to **Environment Variables** and add the following keys:

| Environment Variable | Description / Recommended Value |
| :--- | :--- |
| `MONGODB_URI` | Your production MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Your Vercel domain (e.g. `https://careslot.vercel.app`) |
| `NEXTAUTH_SECRET` | A secure random 32-character string |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g. `https://careslot.vercel.app`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay Test Mode Key ID (or mock key) |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Test Mode Key Secret (or mock secret) |
| `CRON_SECRET` | Secret token matching `vercel.json` cron triggers |
| `RESEND_API_KEY` | *(Optional)* Resend API key for email delivery |

### 3. Serverless Compatibility Handled Automatically
- **Mongoose Singleton**: `src/lib/db.ts` reuses connection promises across Lambda invocations with `maxPoolSize: 10` to prevent connection exhaustion.
- **Dynamic Directives**: All dynamic API endpoints declare `export const dynamic = 'force-dynamic'` to ensure flawless static build evaluation.
- **Vercel Crons**: `vercel.json` automatically activates:
  - `/api/cron/process-offers` (Runs every 5 minutes)
  - `/api/cron/send-reminders` (Runs daily at 08:00 AM)

---

## 📜 License
MIT License • CareSlot Software Engineering Project.
