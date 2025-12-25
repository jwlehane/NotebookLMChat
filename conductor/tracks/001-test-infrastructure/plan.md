# Plan: Test Infrastructure

## Phase 1: Setup & Dependencies
- [x] Initialize `package.json` if missing.
- [x] Install `jest`, `jest-environment-jsdom`.
- [x] Install `@playwright/test`.

## Phase 2: Unit Testing
- [x] Refactor `content.js` to extract `simpleHash` into a testable module/format.
- [x] Configure Jest.
- [x] Write `tests/unit/simpleHash.test.js`.
- [ ] Verify unit tests pass.

## Phase 3: E2E Infrastructure
- [x] Initialize Playwright config.
- [x] Create `tests/e2e/extension.spec.js`.
- [x] Write a basic test to load the extension.
- [ ] Verify E2E harness runs.

## Phase 4: Finalize
- [x] Update `package.json` with test scripts.
