
import os
from playwright.sync_api import sync_playwright

os.makedirs("/home/jules/verification", exist_ok=True)

HTML_PATH = os.path.abspath("tests/manual/test.html")
CONTENT_JS_PATH = os.path.abspath("content.js")

def test_frontend(page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("pageerror", lambda msg: print(f"PAGE ERROR: {msg}"))

    page.goto(f"file://{HTML_PATH}")

    # Inject Mocks
    page.evaluate("""
        window.chrome = {
            runtime: {
                getURL: (path) => path
            }
        };

        // Mock config
        window.firebaseConfig = { apiKey: 'mock' };

        window.firebase = {
            initializeApp: () => ({}),
            firestore: () => ({
                collection: () => ({
                    doc: () => ({
                        collection: () => ({
                            add: async () => {},
                            orderBy: () => ({
                                onSnapshot: (cb) => {
                                    cb({ forEach: () => {} });
                                },
                                get: async () => ({ forEach: () => {} })
                            })
                        })
                    })
                })
            }),
            auth: () => ({
                onAuthStateChanged: (cb) => {
                    cb({ uid: 'mock-user-123' });
                },
                signInAnonymously: async () => {}
            }),
            analytics: () => { throw new Error("No analytics"); }
        };
        window.firebase.firestore.FieldValue = {
            serverTimestamp: () => 'timestamp'
        };

        window.prompt = () => "Mock User";
        localStorage.setItem('nlc_displayName', 'Mock User');
    """)

    with open(CONTENT_JS_PATH, "r") as f:
        content_js = f.read()

    old_code = """function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}"""

    new_code = """function loadScript(src) {
    console.log("Mock Loading: " + src);
    return Promise.resolve();
}"""

    if old_code in content_js:
        patched_js = content_js.replace(old_code, new_code)
    else:
        # Fallback if whitespace differs
        patched_js = content_js.replace(
            "document.head.appendChild(s);",
            "resolve();"
        )

    # Inject content.js
    page.evaluate(patched_js)

    print("Waiting for chat container on existing note...")
    page.wait_for_selector(".note-view .nlc-chat-container", timeout=5000)

    print("Adding dynamic note...")
    page.evaluate("""
        const container = document.getElementById('notes-container');
        const newNote = document.createElement('div');
        newNote.className = 'note-view';
        newNote.textContent = 'Dynamic Note Content';
        container.appendChild(newNote);
    """)

    print("Waiting for chat container on dynamic note...")
    page.wait_for_function("document.querySelectorAll('.nlc-chat-container').length >= 2")

    page.screenshot(path="/home/jules/verification/verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_frontend(page)
        except Exception as e:
            print(f"Test failed: {e}")
            exit(1)
        finally:
            browser.close()
