## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2024-05-27 - Avoid querySelectorAll in MutationObserver
**Learning:** Calling `document.querySelectorAll` inside a `MutationObserver` callback causes a full document scan (O(N)) on every mutation event. Even with cheap property checks, the selector engine work scales with document size, leading to jank on large pages.
**Action:** Iterate over `mutationsList` and inspect `addedNodes` to limit processing to only the changed elements (O(M)). Use `node.matches(selector)` and `node.querySelectorAll(selector)` scoped to the added node.
