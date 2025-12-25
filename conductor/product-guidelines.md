# Product Guidelines

## Coding Standards
*   **Language:** Vanilla JavaScript (ES6+).
*   **Style:** Clean, readable code with comments explaining "Why".
*   **Naming:** CamelCase for variables/functions.
*   **Error Handling:** Robust error catching, especially for Firebase and DOM interactions.
*   **Imports:** Use explicit imports where possible, but be mindful of browser support in content scripts.

## Design Principles
*   **Integration:** UI should feel native to NotebookLM (minimalist, clean lines).
*   **Non-intrusive:** The extension should not break existing NotebookLM functionality.
*   **Resilience:** The extension should handle DOM changes gracefully (or fail silently without crashing the page).
