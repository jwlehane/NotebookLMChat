## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2024-05-24 - Performance Anti-Pattern: querySelectorAll in Observers
**Learning:** Using `document.querySelectorAll` inside a `MutationObserver` callback forces a full DOM scan on every mutation, leading to O(N * M) complexity where N is document size and M is mutation count.
**Action:** Always iterate through `mutationsList` and inspect `addedNodes` directly. Use `node.matches(selector)` and `node.querySelectorAll(selector)` scoped to the added node to limit traversal to the changed subtree (O(size of change)).
