## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2024-05-24 - MutationObserver & Streaming Content
**Learning:** Optimizing `MutationObserver` by only checking `addedNodes` misses updates where text is streamed into existing elements (via `Text` node insertion). This causes the observer to miss content updates in LLM-generated streams.
**Action:** When optimizing observers, also check `mutation.target` (and its ancestors) to detect modifications *inside* relevant components, not just new component insertions.
