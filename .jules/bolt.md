## 2024-05-24 - Performance Anti-Pattern: innerText in Observers
**Learning:** Accessing `innerText` inside a `MutationObserver` callback triggers forced synchronous layout (reflow) for every element. When done in a loop over all matching elements on every mutation, this causes O(N) reflows, degrading performance significantly as the list grows.
**Action:** Gate expensive DOM property accesses (like `innerText`, `offsetHeight`) with a cheap check (e.g., `element.dataset.processed`) to ensure they run only once per element.

## 2024-05-25 - Performance Anti-Pattern: Full Document Scan in MutationObserver
**Learning:** Using `document.querySelectorAll()` inside a `MutationObserver` callback forces a full document scan on every mutation (O(N)). Even with guard clauses, finding the elements takes linear time relative to DOM size.
**Action:** Iterate through `mutation.addedNodes` to process only new elements (O(M)), and perform a single initial scan when the observer starts.
