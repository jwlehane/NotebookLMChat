## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2024-05-24 - Performance Anti-Pattern: Full DOM Scans in Observers
**Learning:** Using `document.querySelectorAll` inside a `MutationObserver` callback causes O(N) complexity for every DOM mutation, even unrelated ones. This leads to severe performance degradation as the DOM grows.
**Action:** Always inspect `mutationsList` for `addedNodes` and scope queries to the added subtrees (O(M) where M is mutation size).
