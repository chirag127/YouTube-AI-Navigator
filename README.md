# YouTube AI Navigator

<p align="center">
  <img src="https://raw.githubusercontent.com/chirag127/chirag127/main/assets/repository_placeholders/youtube-ai-navigator.png" alt="YouTube AI Navigator Hero Banner" width="800"/>
</p>

<p align="center">
    <a href="https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/chirag127/YouTube-AI-Navigator-Browser-Extension/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white" alt="Build Status"></a>
    <a href="https://codecov.io/gh/chirag127/YouTube-AI-Navigator-Browser-Extension"><img src="https://img.shields.io/codecov/c/github/chirag127/YouTube-AI-Navigator-Browser-Extension?style=flat-square&logo=codecov&logoColor=white" alt="Code Coverage"></a>
    <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Framework-WXT-orange?style=flat-square&logo=googlechrome&logoColor=white" alt="WXT Framework">
    <img src="https://img.shields.io/badge/Linter-Biome-blueviolet?style=flat-square&logo=biome&logoColor=white" alt="Biome Linter">
    <a href="https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/blob/main/LICENSE"><img src="https://img.shields.io/github/license/chirag127/YouTube-AI-Navigator-Browser-Extension?style=flat-square&color=black" alt="License"></a>
    <a href="https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/stargazers"><img src="https://img.shields.io/github/stars/chirag127/YouTube-AI-Navigator-Browser-Extension?style=flat-square&logo=github&logoColor=white" alt="GitHub Stars"></a>
</p>

<p align="center">
  <strong>Apex-grade, privacy-first browser extension for real-time, AI-powered YouTube analysis.</strong>
  <br />
  Features Gemini summaries, smart transcripts, SponsorBlock, and advanced comment analysis. Privacy-first, zero-config.
</p>

<p align="center">
  <a href="https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/stargazers"><strong>Star ⭐ this Repo</strong></a> if you find it useful!
</p>

---

## Table of Contents

- [✨ Key Features](#-key-features)
- [🏛️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [🤖 AI Agent Directives](#-ai-agent-directives)
- [🤝 Contributing](#-contributing)
- [🛡️ Security Policy](#️-security-policy)
- [📄 License](#-license)

## ✨ Key Features

- **🧠 Gemini-Powered Summaries:** Get instant, concise summaries of any video, saving you hours of viewing time.
- **💬 Smart Transcripts:** Navigate videos with searchable, time-stamped transcripts that are easy to read and reference.
- **🚫 Integrated SponsorBlock:** Automatically skip sponsors, intros, outros, and other annoying segments.
- **📊 Advanced Comment Analysis:** Instantly gauge sentiment and identify key topics in the comments section.
- **🔐 Privacy First:** All processing is done to maximize your privacy. No user data is stored or tracked.
- **⚙️ Zero-Config:** Install and go. The extension works out-of-the-box with sensible defaults.

## 🏛️ Architecture

This repository follows a strict Feature-Sliced Design (FSD) for maximum scalability and maintainability. All source code is contained within the `extension/` directory, and all tests are isolated in the `tests/` directory.

sh
.YouTube-AI-Navigator-Browser-Extension/
├── .github/                # GitHub Actions, issue templates, PR templates
├── .vscode/                # VSCode settings for consistent development
├── extension/              # PRODUCTION-ONLY ZONE: All source code
│   ├── assets/             # Icons, fonts, and other static assets
│   ├── entrypoints/        # Content scripts, background service workers, popups
│   │   ├── background.ts
│   │   └── content.ts
│   ├── features/           # Feature-Sliced Design: Self-contained features
│   │   ├── summary-generator/
│   │   └── transcript-navigator/
│   ├── services/           # Shared services (e.g., Gemini API client)
│   ├── types/              # Global TypeScript type definitions
│   └── wxt.config.ts       # WXT framework configuration
├── tests/                  # VERIFICATION-ONLY ZONE: All tests and validation scripts
│   ├── e2e/                # Playwright end-to-end tests
│   ├── unit/               # Vitest unit tests
│   └── scripts/            # Verification and validation scripts
├── .gitignore
├── LICENSE
├── package.json
└── README.md


## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm (or npm/yarn)

### Installation & Setup

1.  **Clone the repository:**
    sh
    git clone https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension.git
    cd YouTube-AI-Navigator-Browser-Extension
    

2.  **Install dependencies:**
    sh
    pnpm install
    

3.  **Run the development server:**
    sh
    pnpm dev
    

4.  **Load the extension in your browser:**
    - **Chrome:** Go to `chrome://extensions`, enable "Developer mode", and load the `extension/.output/chrome-mv3` directory.
    - **Firefox:** Go to `about:debugging`, click "This Firefox", and load the `extension/.output/firefox-mv2/manifest.json` file.

### Available Scripts

| Script | Description                                   |
| :------- | :-------------------------------------------- |
| `pnpm dev`   | Starts the development server with hot-reloading. |
| `pnpm build` | Builds the extension for production.          |
| `pnpm test`  | Runs the unit test suite (Vitest).            |
| `pnpm lint`  | Lints and formats the codebase using Biome.   |
| `pnpm zip`   | Zips the production builds for distribution.  |

---

## 🤖 AI Agent Directives

<details>
<summary><strong>Expand for Apex Technical Authority Instructions (2026 Standard)</strong></summary>

### SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

#### 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards.
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

#### 2. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
This project is identified as **SCENARIO A: WEB / APP / EXTENSION (TypeScript)**. You **MUST** adhere to this toolchain.

*   **Stack:** **TypeScript 6.x** (Strict), **Vite 7** (via Rolldown), **WXT** (Web Extension Framework).
*   **State Management:** **Signals** (Standardized Pattern).
*   **Linting/Formatting:** **Biome** (Primary). Enforce 100% compliance.
*   **Testing:** **Vitest** (Unit/Integration), **Playwright** (E2E).

#### 3. AI ORCHESTRATION & GEMINI PROTOCOL (DECEMBER 2025)
This extension uses Gemini. Follow this **Fallback Cascade** for all AI integrations.
*   **Tier 1 (Intelligence):** `gemini-3-pro` - Multimodal Reasoning.
*   **Tier 2 (Reasoning):** `gemini-2.5-pro` - Deep analysis/STEM.
*   **Tier 3 (Balanced):** `gemini-2.5-flash` - High Volume/Low Latency.
*   **Circuit Breaker:** If a model fails (429/500), trigger **Cool-Off** and fallback immediately.

#### 4. RECURSIVE PERFECTION LOOP (THE "ZERO-ERROR" MANDATE)
The Loop: **Analyze -> Fix -> Lint -> Test -> DECISION GATE**. Do not stop until the build is perfectly clean.

#### 5. CORE ARCHITECTURAL PRINCIPLES
*   **SOLID MANDATE:** SRP, OCP, LSP, ISP, DIP.
*   **ROOT DIRECTORY HYGIENE:** The root is for config ONLY. All source code is in `extension/`. All verification code is in `tests/`.
*   **MODULARITY:** Feature-First Structure (`extension/features/summary-generator`), not by type (`controllers/`, `views/`).

#### 6. COMPREHENSIVE TESTING & VERIFICATION STRATEGY
*   **FOLDER SEPARATION PROTOCOL (STRICT):**
    *   **Production Purity:** The `extension/` folder is a **Production-Only Zone**. It must contain **ZERO** test files or scripts.
    *   **Total Containment:** **ALL** verification scripts, validation runners, and test specs must reside exclusively in `tests/`.
    *   **Structure:** `tests/unit/`, `tests/e2e/`, `tests/scripts/`.
*   **COVERAGE MANDATE:** Aim for 100% Branch Coverage. Every source file in `extension/` MUST have a corresponding test file in `tests/`.

#### 7. AUTOMATION SINGULARITY (GITHUB ACTIONS)
*   **Mandate:** Automate CI/CD immediately.
*   **Workflows:** `ci.yml` for linting/testing, `release.yml` for semantic versioning and artifact upload.

</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow the guidelines outlined in [CONTRIBUTING.md](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/blob/main/.github/CONTRIBUTING.md). We adhere to a strict code of conduct and expect all contributors to do the same.

## 🛡️ Security Policy

For information on reporting security vulnerabilities, please refer to our [SECURITY.md](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/blob/main/.github/SECURITY.md) file.

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License** - see the [LICENSE](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/blob/main/LICENSE) file for details.
