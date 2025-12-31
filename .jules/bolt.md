## 2024-05-23 - MutationObserver Performance Pitfall
**Learning:** Querying `innerText` inside a `MutationObserver` callback is a massive performance killer because it forces reflows (layout thrashing) on every DOM mutation. Even if the value hasn't changed, the browser must recalculate layout to determine the text.
**Action:** Always check `dataset` flags or cache before accessing layout-dependent properties like `innerText` in loops. Prefer `textContent` when possible as it doesn't trigger reflows.
