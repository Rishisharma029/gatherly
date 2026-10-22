<div align="center">

# 🌿 Gatherly
### *World-Class AI Event Planner & High-Precision Production Workspace*

[![CI Pipeline](https://github.com/Rishisharma029/gatherly/actions/workflows/ci.yml/badge.svg)](https://github.com/Rishisharma029/gatherly/actions/workflows/ci.yml)
[![Docker Build](https://github.com/Rishisharma029/gatherly/actions/workflows/docker.yml/badge.svg)](https://github.com/Rishisharma029/gatherly/actions/workflows/docker.yml)
[![Deploy to GitHub Pages](https://github.com/Rishisharma029/gatherly/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/Rishisharma029/gatherly/actions/workflows/gh-pages.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-gh--pages-1F5147?logo=github&style=flat)](https://rishisharma029.github.io/gatherly/)
[![License: MIT](https://img.shields.io/badge/License-MIT-1F5147.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Security: Rate Limited](https://img.shields.io/badge/Security-Protected-success.svg)](SECURITY.md)

<p align="center">
  <strong>Gatherly</strong> is an editorial-grade, full-stack event workspace combining decimal-safe budget engineering, dynamic time-aware timeline compression, vendor lifecycle management, and practical Generative AI guidance.
</p>

[🚀 Explore Live Demo](https://rishisharma029.github.io/gatherly/) • [📖 API Documentation](#-api-contract-and-endpoints) • [🛡️ Security Policy](SECURITY.md) • [Report Bug](https://github.com/Rishisharma029/gatherly/issues)

</div>

---

> ### 🌐 Live Web Application
> **Gatherly is deployed and accessible at**:  
> **👉 [https://rishisharma029.github.io/gatherly/](https://rishisharma029.github.io/gatherly/)**  
> *Pre-configured with Aarav's 21st Birthday (₹25,000 budget ceiling, 30-day compressed timeline, vegetarian catering quotes, and black/gold aesthetic plan).*

---

## 📖 Table of Contents

- [Architectural Vision & Design Language](#-architectural-vision--design-language)
- [System Architecture](#-system-architecture)
- [Database Entity-Relationship Model (ERD)](#-database-entity-relationship-model-erd)
- [Dynamic Time-Aware Timeline Algorithm](#-dynamic-time-aware-timeline-algorithm)
- [Key Features Deep Dive](#-key-features-deep-dive)
  - [1. Decimal-Safe Smart Budgeting](#1-decimal-safe-smart-budgeting)
  - [2. Time-Aware Timeline & Checklist](#2-time-aware-timeline--checklist)
  - [3. Vendor Lifecycle Tracker](#3-vendor-lifecycle-tracker)
  - [4. Guardrailed Generative AI](#4-guardrailed-generative-ai)
- [Security Architecture & Hardening](#-security-architecture--hardening)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [Continuous Integration & CD Pipelines](#-continuous-integration--cd-pipelines)
- [API Contract and Endpoints](#-api-contract-and-endpoints)
- [Local Development Setup](#-local-development-setup)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Code of Conduct & Contributing](#-code-of-conduct--contributing)

---

## 🎨 Architectural Vision & Design Language

Unlike generic AI demos with saturated purple gradients and fragile glassmorphism, Gatherly adheres to an **editorial productivity aesthetic** that feels like a bespoke planning atelier:

- **Warm Ivory (`#F8F7F2`)**: Restful, glare-free canvas background.
- **Deep Forest Green (`#1F5147`)**: Grounded executive primary tone for structure, action triggers, and primary headings.
- **Muted Apricot (`#E9A477`)**: Warm accent for interactive highlights, milestones, and pending actions.
- **Charcoal (`#252923`)**: High-contrast, optical-grade typography.
- **Bespoke Typography**: Paired `Playfair Display` (editorial serif headings) with `Plus Jakarta Sans` (ultra-legible geometric body).

```
#F8F7F2 ─── Canvas Background (Warm Ivory)
#1F5147 ─── Primary Brand (Deep Forest Green)
#E9A477 ─── Accent Highlight (Muted Apricot)
#252923 ─── Body Typography (Editorial Charcoal)
#E5E3DC ─── Subtle Card Bordering
```

---

## 🏛️ System Architecture

Gatherly implements a decoupled, production-ready full-stack topology:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Browser (React 18 + TypeScript)"]
        UI["User Interface (Vite + Tailwind v4)"]
        Recharts["Recharts Visual Engine (Bar / Pie)"]
        State["Client State & Workspace Context"]
        Router["React Router v6 SPA Routing"]
    end

    subgraph SecurityShield ["Defensive Security Layer"]
        RateLimiter["Sliding Window Rate Limiter (IP Bucket)"]
        SecHeaders["Security Headers (CSP, XSS, NoSniff, FrameGuard)"]
        PayloadGuard["Payload Size Ceiling (2MB Max)"]
        TokenAuth["HMAC Token Verification (Bearer / X-API-Key)"]
    end

    subgraph BackendCore ["FastAPI Core (Python 3.12+)"]
        Routers["REST Routers (Events, Budget, Tasks, Vendors, AI)"]
        Validator["Pydantic v2 Schema Sanitization"]
        AIService["Gatherly AI Orchestration Service"]
        PaiseEngine["Integer Paise Arithmetic Engine"]
    end

    subgraph DataPersistence ["Persistence Layer"]
        ORM["SQLAlchemy ORM (UUID Primary Keys)"]
        DB[("SQLite / PostgreSQL Ready")]
        AILog[("AI Generation & Audit Trail")]
    end

    subgraph ExternalServices ["External Intelligence"]
        OpenAI["OpenAI API (GPT-4o-mini Guardrailed)"]
    end

    UI --> Router --> State
    State --> Recharts
    State -->|HTTP / JSON| SecurityShield
    SecurityShield --> RateLimiter --> SecHeaders --> PayloadGuard --> TokenAuth
    TokenAuth --> Routers
    Routers --> Validator
    Routers --> PaiseEngine
    Routers --> AIService
    AIService -.->|Fallback / Augment| OpenAI
    Routers --> ORM
    ORM --> DB
    ORM --> AILog
```

---

## 🗃️ Database Entity-Relationship Model (ERD)

All tables utilize non-sequential `String(36)` UUID primary keys, enabling instant zero-downtime migration from SQLite to distributed PostgreSQL clusters:

```mermaid
erDiagram
    EVENTS ||--o{ BUDGET_CATEGORIES : "allocates"
    EVENTS ||--o{ EXPENSES : "tracks"
    BUDGET_CATEGORIES ||--o{ EXPENSES : "groups"
    EVENTS ||--o{ TASKS : "schedules"
    EVENTS ||--o{ VENDORS : "contracts"
    EVENTS ||--o{ AI_GENERATIONS : "records"
    EVENTS ||--o{ ACTIVITY_LOGS : "audits"

    EVENTS {
        string id PK "UUID"
        string name "Event Title"
        string event_type "Birthday | Wedding | Community"
        string event_date "YYYY-MM-DD"
        string city "Location"
        int guest_count "Attendees"
        float total_budget "Total Target Ceiling"
        string currency "₹ | $ | €"
        string theme "Theme Descriptor"
        string atmosphere "Aesthetic Vibe"
        text preferences_json "Custom dietary & accessibility"
        string status "PLANNING | CONFIRMED | COMPLETED"
        datetime created_at
        datetime updated_at
    }

    BUDGET_CATEGORIES {
        string id PK "UUID"
        string event_id FK
        string name "Venue, Catering, Decor, etc."
        float allocated_amount "Normalized Preset Limit"
        datetime created_at
    }

    EXPENSES {
        string id PK "UUID"
        string event_id FK
        string category_id FK "Nullable Category Ref"
        string description "Item / Booking Details"
        float estimated_amount "Quote Estimate"
        float actual_amount "Actual Incurred Cost"
        string payment_status "pending | deposit_paid | paid"
        float paid_deposit "Confirmed Deposit"
        text notes "Vendor Terms"
        datetime created_at
    }

    TASKS {
        string id PK "UUID"
        string event_id FK
        string title "Task Title"
        string due_date "Clamped ISO Date"
        string priority "High | Medium | Low"
        string status "TODO | IN_PROGRESS | COMPLETED"
        string category "Logistics, Catering, etc."
        boolean is_milestone "Key Milestone Flag"
        boolean is_urgent "Urgent Flag"
        datetime created_at
    }

    VENDORS {
        string id PK "UUID"
        string event_id FK
        string name "Vendor Name"
        string category "venue | catering | decor..."
        string contact_name "Contact Person"
        string email "Email Address"
        string phone "Phone Number"
        float quoted_amount "Agreed Quote"
        float deposit_amount "Required Deposit"
        boolean deposit_paid "Deposit Paid Flag"
        float balance_due "Calculated Remaining"
        string booking_status "shortlisted | contacted | quoted | booked"
        string follow_up_date "Next Action Date"
        datetime created_at
    }

    AI_GENERATIONS {
        string id PK "UUID"
        string event_id FK
        string generation_type "plan | ideas | chat"
        string model "Gatherly-AI-v1 / gpt-4o-mini"
        string status "completed | failed"
        text content_json "Deterministic or LLM Output"
        datetime created_at
    }

    ACTIVITY_LOGS {
        string id PK "UUID"
        string event_id FK
        string user_name "Actor"
        string action "Action Description"
        string entity_type "Event | Budget | Task | Vendor"
        string timestamp_label "Humanized Time"
        datetime created_at
    }
```

---

## ⏱️ Dynamic Time-Aware Timeline Algorithm

Gatherly does not blindly output static 30-day schedules. The timeline engine inspects the runway between today and the event date, compressing and prioritizing milestones dynamically while **clamping deadlines to prevent impossible past dates**:

```mermaid
flowchart TD
    Start["Calculate days_left = event_date - today"] --> Decision{"Evaluate Runway"}
    
    Decision -->|days_left <= 3| UrgentPath["EMERGENCY COMPRESSION (< 3 Days)"]
    Decision -->|4 <= days_left <= 14| CompressedPath["ACCELERATED TIMELINE (1-2 Weeks)"]
    Decision -->|days_left > 14| StandardPath["STANDARD DISCOVERY (30+ Days)"]

    UrgentPath --> U1["Day 0: Emergency Venue & Catering Lock"]
    UrgentPath --> U2["Day 0: Digital RSVP Broadcast via WhatsApp"]
    UrgentPath --> U3["Day-of: Run of Show Setup Coordination"]

    CompressedPath --> C1["T-12: Confirm Headcount & Menu Cap"]
    CompressedPath --> C2["T-9: Finalize Primary Venue Contract"]
    CompressedPath --> C3["T-6: Approve Theme & Cake"]
    CompressedPath --> C4["T-3: Freeze RSVPs & Final Headcount"]
    CompressedPath --> C5["T-1: Technical Rehearsal & Soundcheck"]

    StandardPath --> S1["T-30: Confirm Budget & Target Guest Count"]
    StandardPath --> S2["T-21: Shortlist Venues & Vendors"]
    StandardPath --> S3["T-14: Menu Tastings & Floral Approvals"]
    StandardPath --> S4["T-7: Finalize RSVPs & Seating Layout"]
    StandardPath --> S5["T-2: Confirm Delivery Timings & Deposits"]
    StandardPath --> S6["Event Day: Execute Event-Day Schedule"]

    U1 & U2 & U3 & C1 & C2 & C3 & C4 & C5 & S1 & S2 & S3 & S4 & S5 & S6 --> ClampCheck{"Is Deadline in the Past?"}
    ClampCheck -->|Yes| ClampToday["Clamp Deadline = Today's Date"]
    ClampCheck -->|No| KeepDate["Retain Calculated Due Date"]
    ClampToday & KeepDate --> PersistTasks["Persist Tasks to Relational DB"]
```

---

## 🌟 Key Features Deep Dive

### 1. Decimal-Safe Smart Budgeting
- **Integer Paise Arithmetic**: Currency values are converted to and computed as integers ($1\text{ Rupee} = 100\text{ paise}$).
  $$\text{Allocation Paise} = \left\lfloor \text{Total Budget} \times 100 \times \frac{\text{Preset Percentage}}{100} \right\rceil$$
- **100% Normalized Presets**: Birthday (30% catering, 20% venue, 15% decor, 10% entertainment, 8% media, 5% misc, 5% contingency, 4% attire, 3% invites).
- **Shortfall Intelligence**: When total actual costs exceed the total budget ceiling, an alert banner displays the exact deficit and generates category-level recommendations on where to trim.

### 2. Time-Aware Timeline & Checklist
- **Milestones vs. Tasks**: Visual indicator for key run-of-show milestones vs. daily action items.
- **Filterable Workspace**: Filter instantly by Priority (`High`, `Medium`, `Low`), Category (`Venue`, `Catering`, `Decor`, etc.), and Status (`TODO`, `IN_PROGRESS`, `COMPLETED`).
- **One-Click Completion**: Check off tasks directly from the dashboard or timeline with instantaneous progress recalculations.

### 3. Vendor Lifecycle Tracker
- **8 Standard Industry Categories**: Venue, Catering, Decoration, Photographer, Entertainment, Invitation/Printing, Transport, Miscellaneous.
- **Financial Status at a Glance**: Tracks Estimated Quote, Final Agreed Quote, Paid Deposit, and calculates Balance Due automatically:
  $$\text{Balance Due} = \max\left(0, \text{Final Quote} - \text{Paid Deposit}\right)$$
- **Status Pipeline**: Transitions from `shortlisted` $\to$ `contacted` $\to$ `quoted` $\to$ `booked`.

### 4. Guardrailed Generative AI
- **No Hallucinations**: Gatherly AI strictly distinguishes between user-entered estimates and confirmed vendor bookings. It never claims unverified phone numbers or addresses are real businesses.
- **Practical Trade-Off Explanations**: Ask Gatherly AI how to save money on a wedding or birthday, and it will recommend sensible substitutions (e.g. signature welcome spritz station vs. full open bar, focal photo walls vs. whole-room draping).

---

## 🛡️ Security Architecture & Hardening

Gatherly is hardened for production deployment:

| Protection | Implementation | Defense Capability |
|---|---|---|
| **Rate Limiting** | Sliding Window Token Bucket (`security.py`) | Prevents brute-force, scraping, and DoS (180 rpm general, 30 rpm AI). |
| **Security Headers** | `SecurityHeadersMiddleware` | Enforces `nosniff`, `DENY` clickjacking, XSS filtering, CSP, and Referrer rules. |
| **Payload Limiter** | Request Size Guard | Automatically rejects payloads exceeding 2MB with `413 Request Entity Too Large`. |
| **Tokenization Auth** | Cryptographic HMAC Timing-Safe Bearer Token | Prevents side-channel timing attacks via `hmac.compare_digest`. |
| **Input Validation** | Pydantic v2 Type Sanitization | Enforces strict ISO dates, non-negative budget constraints, and positive headcounts. |

---

## 🐳 Docker & Containerized Deployment

Run the entire Gatherly ecosystem (backend, frontend, proxy, and database) with a single command:

```bash
# Clone the repository
git clone https://github.com/Rishisharma029/gatherly.git
cd gatherly

# Spin up multi-container environment
docker compose up --build -d
```

### Container Services
- **`backend`**: Python 3.12-slim, non-root user `gatherly`, auto-migrating SQLite storage with integrated healthcheck (`http://localhost:8000/api/health`).
- **`frontend`**: High-performance multi-stage Nginx Alpine reverse-proxying `/api` requests to backend on port `80` and `5173`.

---

## 🔄 Continuous Integration & CD Pipelines

Three GitHub Actions workflows maintain continuous delivery:

1. **`ci.yml`**:
   - Executes Python 3.12 setup and full Pytest suite on every push and PR.
   - Executes Node 20 setup, `npm ci`, TypeScript typechecking (`tsc -b`), and Vite production bundling.
2. **`docker.yml`**:
   - Builds multi-stage Docker images for both backend and frontend to ensure zero container drift.
3. **`gh-pages.yml`**:
   - Compiles the frontend SPA with relative asset references and deploys directly to the `gh-pages` branch for static previewing.

---

## 📡 API Contract and Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck & security status inspection | `200 OK` |
| `GET` | `/api/dashboard` | Aggregated dashboard KPI statistics and upcoming tasks | `200 OK` |
| `GET` | `/api/events` | List all events with calculated progress stats | `200 OK` |
| `POST` | `/api/events` | Create new event with date and budget validation | `200 OK` / `400` |
| `GET` | `/api/events/{id}` | Complete event detail with relational child records | `200 OK` / `404` |
| `PATCH`| `/api/events/{id}` | Partial event update (atmosphere, budget, guest count) | `200 OK` |
| `DELETE`| `/api/events/{id}` | Cascade delete event and all related entities | `200 OK` |
| `POST` | `/api/events/{id}/generate-plan` | Regenerate time-aware timeline and category presets | `200 OK` |
| `GET` | `/api/events/{id}/budget` | Category allocation limits, actual spend, and shortfalls | `200 OK` |
| `POST` | `/api/events/{id}/expenses` | Log individual expense record | `200 OK` |
| `PATCH`| `/api/expenses/{id}` | Update expense details or deposit status | `200 OK` |
| `DELETE`| `/api/expenses/{id}` | Remove expense record | `200 OK` |
| `GET` | `/api/events/{id}/tasks` | Filterable tasks (`status`, `priority`, `category`) | `200 OK` |
| `POST` | `/api/events/{id}/tasks` | Create task or milestone | `200 OK` |
| `PATCH`| `/api/tasks/{id}` | Update task completion status | `200 OK` |
| `DELETE`| `/api/tasks/{id}` | Remove task | `200 OK` |
| `GET` | `/api/events/{id}/vendors` | List vendor checklist records | `200 OK` |
| `POST` | `/api/events/{id}/vendors` | Create vendor quote and contact item | `200 OK` |
| `PATCH`| `/api/vendors/{id}` | Update vendor quote, deposit paid, or booking status | `200 OK` |
| `DELETE`| `/api/vendors/{id}` | Remove vendor record | `200 OK` |
| `POST` | `/api/events/{id}/ideas` | Generate bespoke themes, menus, and decoration plans | `200 OK` |
| `POST` | `/api/ai/chat` | Gatherly AI conversational guidance and trade-off advisor | `200 OK` |

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Git**

### 2. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows Powershell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```powershell
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev -- --port 5173
```

Access the application in your browser:
- **Frontend Workspace**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI Backend**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🧪 Testing & Quality Assurance

Gatherly maintains a comprehensive Pytest test suite covering all CRUD operations, negative input validation guards, date-clamping logic, and security headers:

```powershell
# Run backend test suite
backend\venv\Scripts\python.exe -m pytest backend/tests -v

# Run frontend typecheck and build
cd frontend
npm run build
```

---

## 🤝 Code of Conduct & Contributing

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and review our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).

<div align="center">
  <sub>Crafted with care for world-class planners everywhere.</sub>
</div>
