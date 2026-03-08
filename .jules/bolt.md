## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2025-01-28 - MutationObserver Optimization: addedNodes vs querySelectorAll
**Learning:** Using `document.querySelectorAll` inside a `MutationObserver` callback causes O(N) scans on every mutation (where N is total DOM size), leading to quadratic complexity during bulk updates. Iterating over `mutation.addedNodes` scales with the size of the update (O(Δ)), which is significantly more performant.
**Action:** Always prefer checking `addedNodes` (and their subtrees via `node.querySelectorAll`) in observer callbacks. Perform a single full scan at initialization.
