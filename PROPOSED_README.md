# YouTube-AI-Navigator-Browser-Extension

![YouTube AI Navigator Hero Banner](https://via.placeholder.com/1200x400/007bff/ffffff?text=YouTube+AI+Navigator+Browser+Extension)

[![Build Status](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension/actions/workflows/ci.yml)
[![Code Coverage](https://codecov.io/gh/chirag127/YouTube-AI-Navigator-Browser-Extension/branch/main/graph/badge.svg?token=YOUR_CODECOV_TOKEN_HERE)](https://codecov.io/gh/chirag127/YouTube-AI-Navigator-Browser-Extension)
[![Top Language](https://img.shields.io/github/languages/top/chirag127/YouTube-AI-Navigator-Browser-Extension?style=flat-square)](https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension)
[![Framework](https://img.shields.io/badge/WXT-Toolkit-blue?style=flat-square)](https://wxt.dev)
[![Lint & Format](https://img.shields.io/badge/lint_format-Biome-0070a7?style=flat-square)](https://biomejs.dev)
[![License](https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey?style=flat-square)](LICENSE)

### Star ⭐ this Repo!
If you find this project valuable, please consider starring it to show your support!

---

## BLUF (Bottom Line Up Front)

**YouTube-AI-Navigator** is an apex-grade, privacy-first browser extension that transforms your YouTube experience with real-time, AI-powered insights and productivity tools. Leveraging Google Gemini, it delivers instant video summaries, smart transcripts, integrated SponsorBlock functionality, and advanced comment analysis, all with zero configuration and a steadfast commitment to user privacy.

---

## ARCHITECTURE: Feature-Sliced Design (FSD)

This project adheres to the robust [Feature-Sliced Design (FSD)](https://feature-sliced.design/) methodology, ensuring a highly modular, scalable, and maintainable codebase. Components are organized into distinct layers and slices, promoting strict dependency rules and clear separation of concerns.

mermaid
graph TD
    A[App Layer] --> P1(Processes Layer: Data Synchronization)
    A --> P2(Pages Layer: Popup UI)
    P2 --> W1(Widgets Layer: Summary Card)
    P2 --> W2(Widgets Layer: Transcript Viewer)
    W1 --> F1(Features Layer: AI Summarization)
    W2 --> F2(Features Layer: Interactive Transcript)
    F1 --> E1(Entities Layer: Video Data)
    F2 --> E1
    F1 --> E2(Entities Layer: Gemini API Client)
    F2 --> E2
    F3(Features Layer: SponsorBlock Integration) --> E1
    F4(Features Layer: Comment Analysis) --> E1
    F3 --> S1(Shared Layer: Browser APIs)
    F4 --> S1
    E1 --> S2(Shared Layer: Utilities, Types)
    E2 --> S2


---

## Table of Contents

*   [BLUF (Bottom Line Up Front)](#bluf-bottom-line-up-front)
*   [ARCHITECTURE: Feature-Sliced Design (FSD)](#architecture-feature-sliced-design-fsd)
*   [Table of Contents](#table-of-contents)
*   [🤖 AI Agent Directives](#ai-agent-directives)
*   [Key Features](#key-features)
*   [Installation](#installation)
*   [Development Setup](#development-setup)
*   [Available Scripts](#available-scripts)
*   [Core Principles](#core-principles)
*   [Contributing](#contributing)
*   [Security](#security)
*   [License](#license)

---

## 🤖 AI Agent Directives

<details>
<summary>Click to Expand: AI Agent Directives (CRITICAL for Development)</summary>

# SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

## 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

## 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**. This repository, `YouTube-AI-Navigator-Browser-Extension`, is a modern browser extension.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (Modern Frontend)**
    *   **Stack:** This project leverages **TypeScript 6.x (Strict)** for robust type safety, **Vite 7** with **WXT** (Web Extension Toolkit) for rapid development and optimized builds, and **TailwindCSS v4** for utility-first styling.
    *   **Lint/Test:** **Biome** for ultra-fast formatting and linting, **Vitest** for unit and component testing, and **Playwright** for end-to-end browser automation testing.
    *   **Architecture:** Adheres to the **Feature-Sliced Design (FSD)** methodology, ensuring strict layering and encapsulated features for maintainability and scalability, particularly for complex extension logic and UI components.
    *   **State Management:** Utilizes modern **Signals** patterns (e.g., SolidJS Signals or similar reactive primitives) for efficient and predictable state management within the extension.
    *   **AI Integration:** Deeply integrated with **Google Gemini API** (`gemini-3-pro` by default) for intelligent video content analysis, summarization, and transcription. Prioritize modular design, clear API contracts, and robust error handling for all AI model interactions.
    *   **Browser API Integration:** Direct interaction with Chrome/Firefox extension APIs, ensuring secure and performant content script injection, background service worker management, and message passing between different extension parts.

*   **SECONDARY SCENARIO B: SYSTEMS / PERFORMANCE (Low Level) - *Not applicable for this project. Reference only.***
    *   **Stack:** Rust (Cargo) or Go (Modules).
    *   **Lint:** Clippy / GolangCI-Lint.
    *   **Architecture:** Hexagonal Architecture (Ports & Adapters).

*   **SECONDARY SCENARIO C: DATA / AI / SCRIPTS (Python) - *Not applicable for this project. Reference only for potential future backend services.***
    *   **Stack:** uv (Manager), Ruff (Linter), Pytest (Test).
    *   **Architecture:** Modular Monolith or Microservices.

---

## 4. ARCHITECTURAL PATTERNS & PRINCIPLES
*   **Feature-Sliced Design (FSD):** Enforce strict FSD principles for organizing code.
    *   **Layers:** `app`, `processes`, `pages`, `widgets`, `features`, `entities`, `shared`.
    *   **Slices:** Each feature/entity is a self-contained slice.
    *   **Rules:** No direct dependency between higher and lower layers, explicit public API for each slice.
*   **SOLID Principles:** Ensure all classes and modules adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
*   **DRY (Don't Repeat Yourself):** Abstract common logic, components, and utilities.
*   **YAGNI (You Aren't Gonna Need It):** Avoid over-engineering; build only what is required for the current iteration.
*   **Atomic Design (for UI components):** Organize UI into Atoms, Molecules, Organisms, Templates, and Pages for consistency and reusability.

---

## 5. VERIFICATION COMMANDS & QUALITY GATES
Before any pull request, the following must pass with zero errors/warnings:

*   **Lint & Format:** `biome check . --apply-unsafe && biome format . --write`
*   **Type Check:** `tsc --noEmit`
*   **Unit Tests:** `vitest run`
*   **End-to-End Tests:** `playwright test`
*   **Build:** `wxt build` (or `npm run build` if WXT is wrapped)
*   **Security Scan:** `npm audit` (or equivalent supply chain security tool)

---

## 6. PROJECT CONTEXT & SCOPE
*   **Name:** `YouTube-AI-Navigator-Browser-Extension`
*   **Description:** Apex-grade, privacy-first browser extension for real-time, AI-powered YouTube analysis. Features Gemini summaries, smart transcripts, SponsorBlock, and advanced comment analysis. Privacy-first, zero-config.
*   **Core Functionality:** Enhance YouTube experience with AI-driven insights, content filtering, and productivity tools.
*   **Target Browsers:** Chrome, Firefox, Edge (via WXT cross-browser compatibility).

---

## 7. ETHICAL AI & PRIVACY CONSIDERATIONS
*   **Data Minimization:** Only collect data absolutely necessary for features.
*   **Local Processing:** Prioritize client-side processing where possible to enhance privacy.
*   **Transparency:** Clearly inform users about data usage and AI model interactions.
*   **Opt-in:** Features involving external AI APIs or data sharing should be opt-in.
*   **Anonymization:** Any aggregated telemetry must be fully anonymized.

---

## 8. DEVOPS & CI/CD STRATEGY
*   **Branching Model:** GitFlow or GitHub Flow, depending on project velocity.
*   **Automated Testing:** CI workflow triggers on push/PR for lint, type check, unit, and E2E tests.
*   **Automated Deployment:** CD workflow for publishing to browser stores (manual trigger or on release tag).
*   **Semantic Release:** Use semantic versioning and automated release notes generation.

---

## 9. DOCUMENTATION MANDATE
*   **README.md:** Comprehensive, up-to-date, self-contained project operating system.
*   **CONTRIBUTING.md:** Clear guidelines for contributions.
*   **SECURITY.md:** Vulnerability reporting and security policy.
*   **Code Comments:** Explain *why*, not just *what*. Focus on complex logic, edge cases, and architectural decisions.
*   **API Documentation:** JSDoc/TSDoc for all public functions, components, and types.

</details>

---

## Key Features

*   **Gemini-Powered Video Summaries:** Get concise, AI-generated summaries of any YouTube video in real-time, saving valuable time.
*   **Smart, Interactive Transcripts:** Access synchronized, searchable transcripts with enhanced readability and navigation.
*   **Integrated SponsorBlock:** Automatically skip sponsored segments, introductions, and outros for an uninterrupted viewing experience.
*   **Advanced Comment Analysis:** Utilize AI to categorize and summarize comments, highlighting key discussions or sentiments.
*   **Privacy-First Design:** No personal data collection, local processing where possible, and transparent AI interactions.
*   **Zero-Configuration:** Installs and works out-of-the-box with sensible defaults.
*   **Cross-Browser Compatibility:** Built with WXT for seamless experience across Chrome, Firefox, and Edge.

---

## Installation

### From Browser Web Stores (Recommended for Users)

YouTube-AI-Navigator will be available on the following browser stores upon official release:

*   [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) (Link will be active post-release)
*   [Firefox Add-ons](https://addons.mozilla.org/) (Link will be active post-release)
*   [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home) (Link will be active post-release)

### Manual Installation (For Developers & Early Adopters)

1.  **Clone the Repository:**
    bash
    git clone https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension.git
    cd YouTube-AI-Navigator-Browser-Extension
    
2.  **Install Dependencies:**
    bash
    npm install
    
3.  **Build for Development (Watch Mode):**
    bash
    npm run dev
    
    This will build the extension into the `.wxt` directory and watch for changes.
4.  **Load into your Browser:**
    *   **Chrome/Edge:**
        1.  Open `chrome://extensions` or `edge://extensions`.
        2.  Enable "Developer mode" (usually top right).
        3.  Click "Load unpacked" and select the `.wxt/chrome` directory inside your cloned repository.
    *   **Firefox:**
        1.  Open `about:debugging#/runtime/this-firefox`.
        2.  Click "Load Temporary Add-on..." and select the `manifest.json` file from the `.wxt/firefox` directory inside your cloned repository.

---

## Development Setup

Ensure you have Node.js (v18+) and npm (or pnpm/yarn) installed.

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension.git
    cd YouTube-AI-Navigator-Browser-Extension
    
2.  **Install dependencies using `npm`:**
    bash
    npm install
    
3.  **Create a `.env` file** in the project root with your Google Gemini API key:
    
    VITE_GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    
    (Replace `YOUR_GOOGLE_GEMINI_API_KEY` with your actual key. Obtain one from the [Google AI Studio](https://ai.google.dev/))

---

## Available Scripts

In the project directory, you can run:

| Script              | Description                                                                  |
| :------------------ | :--------------------------------------------------------------------------- |
| `npm run dev`       | Starts the development server in watch mode. Builds to `.wxt` directory.     |
| `npm run build`     | Builds the extension for production across all target browsers.              |
| `npm run zip`       | Zips the production builds for submission to browser stores.                 |
| `npm run test`      | Runs unit and component tests with Vitest.                                   |
| `npm run test:e2e`  | Runs end-to-end browser tests with Playwright.                               |
| `npm run lint`      | Lints and formats the codebase using Biome, fixing auto-fixable issues.      |
| `npm run lint:check`| Checks for linting and formatting issues without fixing them.                |
| `npm run typecheck` | Checks TypeScript files for type errors.                                     |

---

## Core Principles

This project is built upon a foundation of engineering excellence and ethical considerations:

*   **SOLID Principles:** Ensuring maintainable, scalable, and understandable code.
*   **DRY (Don't Repeat Yourself):** Promoting code reusability and minimizing redundancy.
*   **YAGNI (You Aren't Gonna Need It):** Focused development on current needs to avoid over-engineering.
*   **Privacy by Design:** Integrating privacy controls and data minimization from conception.
*   **Performance Optimization:** Delivering a fast and responsive user experience.
*   **Accessibility:** Striving for an inclusive design that is usable by everyone.

---

## Contributing

We welcome contributions from the community! Please refer to our [CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed guidelines on how to get started, report bugs, suggest features, and submit pull requests.

---

## Security

Your security is our top priority. Please review our [SECURITY.md](.github/SECURITY.md) to learn how to report vulnerabilities and understand our security practices.

---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License](LICENSE). This means you are free to share and adapt the work for non-commercial purposes, with appropriate attribution.

