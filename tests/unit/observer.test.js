
const { observeNotebookLM, injectedNotes, setDb } = require('../../content');

describe('observeNotebookLM Performance', () => {
    let observerCallback;
    let observeMock;
    let disconnectMock;
    let originalQuerySelectorAll;

    beforeEach(() => {
        // Reset state
        injectedNotes.clear();
        document.body.innerHTML = '';

        // Mock global objects
        global.chrome = {
            runtime: {
                getURL: jest.fn(path => path)
            }
        };

        global.firebase = {
            initializeApp: jest.fn(),
            firestore: jest.fn(() => ({
                collection: jest.fn(() => ({
                    doc: jest.fn(() => ({
                        collection: jest.fn(() => ({
                            add: jest.fn(),
                            orderBy: jest.fn(() => ({
                                onSnapshot: jest.fn()
                            }))
                        }))
                    }))
                }))
            })),
            auth: jest.fn(() => ({
                onAuthStateChanged: jest.fn(),
                signInAnonymously: jest.fn()
            })),
            analytics: jest.fn()
        };

        // Mock MutationObserver
        observeMock = jest.fn();
        disconnectMock = jest.fn();
        global.MutationObserver = jest.fn((cb) => {
            observerCallback = cb;
            return {
                observe: observeMock,
                disconnect: disconnectMock
            };
        });

        // Spy on querySelectorAll
        originalQuerySelectorAll = document.querySelectorAll;
        document.querySelectorAll = jest.fn((selector) => {
            const results = originalQuerySelectorAll.call(document, selector);
            results.forEach(el => {
                if (el.innerText === undefined) {
                    el.innerText = el.textContent;
                }
            });
            return results;
        });

        // Mock setDb to avoid errors
        setDb({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    collection: jest.fn(() => ({
                        add: jest.fn(),
                        orderBy: jest.fn(() => ({
                            onSnapshot: jest.fn(),
                            get: jest.fn(() => Promise.resolve([]))
                        })),
                        get: jest.fn(() => Promise.resolve([]))
                    }))
                }))
            }))
        });
    });

    afterEach(() => {
        document.querySelectorAll = originalQuerySelectorAll;
        jest.clearAllMocks();
    });

    test('should only scan document once initially, then rely on mutation records', () => {
        // Setup initial DOM with 3 notes
        document.body.innerHTML = `
            <div class="note-view">Note 1</div>
            <div class="note-view">Note 2</div>
            <div class="note-view">Note 3</div>
        `;

        observeNotebookLM();

        // Initial scan should happen
        expect(document.querySelectorAll).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll).toHaveBeenCalledWith('.note-view');

        // Trigger mutation 1: Unrelated change (no added nodes relevant to us)
        const unrelatedMutation = {
            type: 'attributes',
            target: document.body
        };
        observerCallback([unrelatedMutation], { observe: observeMock });

        // Should NOT call querySelectorAll again
        expect(document.querySelectorAll).toHaveBeenCalledTimes(1);
    });

    test('should detect added notes via mutation records without re-scanning document', () => {
        observeNotebookLM();
        expect(document.querySelectorAll).toHaveBeenCalledTimes(1); // Initial scan

        // Simulate adding a new note
        const newNote = document.createElement('div');
        newNote.className = 'note-view';
        newNote.textContent = 'New Note';

        // Mock innerText for the new note since JSDOM might not set it automatically
        Object.defineProperty(newNote, 'innerText', { value: 'New Note' });

        const mutation = {
            type: 'childList',
            addedNodes: [newNote]
        };

        // Call observer with the mutation
        observerCallback([mutation], { observe: observeMock });

        // Should NOT call querySelectorAll
        expect(document.querySelectorAll).toHaveBeenCalledTimes(1);

        // But should have processed the new note (checked by looking at injectedNotes or dataset)
        expect(newNote.dataset.nlcInjected).toBe('true');
    });

    test('should detect notes inside added containers', () => {
        observeNotebookLM();

        // Simulate adding a container with a note inside
        const container = document.createElement('div');
        const newNote = document.createElement('div');
        newNote.className = 'note-view';
        newNote.textContent = 'Nested Note';
        Object.defineProperty(newNote, 'innerText', { value: 'Nested Note' });

        container.appendChild(newNote);

        const mutation = {
            type: 'childList',
            addedNodes: [container]
        };

        // Call observer with the mutation
        observerCallback([mutation], { observe: observeMock });

        // Should call querySelectorAll on the *container*, not document
        // But wait, our mock implementation tracks calls to document.querySelectorAll.
        // If we use container.querySelectorAll, it won't be tracked by the spy on document.querySelectorAll.
        // We can verify that the note was processed.
        expect(newNote.dataset.nlcInjected).toBe('true');

        // And ensure document.querySelectorAll was not called again
        expect(document.querySelectorAll).toHaveBeenCalledTimes(1);
    });
});
