# CareSlot Evaluation & Demo Walkthrough Script 📋

This walkthrough script guides evaluators and instructors through testing all 5 core workflows and all 6 evaluation rubric tests.

---

## 🎬 Scenario 1: Authentication, Bento Dashboards & Role-Based Access Control (RBAC)

1. Open `http://localhost:3000/login`.
2. Notice the Aurora mesh animated background and frosted glass card.
3. Click the **"Patient"** button under **Evaluator Demo 1-Click Access**.
   - Authenticates immediately as `patient@careslot.demo`.
   - Redirects to `/dashboard` (Apple-style Bento Grid).
4. Verify RBAC restriction:
   - Try navigating to `/doctor/queue` or `/admin/evaluator` in the address bar.
   - Notice the Next.js middleware blocks access and redirects back to `/dashboard`.
5. Sign out and click **"Doctor"** 1-Click Login:
   - Redirects to `/doctor/dashboard` showing daily consultation fee revenue and today's schedule.

---

## 📅 Scenario 2: Doctor Schedule Matrix & Zero-Overlap Validator

1. Log in as Doctor (`doctor@careslot.demo` / `Doctor@123`).
2. Navigate to **Schedule Matrix** (`/doctor/schedule`).
3. View the weekday schedule editor:
   - Change consultation fee, slot duration (15/20/30/45/60m), and buffer minutes.
   - Click different weekdays (Monday, Tuesday, etc.) to view the **Live Slot Preview** recalculating in real-time.
4. Click **"Save & Generate Slots"**:
   - Executes zero-overlap conflict matrix validation.
   - Generates concrete rolling slots for 30 days while preserving all existing booked slots.

---

## 💳 Scenario 3: Doctor Discovery, 5-Minute Hold & Razorpay Atomic Booking

1. Log in as Patient (`patient@careslot.demo` / `Patient@123`).
2. Press `Cmd+K` (or `Ctrl+K` on Windows):
   - Command Palette opens.
   - Select **"Chest pain / Heart palpitations → Cardiology"**.
   - Filters doctors catalog to Dr. Arvind Mehta.
3. View Dr. Arvind Mehta's card:
   - Examine the **7-Day Availability Heat Strip** displaying real-time free slot density.
   - Click **"Book Slot"**.
4. On the Doctor Detail Page (`/doctors/[id]`):
   - Choose a consultation slot.
   - Step 2: Enter reason and symptoms, choose "In-Person" or "Telehealth Video".
   - Step 3: Review fee breakdown (Doctor Fee + 18% GST).
   - Notice the **5-Minute Circular SVG Countdown Ring** is active, holding the slot exclusively.
5. Click **"Pay with Razorpay (Success)"**:
   - Server validates HMAC SHA256 cryptographic signature.
   - Atomically locks the slot from `held` to `booked`.
   - Fires celebratory **confetti**!
   - Generates digital pass with Check-In Code (`CS-xxxx`), QR code, downloadable PDF receipt, and `.ics` calendar file.

---

## ⚡ Scenario 4: Smart Waitlist Engine & 15-Minute Cascading Expiry

1. Navigate to `/doctors/[id]` for Dr. Arvind Mehta on a fully booked date (e.g. Day 1 from seed).
2. The slot picker displays: **"All Slots Booked for This Date - Join Priority Waitlist"**.
3. Click **"Join Priority Waitlist"**:
   - Complete the 3-question symptom triage (Routine, Soon, Urgent) and preferred time-of-day.
   - Note: Zero upfront payment required.
4. Go to **Live Waitlist** (`/waitlist`):
   - View the animated **Queue Journey Tracker** (`Joined` → `Advancing` → `Next Up` → `Golden Ticket`).
5. Now, open the floating **Evaluator Time-Machine Toolbar** (bottom-right):
   - Click **"Live Cascade Visualizer"** → Watch the visual step-by-step animation of how a cancellation automatically awards a 15-minute golden ticket to the #1 ranked candidate, and cascades to #2 if expired.
   - Or click **"Fast-Forward Time (+15m)"** to test immediate expiry and cascade in the database.

---

## ⏱️ Scenario 5: Live Queue Management, Delay Estimator & Auto-Refunds

1. Log in as Doctor (`doctor@careslot.demo` / `Doctor@123`).
2. Navigate to **Live Queue** (`/doctor/queue`).
3. View the vertical timeline queue with the glowing red real-time **"NOW IN CONSULTATION"** marker line.
4. Click **"Start Visit"** on Patient #1.
5. In the Evaluator Toolbar, click **"Inject Artificial Delay (+15m)"**:
   - The Live Delay Estimator dynamically recalculates all upcoming appointments.
   - Shows updated estimated check-in times (e.g., `Est: 10:45 AM (+15m)`).
6. Click **"Finish & Prescribe"**:
   - Enter clinical diagnosis, notes, and structured prescription items (medicine, dosage, duration).
   - Marks consultation `completed`.
7. Cancellation & 100% Refund Test:
   - Log in as Patient and navigate to `/bookings`.
   - Click **"Cancel Visit"** on a future appointment (>2 hours away).
   - 100% Razorpay refund is automatically processed and recorded in the audit log!

---

## 🛡️ Scenario 6: Concurrency Race Condition Proof & Security 403

1. Open the Evaluator Toolbar on the bottom right.
2. Click **"Simulate Race Condition"**:
   - Fires 2 parallel HTTP hold operations at the exact same millisecond against the exact same slot document.
   - Live modal proves: Patient A acquires the atomic lock; Patient B receives an immediate 409 Conflict rejection.
3. Click **"Simulate Privilege Escalation"**:
   - Verifies server-side ownership guard by attempting to fetch Patient B's medical history while authenticated as Patient A.
   - Displays strict 403 Forbidden alert and logs to audit ledger.
