// tests/benchmark_perf.js
const assert = require('assert');

// 1. Setup Mocks
global.document = {
    body: {},
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    createElement: (tag) => {
        return {
            tagName: tag.toUpperCase(),
            style: {},
            classList: { add: () => {} },
            append: () => {},
            setAttribute: () => {},
            dataset: {},
            textContent: '',
            innerText: ''
        };
    }
};

global.window = {};
global.firebase = {
    initializeApp: () => ({}),
    firestore: () => ({ collection: () => ({ doc: () => ({ collection: () => ({ add: () => {}, orderBy: () => ({ onSnapshot: () => {}, get: () => Promise.resolve([]) }) }) }) }) }),
    auth: () => ({ onAuthStateChanged: () => {} }),
    analytics: () => ({ logEvent: () => {} })
};
global.localStorage = {
    getItem: () => 'Test User',
    setItem: () => {}
};
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };

// Mock Node/Element
class MockNode {
    constructor(isNote = false, id = null) {
        this.nodeType = 1;
        this.isNote = isNote;
        this._dataset = {};
        this.innerText = isNote ? "Note Content " + (id || Math.random()) : "Other Content";
        this.children = [];
        this.tagName = 'DIV';
    }

    get dataset() { return this._dataset; }

    matches(selector) {
        if (selector === '.note-view') return this.isNote;
        return false;
    }

    querySelectorAll(selector) {
        if (selector === '.note-view') {
            return this.children.filter(c => c.isNote);
        }
        return [];
    }

    append(child) {
        this.children.push(child);
    }

    trim() { return this.innerText.trim(); }
}

global.Element = MockNode;

// 2. Import System Under Test
const content = require('../content.js');
const observeNotebookLM = content.observeNotebookLM;
const setDb = content.setDb;

// Initialize global variables in content.js
setDb(global.firebase.firestore());

// 3. Setup Benchmark Environment
const NUM_NODES = 10000;
const nodes = [];
for (let i = 0; i < NUM_NODES; i++) {
    nodes.push(new MockNode(i % 100 === 0, i)); // 1% are notes
}

// Override querySelectorAll to simulate O(N) scan
global.document.querySelectorAll = (selector) => {
    // console.log("Scanning " + NUM_NODES + " nodes...");
    if (selector === '.note-view') {
        return nodes.filter(n => n.isNote);
    }
    return [];
};

// capture observer callback
let observerCallback;
global.MutationObserver = class {
    constructor(cb) {
        observerCallback = cb;
    }
    observe() {}
};

// Initialize
observeNotebookLM();

// 4. Run Benchmark
console.log("Starting Benchmark...");

const start = performance.now();

// Simulate 100 mutations (e.g. user scrolling)
const ITERATIONS = 100;
let addedNotesCount = 0;

for (let i = 0; i < ITERATIONS; i++) {
    const isNote = true;
    const newNode = new MockNode(isNote, 'new-' + i);

    // In the REAL browser, the node is added to DOM, so querySelectorAll would find it.
    // In our Mock, we push it to 'nodes' array if we want querySelectorAll to find it.
    // The current implementation calls querySelectorAll, so we MUST update 'nodes'.
    nodes.push(newNode);

    // Fire mutation
    const mutationRecord = {
        addedNodes: [newNode],
        target: document.body
    };

    if (observerCallback) {
        observerCallback([mutationRecord], null);
    }

    if (newNode.dataset.nlcInjected === 'true') {
        addedNotesCount++;
    }
}

const end = performance.now();
console.log(`Time taken: ${(end - start).toFixed(2)}ms`);
console.log(`Injected notes: ${addedNotesCount}/${ITERATIONS}`);

// Verification
if (addedNotesCount !== ITERATIONS) {
    console.error("FAILED: Not all notes were injected!");
    process.exit(1);
}
