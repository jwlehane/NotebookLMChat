
class MockNode {
    constructor(tagName, id) {
        this.tagName = tagName;
        this.id = id;
        this.children = [];
        this.dataset = {};
        this.innerText = "Sample Note Content " + id;
        this.nodeType = 1;
    }

    appendChild(node) {
        this.children.push(node);
    }

    querySelectorAll(selector) {
        let results = [];
        if (this.matches(selector)) results.push(this);
        for (const child of this.children) {
            results = results.concat(child.querySelectorAll(selector));
        }
        return results;
    }

    matches(selector) {
        if (selector === '.note-view') return this.tagName === 'NOTE-VIEW';
        return false;
    }
}

const document = {
    body: new MockNode('BODY', 'body'),
    querySelectorAll: (selector) => document.body.querySelectorAll(selector)
};

let checks = 0;

function oldObserverCallback(mutations, observer) {
    const notes = document.querySelectorAll('.note-view');
    notes.forEach(note => {
        checks++;
        if (note.dataset.nlcInjected) return;
        note.dataset.nlcInjected = 'true';
    });
}

function processNote(note) {
    checks++;
    if (note.dataset.nlcInjected) return;
    note.dataset.nlcInjected = 'true';
}

function newObserverCallback(mutations, observer) {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (node.matches('.note-view')) {
                    processNote(node);
                }
                const nested = node.querySelectorAll('.note-view');
                nested.forEach(processNote);
            }
        });
    }
}

function runBenchmark(label, callback) {
    checks = 0;
    document.body.children = [];

    const BATCHES = 50;
    const NOTES_PER_BATCH = 10;

    for (let i = 0; i < BATCHES; i++) {
        const addedNodes = [];
        for (let j = 0; j < NOTES_PER_BATCH; j++) {
            const note = new MockNode('NOTE-VIEW', `note-${i}-${j}`);
            document.body.appendChild(note);
            addedNodes.push(note);
        }
        callback([{ addedNodes: addedNodes, type: 'childList' }], null);
    }

    console.log(`${label}: Total checks = ${checks}`);
}

console.log("--- Benchmarking ---");
runBenchmark("Old Approach", oldObserverCallback);
runBenchmark("New Approach", newObserverCallback);
