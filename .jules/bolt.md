## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2026-01-27 - Performance Anti-Pattern: document.querySelectorAll in Observers
**Learning:** Using `document.querySelectorAll` inside a `MutationObserver` callback causes O(N) scanning of the DOM on every mutation event, leading to severe performance degradation as the page grows.
**Action:** Iterate over `mutationsList` and inspect `addedNodes` directly using `matches()` and scoped `querySelectorAll()` to process only new elements.
