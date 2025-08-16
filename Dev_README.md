# Developer README: NotebookLM Chat Extension

## 1. Project Overview & Intent

This Chrome extension was created to address a core limitation in Google's NotebookLM: the lack of real-time collaboration. While NotebookLM is a powerful tool for individual research and analysis, its utility for teams is hampered by the inability to discuss and annotate notes in a shared context.

The primary goal of this project is to inject a simple, real-time, threaded discussion feature directly onto each note within the NotebookLM interface. This follows the "build for yourself" philosophy: create a tool to solve an immediate productivity problem for our own team, with the potential for wider release if it proves valuable.

The core user stories are:
*   As a user, I want to see a discussion thread attached to a specific note.
*   As a user, I want to add a message to that thread with my name attributed to it.
*   As a user, I want to see messages from my teammates appear in real-time.
*   As a user, I want to be able to copy the entire discussion thread (including the original note) to my clipboard to easily create a new, citable source in NotebookLM.

## 2. Core Architecture

The extension uses a modern Manifest V3 architecture, which relies on a background service worker for injecting scripts.

*   `manifest.json`: The extension's configuration file.
    *   It defines the necessary permissions: `storage` (for user preferences like display name), `tabs` and `scripting` (to interact with the NotebookLM page), and `host_permissions` to target `notebooklm.google.com`.
    *   It registers the `background.js` service worker.
    *   It defines the `content_security_policy` to allow loading scripts from the Firebase CDN.

*   `background.js`: The background service worker.
    *   This is the persistent part of the extension. It listens for tab updates using `chrome.tabs.onUpdated`.
    *   When a tab finishes loading and its URL matches NotebookLM, it programmatically injects `styles.css` and then `content.js`.
    *   **Design Rationale**: This approach is crucial. Programmatically injecting the script via `chrome.scripting.executeScript` allows `content.js` to be treated as an ES6 Module, which is required for the `import` statements to work. The older `content_scripts` declaration in the manifest does not support this for all use cases.

*   `content.js`: The main application logic.
    *   This script is injected directly into the DOM of the NotebookLM page.
    *   **Initialization**: It connects to the Firebase backend (Auth, Firestore, Analytics).
    *   **Authentication**: It handles the anonymous user sign-in flow and prompts for a display name.
    *   **DOM Observation**: It uses a `MutationObserver` to watch for changes in the page's structure. When it detects elements with the `.note-view` class, it triggers the UI injection.
    *   **UI Injection**: It dynamically creates the HTML elements for the chat interface (title, message list, input box, buttons) and appends them to the note element.
    *   **Firestore Communication**: It handles sending new messages to Firestore and setting up a real-time `onSnapshot` listener to receive and render new messages from other users.

*   `styles.css`: Defines the visual appearance of the injected UI components to make them feel integrated into the NotebookLM page.

## 3. Backend (Firebase)

Firebase was chosen for its rapid development capabilities, real-time features, and seamless integration with the Google Cloud ecosystem.

*   **Firestore**: A NoSQL, real-time database used to store the chat threads.
    *   **Data Model**: The structure is simple and scalable: `notebooklm-threads/{noteId}/messages/{messageId}`. Each note gets its own collection of messages, ensuring queries are fast and targeted.
*   **Authentication**:
    *   Currently uses **Anonymous Authentication**. This is a low-friction way for users to get started without needing an account, perfect for a V1 prototype. Each user gets a unique, persistent `userId`.
*   **Analytics**:
    *   Google Analytics for Firebase is integrated to provide insights into how the extension is being used (e.g., tracking `login`, `post_message`, `copy_thread` events).

## 4. Key Design Decisions & Trade-offs

*   **Note Identification**:
    *   **Method**: We identify unique notes by creating a simple hash of the note's full text content (`simpleHash(noteContent)`).
    *   **Trade-off**: This method is simple but **brittle**. If a user edits even a single character in a note, the hash will change, effectively orphaning the original discussion thread and creating a new, empty one. For a prototype, this is an acceptable risk. A more robust solution would require a stable, unique ID provided by the NotebookLM DOM itself, which does not currently appear to be available.

*   **DOM Element Selection**:
    *   **Method**: The script relies on the CSS selector `.note-view` to find notes on the page.
    *   **Trade-off**: This is the most fragile part of the extension. If the NotebookLM developers change their front-end class names in an update, our injection logic will break. This is a common challenge for extensions that modify third-party sites.

## 5. Potential Next Steps & Improvements

This prototype serves as a strong foundation. Here is a roadmap for evolving it into a production-ready tool:

1.  **Robust User Authentication**:
    *   Replace Anonymous Auth with **Google Sign-In**. This is the highest priority next step. It will provide real user names and profile pictures automatically, eliminating the need for the `prompt()` dialog and creating a much richer user experience.
2.  **UI/UX Enhancements**:
    *   Implement `@-mentions` to notify specific users.
    *   Add the ability to edit or delete one's own messages.
    *   Show a "typing..." indicator.
    *   Refine the CSS to better match NotebookLM's design language, potentially using theme variables if available.
3.  **Improve Note Stability**:
    *   Investigate the NotebookLM DOM more deeply to find a more stable unique identifier for notes than a content hash (e.g., a `data-id` attribute that might be used internally).
    *   If no stable ID exists, build a "thread migration" feature. If a note's hash changes, we could prompt the user: "The content of this note has changed. Would you like to attach the previous discussion to this new version?"
4.  **Error Handling & Packaging**:
    *   Implement a more user-friendly error display system instead of relying solely on `console.error`.
    *   Develop a build process (e.g., using webpack) to bundle the files for official distribution on the Chrome Web Store.