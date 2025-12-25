# Spec: Test Infrastructure

## Context
The current codebase lacks a testing framework. To ensure stability and enable safe refactoring, we need to establish a testing strategy using Jest (for unit tests) and Playwright (for E2E tests).

## Requirements
1.  **Unit Testing:**
    *   Install and configure Jest.
    *   Refactor `content.js` to allow testing of utility functions (like `simpleHash`).
    *   Write a unit test for `simpleHash`.
2.  **E2E Testing:**
    *   Install and configure Playwright.
    *   Create a basic test harness that loads the extension.
3.  **CI/CD Prep:**
    *   Add `test:unit` and `test:e2e` scripts to `package.json`.

## Goals
*   Verify that `simpleHash` works correctly (unit test).
*   Verify that the extension can be loaded in a browser context (E2E test).
