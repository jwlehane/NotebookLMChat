# Workflow

## Test Driven Development (TDD) Protocol

We follow a strict TDD cycle for all logic changes:

1.  **Red:** Write a failing test for the new functionality.
    *   For pure logic: Use Jest (`tests/unit/`).
    *   For UI/Integration: Use Playwright (`tests/e2e/`).
2.  **Green:** Write the minimum amount of code to pass the test.
3.  **Refactor:** Clean up the code while ensuring tests still pass.

## Branching Strategy
*   Use feature branches (e.g., `feature/add-login`).
*   PRs require all tests to pass.

## Conductor Usage
*   **New Feature:** Run `/conductor:newTrack "Description"` to generate a spec and plan.
*   **Implementation:** Follow the generated plan.md.
