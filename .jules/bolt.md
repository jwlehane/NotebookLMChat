## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2025-02-18 - Performance Anti-Pattern: querySelectorAll in Observers
**Learning:** Calling `document.querySelectorAll` inside a `MutationObserver` callback forces a full DOM scan on every mutation (O(N)). This scales poorly with the number of elements.
**Action:** Iterate over `mutationsList` and inspect `addedNodes` directly. Use `node.matches(selector)` for individual elements and `node.querySelectorAll(selector)` only on added containers to limit the scope of the search to the changeset.
