// Dynamically load Firebase scripts from CDN and use the global firebase object
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function loadFirebase() {
    await loadScript(chrome.runtime.getURL('firebase-config.js'));
    await loadScript(chrome.runtime.getURL('firebase-app-compat.js'));
    await loadScript(chrome.runtime.getURL('firebase-auth-compat.js'));
    await loadScript(chrome.runtime.getURL('firebase-firestore-compat.js'));
    await loadScript(chrome.runtime.getURL('firebase-analytics-compat.js'));
}

// --- DIAGNOSTIC ---
console.log("NotebookLM Chat: content.js script has started.");

// --- Firebase Configuration ---
// Firebase project configuration is loaded from firebase-config.js

// --- Global Variables ---
let db, auth, analytics;
let userId = null;
let userDisplayName = 'Anonymous';
const injectedNotes = new Set(); // Keep track of which notes we've already enhanced

// --- Main Initialization ---
async function main() {
    console.log("NotebookLM Chat: Main function running.");
    try {
        await loadFirebase();
        // Use the compat (namespaced) API
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        try {
            analytics = firebase.analytics();
        } catch (err) {
            analytics = null;
            console.warn("Firebase Analytics is not available in this environment.");
        }

        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in.
                userId = user.uid;
                console.log('NotebookLM Chat: Authenticated with user ID:', userId);
                if (analytics) {
                    analytics.logEvent('login', { method: 'anonymous', user_id: userId });
                }

                // Prompt for a display name if not set
                if (!localStorage.getItem('nlc_displayName')) {
                    const name = prompt("Enter your name or alias for chat:", "User");
                    if (name) {
                        localStorage.setItem('nlc_displayName', name);
                        userDisplayName = name;
                    }
                } else {
                    userDisplayName = localStorage.getItem('nlc_displayName');
                }
                // Start observing the DOM for notes
                observeNotebookLM();
            } else {
                // User is signed out. Sign in anonymously.
                auth.signInAnonymously().catch(error => {
                    console.error("Anonymous sign-in failed:", error);
                });
            }
        });
    } catch (e) {
        console.error("Error initializing Firebase:", e);
    }
}

// --- DOM Observation ---
function processNote(note) {
    // Optimization: Skip nodes we've already processed to avoid expensive innerText reads
    if (note.dataset.nlcInjected) return;

    // Use textContent if innerText is missing (e.g. in some test envs or detached nodes),
    // but prefer innerText for visible text.
    const noteContent = (note.innerText || note.textContent || '').trim();
    const noteId = simpleHash(noteContent);

    if (noteContent) {
        // Mark as processed immediately so we don't re-scan this node
        note.dataset.nlcInjected = 'true';

        if (!injectedNotes.has(noteId)) {
            // --- DIAGNOSTIC ---
            console.log(`NotebookLM Chat: Found new note to inject. ID: ${noteId}`);
            injectChatUI(note, noteId);
            injectedNotes.add(noteId);
        }
    }
}

function observeNotebookLM() {
    const noteSelector = '.note-view';
    console.log(`NotebookLM Chat: Setting up MutationObserver to look for '${noteSelector}'`);

    // Process existing notes immediately
    document.querySelectorAll(noteSelector).forEach(processNote);

    const observer = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.matches && node.matches(noteSelector)) {
                            processNote(node);
                        }
                        // Check descendants if the added node is a container
                        if (node.querySelectorAll) {
                            const notes = node.querySelectorAll(noteSelector);
                            if (notes.length > 0) {
                                console.log(`NotebookLM Chat: Found ${notes.length} note elements in added node.`);
                                notes.forEach(processNote);
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('NotebookLM Chat: Observing for notes...');
}

// --- UI Injection ---
function injectChatUI(noteElement, noteId) {
    console.log(`Injecting chat UI for note ID: ${noteId}`);
    if (analytics) {
        analytics.logEvent('view_thread', { note_id: noteId });
    }

    const container = document.createElement('div');
    container.className = 'nlc-chat-container';

    const title = document.createElement('h3');
    title.textContent = 'Threaded Discussion';

    const threadView = document.createElement('div');
    threadView.className = 'nlc-thread-view';

    const replyInput = document.createElement('textarea');
    replyInput.className = 'nlc-reply-input';
    replyInput.placeholder = `Reply as ${userDisplayName}...`;
    replyInput.rows = 2;

    const actionBar = document.createElement('div');
    actionBar.className = 'nlc-action-bar';

    const buttonsContainer = document.createElement('div');

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.className = 'nlc-button';
    submitButton.onclick = () => {
        if (replyInput.value.trim()) {
            addMessageToThread(noteId, replyInput.value.trim());
            replyInput.value = '';
        }
    };

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Thread';
    copyButton.className = 'nlc-button nlc-secondary-button';
    copyButton.onclick = () => copyThreadToClipboard(noteId, noteElement.innerText);

    buttonsContainer.append(submitButton);
    actionBar.append(buttonsContainer, copyButton);
    container.append(title, threadView, replyInput, actionBar);
    noteElement.append(container);

    listenToThread(noteId, threadView);
}

// --- Firestore Logic ---
async function addMessageToThread(noteId, text) {
    if (!userId) {
        console.error("No user signed in. Cannot send message.");
        return;
    }
    try {
        if (analytics) {
            analytics.logEvent('post_message', { note_id: noteId, character_length: text.length });
        }
        const threadRef = db.collection('notebooklm-threads').doc(noteId).collection('messages');
        await threadRef.add({
            text: text,
            authorName: userDisplayName,
            authorId: userId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error("Error adding message to Firestore: ", e);
    }
}

function listenToThread(noteId, threadViewElement) {
    const threadRef = db.collection('notebooklm-threads').doc(noteId).collection('messages');
    threadRef.orderBy('timestamp').onSnapshot(snapshot => {
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        renderThread(messages, threadViewElement);
    });
}

// --- UI Rendering & Helpers ---
function renderThread(messages, threadViewElement) {
    threadViewElement.innerHTML = ''; // Clear existing messages
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'nlc-message';
        
        const authorP = document.createElement('p');
        authorP.className = 'nlc-message-author';
        authorP.textContent = msg.authorName || 'Anonymous';
        
        const textP = document.createElement('p');
        textP.className = 'nlc-message-text';
        textP.textContent = msg.text;
        
        messageDiv.append(authorP, textP);
        threadViewElement.append(messageDiv);
    });
    threadViewElement.scrollTop = threadViewElement.scrollHeight;
}

async function copyThreadToClipboard(noteId, originalNoteText) {
    if (analytics) {
        analytics.logEvent('copy_thread', { note_id: noteId });
    }
    const threadRef = db.collection('notebooklm-threads').doc(noteId).collection('messages');
    const snapshot = await threadRef.orderBy('timestamp').get();

    let clipboardText = `Original Note:\n---\n${originalNoteText}\n---\n\nDiscussion Thread:\n`;
    const messages = [];
    snapshot.forEach(doc => messages.push(doc.data()));

    if (messages.length === 0) {
        clipboardText += "(No discussion yet.)";
    } else {
        messages.forEach(msg => {
            clipboardText += `\n[${msg.authorName}]: ${msg.text}`;
        });
    }

    navigator.clipboard.writeText(clipboardText).then(() => {
        alert('Thread copied to clipboard! You can now paste it into a new note to make it a source.');
    }).catch(err => {
        console.error('Failed to copy thread: ', err);
    });
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; // Convert to 32bit integer
    }
    return 'note-' + Math.abs(hash);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        simpleHash,
        observeNotebookLM,
        injectedNotes,
        setDb: (newDb) => { db = newDb; }
    };
}

// --- Entry Point ---
// Only run main if not in a test environment (basic check)
if (typeof module === 'undefined' || !module.exports) {
    main();
}
