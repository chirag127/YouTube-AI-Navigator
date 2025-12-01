# 🌟 Pull Request Template: Apex Velocity Merge Request

**Author Guidelines:** Please ensure your branch adheres to **Conventional Commits** (e.g., `feat:`, `fix:`, `refactor:`). Review this template *before* submitting.

---

## 1. PR Type Classification (Check One)

- [ ] **Feature** (`feat`): A new capability or enhancement.
- [ ] **Bug Fix** (`fix`): Correcting incorrect behavior.
- [ ] **Refactor** (`refactor`): Code cleanup without changing external behavior.
- [ ] **Documentation** (`docs`): Updates to README, CONTRIBUTING, or other static assets.
- [ ] **CI/CD** (`chore`): Workflow or configuration changes.
- [ ] **Testing** (`test`): Adding or improving test coverage.

## 2. Summary & Motivation

**Bottom Line Up Front (BLUF):** Describe the primary outcome of this change in one sentence.

<!-- Describe the 'Why' and 'What' here. Reference relevant issues if necessary. -->

## 3. Architectural Alignment & Verification

This section ensures adherence to the **Apex Technical Authority** standards.

### 3.1. Architectural Impact

*   **SOLID Principle Addressed:** Which principle does this PR enforce or maintain? (e.g., Single Responsibility - SRP)
*   **Design Pattern Used/Modified:** (e.g., Observer, State Management via Signals)

### 3.2. Testing & Coverage

**MANDATE:** All changes must be verified.

*   [ ] **Unit Tests Added/Updated?** (Resides in `tests/unit/`)
*   [ ] **E2E Tests Added/Updated?** (Resides in `tests/e2e/` - If applicable for extension functionality)
*   [ ] **Coverage Target:** Did this maintain or exceed **100% Branch Coverage** for the affected files?

### 3.3. Security Review (Zero Trust Mandate)

*   [ ] **Input Sanitization:** Were all new external inputs (DOM, API responses) rigorously sanitized against XSS/Injection vectors?
*   [ ] **Secrets Management:** No hardcoded secrets committed.

## 4. Code Self-Review Checklist

*   [ ] **Readability:** Does the code use semantic naming? Is nesting minimal (Guard Clauses used)?
*   [ ] **DRY/KISS:** Are there opportunities to simplify or extract reusable logic?
*   [ ] **Performance:** Are there any $O(n^2)$ loops or synchronous blocking operations that could be optimized?
*   [ ] **Self-Documenting:** Are comments only used for *Why*, not *What*?

## 5. Linked Resources

*   **Issue Tracker:** Fixes #XXXX or Closes #XXXX
*   **External Reference (If applicable):** 

---

**Repository:** `YouTube-AI-Navigator-Browser-Extension`
**URL Anchor:** `https://github.com/chirag127/YouTube-AI-Navigator-Browser-Extension`