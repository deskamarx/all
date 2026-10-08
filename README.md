# AMAYA Executive Intelligence Hub — Windows Full-Stack & Web Edition

Real-time enterprise dashboard and operational intelligence pipeline integrating **Google Apps Script Live Web App API** with **Multi-Sheet Live Streams**.

---

## 🚀 Quick Start on Windows

### Option 1: 1-Click Windows Launcher (Recommended)
Double-click `Launch-App.bat`. It will automatically:
1. Verify Node.js environment
2. Install required packages
3. Sync live streams from Google Apps Script & Google Sheets
4. Build the application
5. Start the local server on `http://localhost:3000` and open your default browser.

### Option 2: Native Windows Desktop App (Electron)
Double-click `Run-Desktop-App.bat` or run:
```bash
npm run electron
```

### Option 3: PowerShell
Right-click `Start-Windows-App.ps1` and choose **Run with PowerShell**, or run:
```powershell
.\Start-Windows-App.ps1
```

---

## 🛠️ Developer Commands

| Command | Action |
|---|---|
| `npm run dev` | Launch Vite frontend dev server |
| `npm run server` | Start Express full-stack API backend on port 3000 |
| `npm run dev:all` | Run both Vite dev server and Express API concurrently |
| `npm run electron` | Run native Windows Electron desktop application |
| `npm run electron:dev` | Run Electron connected to live Vite dev server with HMR |
| `npm run sync` | Ingest and refresh live Google Apps Script + Google Sheets datasets |
| `npm run build` | Compile TypeScript, bundle Vite assets, and sync pipeline |

---

## 📡 Live Ingestion Architecture

- **Primary Executive API**: Google Apps Script Web App Endpoint (`/exec`) with 10,600+ records.
- **Live Deposits & Store Ledger**: Google Sheet Stream (`gid=257611599`) with 6,100+ transactions.
- **Device Inventory & Allocation**: Google Sheet Stream (`gid=1061898040`).
- **Additional Stream Channels**: Google Sheets `1bqkVehJun...` & `1mop7ZAi0...` (gracefully monitored with OAuth status).
- **Automated Sync Engine**: Background ingestion every 15 minutes, with manual on-demand `/api/sync` triggering.
