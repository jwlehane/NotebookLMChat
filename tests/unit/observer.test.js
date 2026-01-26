const { observeNotebookLM, setDb, injectedNotes } = require('../../content.js');

describe('observeNotebookLM', () => {
    let mockDb;
    let observerCallback;
    let originalMutationObserver;

    beforeAll(() => {
        // Mock MutationObserver
        originalMutationObserver = global.MutationObserver;
        global.MutationObserver = class {
            constructor(callback) {
                observerCallback = callback;
            }
            observe() {}
            disconnect() {}
        };

        // Mock chrome global
        global.chrome = {
            runtime: {
                getURL: jest.fn()
            }
        };
    });

    afterAll(() => {
        global.MutationObserver = originalMutationObserver;
        delete global.chrome;
    });

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        injectedNotes.clear();

        // Mock Firestore
        mockDb = {
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            onSnapshot: jest.fn((cb) => {
                // Mock snapshot
                const snapshot = [];
                snapshot.forEach = (fn) => {};
                cb(snapshot);
                return () => {};
            }),
            add: jest.fn().mockResolvedValue({})
        };
        setDb(mockDb);
    });

    test('should detect new note and inject chat UI', () => {
        // Start observing
        observeNotebookLM();

        // Create a note element
        const note = document.createElement('div');
        note.className = 'note-view';
        note.textContent = 'Test Note Content';
        // JSDOM might not implement innerText, so we mock it if needed
        Object.defineProperty(note, 'innerText', {
            get: () => note.textContent
        });

        document.body.appendChild(note);

        // Manually trigger the observer callback
        // In the current implementation, it queries the whole document, so mutationsList doesn't strictly matter
        // But for the optimization, it WILL matter.
        // We simulate a mutation list that contains the added node.
        const mutationsList = [{
            type: 'childList',
            addedNodes: [note],
            removedNodes: [],
            target: document.body
        }];

        observerCallback(mutationsList, new MutationObserver(() => {}));

        // Check if chat UI was injected
        expect(note.querySelector('.nlc-chat-container')).not.toBeNull();
        expect(mockDb.collection).toHaveBeenCalledWith('notebooklm-threads');
    });

    test('should not inject chat UI twice for the same note', () => {
        observeNotebookLM();

        const note = document.createElement('div');
        note.className = 'note-view';
        note.textContent = 'Test Note Content';
        Object.defineProperty(note, 'innerText', { get: () => note.textContent });
        document.body.appendChild(note);

        const mutationsList = [{ type: 'childList', addedNodes: [note], removedNodes: [], target: document.body }];

        // First trigger
        observerCallback(mutationsList, new MutationObserver(() => {}));
        expect(note.querySelectorAll('.nlc-chat-container').length).toBe(1);

        // Second trigger (simulating another mutation elsewhere)
        observerCallback(mutationsList, new MutationObserver(() => {}));
        expect(note.querySelectorAll('.nlc-chat-container').length).toBe(1);
    });
});
