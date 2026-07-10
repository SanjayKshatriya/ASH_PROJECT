# 🌾 AgroSmartHub 3.0 — AI-Powered Smart Agriculture Platform

[![Android E2E Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/android-e2e.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/android-e2e.yml)
[![GitHub Pages](https://img.shields.io/badge/Reports-GitHub%20Pages-22c55e?logo=github)](https://YOUR_USERNAME.github.io/YOUR_REPO/reports/latest/execution-report.html)

AgroSmartHub 3.0 is an AI-powered smart agriculture platform featuring crop disease detection, IoT monitoring, digital quality certification, and an agricultural marketplace.

---

## 🧪 Automated E2E Testing

This project uses **Appium + WebdriverIO** to run end-to-end tests on Android (Chrome mobile browser) via GitHub Actions.

### 📊 Live Test Report

> **[View Latest Test Report →](https://YOUR_USERNAME.github.io/YOUR_REPO/reports/latest/execution-report.html)**

Reports are automatically published to GitHub Pages on every push to `main`.

---

## 📁 Project Structure

```
PROJECT-ASH/
├── .github/
│   └── workflows/
│       ├── android-e2e.yml        # Main CI/CD: test → report → deploy
│       └── deploy-reports.yml     # Manual re-deploy workflow
│
├── e2e/                           # Appium test framework
│   ├── package.json
│   ├── wdio.conf.js               # WebdriverIO configuration
│   ├── .gitignore
│   ├── test/
│   │   └── specs/
│   │       ├── 01_landing.spec.js       # Landing page tests
│   │       ├── 02_auth.spec.js          # Authentication tests
│   │       ├── 03_dashboard.spec.js     # Dashboard tests
│   │       ├── 04_ai_detection.spec.js  # AI detection tests
│   │       └── 05_marketplace.spec.js   # Marketplace tests
│   └── scripts/
│       ├── generate-html-report.js    # Rich HTML report generator
│       ├── generate-excel-report.js   # Excel report generator (3 sheets)
│       └── generate-summary.js        # GitHub Actions Job Summary
│
├── Test Results/                  # Generated reports (gitignored in CI)
│   ├── HTML/
│   │   └── execution-report.html
│   ├── Excel/
│   │   └── Automation_Test_Report.xlsx
│   ├── Screenshots/               # Failure screenshots
│   ├── Logs/                      # Appium & backend logs
│   └── Summary/
│       └── summary.md
│
├── backend/                       # Express.js API server
├── css/                           # Vanilla CSS styles
├── js/                            # Frontend JavaScript
└── index.html                     # Main frontend entry point
```

### GitHub Pages Report Structure

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
│
reports/
├── latest/                        # Always latest run
│   ├── execution-report.html
│   ├── summary.md
│   ├── screenshots/
│   └── logs/
└── history/
    ├── build-001/
    ├── build-002/
    └── build-NNN/
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| Java (JDK) | 17 |
| Android Studio | Latest (with SDK) |
| Appium | 2.x |
| Android Emulator | API 33 |

### Local E2E Setup

```bash
# 1. Install e2e dependencies
cd e2e
npm install

# 2. Install Appium globally
npm install -g appium@latest

# 3. Install UiAutomator2 driver
appium driver install uiautomator2

# 4. Start backend
cd ../backend
npm install
npm start   # Runs on http://localhost:5000

# 5. Create & start Android emulator (in Android Studio or via CLI)
avdmanager create avd --name test-avd \
  --abi google_apis/x86_64 \
  --package "system-images;android-33;google_apis;x86_64"

emulator -avd test-avd -no-snapshot &

# 6. Run tests
cd ../e2e
npm test

# 7. Generate reports
npm run report:all
```

### Report Locations After Running

| Report | Path |
|--------|------|
| HTML Report | `Test Results/HTML/execution-report.html` |
| Excel Report | `Test Results/Excel/Automation_Test_Report.xlsx` |
| Summary | `Test Results/Summary/summary.md` |
| Screenshots | `Test Results/Screenshots/` |
| Logs | `Test Results/Logs/` |

---

## ⚙️ GitHub Actions CI/CD

### Workflow: `android-e2e.yml`

**Triggers:** Push to `main`/`master`/`develop`, Pull Requests to `main`, Manual dispatch.

**Steps:**
1. Checkout code
2. Enable KVM acceleration
3. Setup Java 17
4. Setup Android SDK
5. Create & start Android emulator (API 33)
6. Start backend server
7. Install E2E dependencies
8. Install Appium + UiAutomator2 driver
9. Start Appium server
10. Run WebdriverIO tests
11. Generate HTML report
12. Generate Excel report
13. Generate summary + GitHub Actions Job Summary
14. Upload artifacts (retained 30 days)
15. Deploy to GitHub Pages
16. Comment report URL on PR

### Enabling GitHub Pages

1. Push code to GitHub
2. Go to **Settings → Pages**
3. Set Source to **"GitHub Actions"** (or **Deploy from branch: `gh-pages`**)
4. After the first successful workflow run, your report will be live at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/reports/latest/execution-report.html
   ```

### Optional Secrets

| Secret | Purpose |
|--------|---------|
| `TEST_USER_EMAIL` | Demo login email for successful auth test |
| `TEST_USER_PASSWORD` | Demo login password for successful auth test |

---

## 📊 Test Suites

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Landing Page | `01_landing.spec.js` | 10 | Nav, logo, hero, CTA, performance |
| Authentication | `02_auth.spec.js` | 8 | Login form, validation, error states |
| Dashboard | `03_dashboard.spec.js` | 9 | Sections, responsive, meta tags |
| AI Detection | `04_ai_detection.spec.js` | 8 | File upload, API health, results UI |
| Marketplace | `05_marketplace.spec.js` | 9 | Products, search, filter, journey |
| **Total** | | **44** | |

---

## 🏗 Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/ai/detect` | Crop disease detection |
| GET | `/api/products` | List products |
| GET | `/api/certificates` | List certificates |

---

## 📄 License

MIT License — AgroSmartHub 3.0 Team
