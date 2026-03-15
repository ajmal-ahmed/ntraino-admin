# nTraino QuizzMe — Project Memory

> Last updated: 2026-03-15

## Project Overview

**Platform**: nTraino — helps people train for competitive examinations.  
**App**: QuizzMe — POC for creating examinations and testing them.  
**Stack**: Next.js 16 (App Router) + TypeScript + MUI + Firebase (Auth + Firestore)  
**Repo**: `d:\projects\uciner\ed\quizzme`

---

## Modules

### 1. Examinations Management (CRUD)
- Create, Read, Update, Delete examinations
- Each examination has: name, description, templateType (ts1/ts2), uploaded XLSX template
- XLSX is parsed server-side into structured questions stored in Firestore

### 2. Mock Tests
- Select an examination → start a test
- Question-by-question UI with per-question timer and question navigator
- Submit → server-side scoring (1 point per correct answer, no negative marking)
- Results page with score percentage, grade, and detailed review

---

## Schema (Firestore — NoSQL, MongoDB-portable)

### Collection: `examinations`
```json
{
  "id": "auto",
  "name": "string",
  "description": "string",
  "templateType": "ts1 | ts2",
  "templateFileName": "string",
  "questions": [{
    "id": "q1",
    "question": "string",
    "options": [{"a": "value"}, {"b": "value"}, {"c": "value"}, {"d": "value"}],
    "answer": ["actual value"],
    "additionalOptions": [{"a": "..."}, ...], // TS2 only, omitted if all empty
    "alignment": "right | left"               // default "right", "left" for Arabic
  }],
  "totalQuestions": "number",
  "createdBy": "string",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Collection: `mockTests`
```json
{
  "id": "auto",
  "examinationId": "string",
  "examinationName": "string (denormalized)",
  "userId": "string",
  "responses": [{
    "questionId": "q1",
    "selectedAnswer": ["actual value"],
    "isCorrect": "boolean",
    "timeTaken": "number (seconds)"
  }],
  "totalQuestions": "number",
  "totalScore": "number",
  "obtainedScore": "number",
  "status": "in-progress | completed",
  "startedAt": "ISO string",
  "completedAt": "ISO string",
  "createdAt": "ISO string"
}
```

---

## Template Formats (XLSX)

- **TS1**: `Question, option-1, option-2, option-3, option-4, Answer [, alignment]`
- **TS2**: `Question, answer-1, answer-2, answer-3, answer-4, option-1, option-2, option-3, option-4, Answer [, alignment]`
- TS2 `additionalOptions` (answer-1..4) are rendered before the main options in the UI
- **TS2 optimization**: if all answer-1..4 are empty, `additionalOptions` is omitted (behaves like TS1)
- **Alignment column**: optional, defaults to `"right"`. Only stores `"left"` when explicitly set (for Arabic/RTL)
- Options and answer logic is identical for both types

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Answer stores actual value** | `answer: ["New Delhi"]` not key like `["a"]` — simpler comparison |
| **Questions embedded in examination** | Always fetched together, avoids extra queries |
| **No Firestore-specific types** | ISO strings for timestamps, no subcollections — MongoDB-portable |
| **Firebase Admin SDK** | Server-side Firestore access in API routes (needs `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`) |
| **`@opentelemetry/api`** | Required peer dependency of `firebase-admin` — must be explicitly installed |
| **Sample template downloads** | API at `/api/templates/sample?type=ts1|ts2` generates XLSX on the fly |
| **TS2 empty answer fallback** | If all answer-1..4 columns are blank, question behaves exactly like TS1 — no empty arrays stored |
| **Alignment column** | Optional XLSX column, default `"right"`, `"left"` for Arabic. UI applies `dir="rtl"` + `textAlign: right` per question |

---

## File Structure

```
src/
├── components/
│   └── AppShell.tsx                  # Sidebar layout with nav
├── context/
│   └── AuthContext.tsx               # Firebase auth state
├── lib/
│   ├── firebase.ts                   # Client-side Firebase (auth + firestore)
│   ├── firebaseAdmin.ts              # Admin SDK for API routes
│   └── templateParser.ts             # XLSX → Question[] parser
├── types/
│   ├── examination.ts                # Examination/Question interfaces
│   └── mockTest.ts                   # MockTest interfaces
└── app/
    ├── api/
    │   ├── examinations/
    │   │   ├── route.ts              # GET list, POST create
    │   │   └── [id]/route.ts         # GET, PUT, DELETE
    │   ├── mock-tests/
    │   │   ├── route.ts              # GET list, POST start
    │   │   └── [id]/
    │   │       ├── route.ts          # GET details
    │   │       └── submit/route.ts   # POST submit+score
    │   └── templates/
    │       └── sample/route.ts       # GET sample XLSX download
    ├── login/page.tsx                # Firebase email/password auth
    └── dashboard/
        ├── layout.tsx                # AppShell wrapper + auth guard
        ├── page.tsx                  # Overview with nav cards
        ├── examinations/
        │   ├── page.tsx              # List with delete dialog
        │   ├── create/page.tsx       # Form + drag-drop upload + sample downloads
        │   └── [id]/
        │       ├── page.tsx          # View with question accordions
        │       └── edit/page.tsx     # Edit with optional re-upload
        └── mock-tests/
            ├── page.tsx              # Start test + history tabs
            └── [id]/
                ├── take/page.tsx     # Question-by-question with timer
                └── results/page.tsx  # Score circle + detailed review
```

---

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entraino-dev-v1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entraino-dev-v1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entraino-dev-v1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # Full JSON, single line
```

---

## Pending / Future Work

- [ ] Users collection (currently relying on Firebase Auth only)
- [ ] Auth token validation in API routes (currently `createdBy: 'system'`)
- [ ] Firestore security rules
- [ ] Exam categories / tags
- [ ] Pagination for examination list
- [ ] Test timer (overall time limit per exam)
- [ ] Schema migration to subcollections if exams grow beyond 500+ questions
- [ ] MongoDB migration path
