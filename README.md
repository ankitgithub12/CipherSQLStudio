# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## 🔗 Live Project Links
- **Frontend (UI)**: [https://ciphersqlstudio-1-8rih.onrender.com/](https://ciphersqlstudio-1-8rih.onrender.com/)
- **Backend (API)**: [https://ciphersqlstudio-bhgx.onrender.com/](https://ciphersqlstudio-bhgx.onrender.com/)

## Features Let's Dive In! 🚀

- **Assignment Listing**: Navigate through difficulties and select SQL problems.
- **Real-time Engine**: Execute queries against a real PostgreSQL sandbox.
- **Smart Hints**: Utilizes an LLM to generate contextual guidance based on the expected schema and student query.
- **Progress Tracking**: Automatically saves student query progress and attempt history via MongoDB.
- **Mobile First**: Built completely from the ground up using **Vanilla SCSS / BEM Styling**.

## Component Stack & Technology Choices
Why these technologies? 🛠️

- **Frontend Core: React (via Vite)** - Chosen for its component-based architecture and Vite's lightning-fast development cycle.
- **Frontend Styling: Vanilla SCSS** - Implemented a custom design system using BEM (Block Element Modifier) methodology for maintainable, modular styles without the bloat of external libraries.
- **Editor: Monaco Editor** - The same engine powering VS Code, providing students with a professional-grade SQL editing experience.
- **Backend: Node.js & Express.js** - Provides a robust, scalable event-driven environment for handling concurrent API requests.
- **Primary Database: MongoDB Atlas** - Stores mission-critical data like assignment metadata, user progress, and attempt history due to its flexible schema and reliable cloud hosting.
- **SQL Execution Sandbox: PostgreSQL** - A dedicated instance where student queries are executed against real, isolated tables to ensure standards-compliant SQL practice.
- **LLM Integration: Gemini API** - Leverages state-of-the-art AI to analyze student errors and provide human-like, contextual hints based on the specific schema.

## Project Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ recommended.
- **MongoDB**: A connection string for an Atlas cluster or local instance.
- **PostgreSQL**: A running instance (local or cloud-hosted like Supabase/ElephantSQL).
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/).

### 2. Environment Variables Configuration
Create a `.env` file in the `/backend` directory. Below are the required keys:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | The local port for the backend server. | `5000` |
| `MONGODB_URI` | Connection string for MongoDB Atlas. | `mongodb+srv://...` |
| `POSTGRES_URI` | Connection string for the SQL sandbox. | `postgresql://user:pass@host:5432/...` |
| `LLM_API_KEY` | Your Gemini API Key for smart hints. | `AIzaSy...` |
| `LLM_PROVIDER` | Set this to `gemini` for this project. | `gemini` |

### 3. Backend Initialization
1. Navigate to `./backend`
2. Create your `.env` file using the template `.env.example`. Make sure you fill in `MONGODB_URI`, `POSTGRES_URI`, and `LLM_API_KEY`.
3. Install dependencies: 
   ```bash
   npm install
   ```
4. Run the seed script to wipe out old data and ingest the assignments JSON into both MongoDB and PostgreSQL:
    ```bash
    node seed.js
    ```
5. Start the backend DEV server:
    ```bash
    npm run dev
    ```

### 3. Frontend Initialization
1. Open a new terminal tab and navigate to `./frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend DEV server (usually http://localhost:5173):
   ```bash
   npm run dev
   ```

## Data-Flow Diagram
*(This is a required deliverable that must be hand-drawn)*
Here is the sequence illustrating the query flow:

1. **User Action**: Student clicks "Execute Query".
2. **Frontend Request**: React sends `POST /api/execute` containing the SQL string via Axios.
3. **Backend Validation**: Express.js Route validates query hasn't got DELETE/DROP commands.
4. **Postgres Connection**: Express connects to **PostgreSQL Sandbox**.
5. **Database Execution**: PostgreSQL runs the valid SELECT query against instantiated sample tables.
6. **Backend Response**: Results (`rowCount`, `rows`, `fields`) packaged as JSON payload and dispatched.
7. **Frontend State Updates**: React state `setResults(data)` captures the updated array.
8. **UI Render**: The dynamic `<table className="data-table">` is populated and displayed in the Results panel.

### Data-Flow Diagram Visual
![CipherSQLStudio Data Flow Diagram](./DataFlow/dfd.png)

---
Developed as part of the CipherSQLStudio Assignment. Happy Querying! 🚀
