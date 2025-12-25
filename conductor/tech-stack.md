# Tech Stack

## Core Architecture
*   **Platform:** Chrome Extension (Manifest V3)
*   **Injection Strategy:** Programmatic injection via `background.js` (allows ES6 modules if needed).
*   **Frontend:** Vanilla JavaScript (ES6+), CSS.

## Backend (Firebase)
*   **Database:** Firestore (Real-time NoSQL).
*   **Auth:** Firebase Auth (Anonymous).
*   **Analytics:** Google Analytics for Firebase.

## Development Tools
*   **Orchestration:** Conductor (Gemini CLI Extension).
*   **Testing:**
    *   **Unit:** Jest (for logic like hashing).
    *   **E2E:** Playwright (for browser/UI verification).
