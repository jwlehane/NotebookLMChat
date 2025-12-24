# NotebookLM Chat Extension: Setup Guide

This guide will walk you through setting up the NotebookLM Chat extension. The process involves two main parts:
1.  **Setting up a Firebase project** to act as the backend for the chat.
2.  **Configuring the extension** with your Firebase project details.

---

## Part 1: Set Up the Firebase Backend

Before you can use the extension, you need a free Firebase project to handle real-time messaging and authentication.

### 1. Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and give your project a name (e.g., "notebooklm-chat-backend").
3.  Continue through the setup steps. You can disable Google Analytics if you wish.

### 2. Get Your Firebase Web App Configuration
1.  In your new project's dashboard, click the **Web icon (`</>`)** to add a web app.
2.  Give the app a nickname (e.g., "NotebookLM Extension") and click **Register app**.
3.  After registering, Firebase will display a `firebaseConfig` object. **Keep this page open.** You will need to copy the values from this object in the next part of the setup.

### 3. Enable Firebase Services
You need to enable two services for the extension to work:

**A. Enable Anonymous Authentication:**
1.  In the Firebase console, go to the **Authentication** section (from the left-hand Build menu).
2.  Click **Get started**.
3.  In the **Sign-in method** tab, select **Anonymous** from the list of providers, **enable it**, and click **Save**.

**B. Enable Firestore Database:**
1.  Go to the **Firestore Database** section (from the left-hand Build menu).
2.  Click **Create database**.
3.  Choose to start in **Production mode** and click **Next**.
4.  Select a Firestore location (choose one close to you) and click **Enable**.
5.  After the database is created, go to the **Rules** tab.
6.  Replace the existing rules with the following to allow authenticated users to read and write to the database:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow read/write access to authenticated users
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```
7.  Click **Publish** to save your new rules.

---

## Part 2: Configure and Install the Extension

Now that your Firebase backend is ready, you can configure the extension to connect to it.

### 1. Run the Setup Script
The easiest way to configure the extension is by using the included setup script.

1.  **Open a terminal or command prompt** in the extension's root directory.
2.  **Make the script executable** by running this command:
    ```bash
    chmod +x setup.sh
    ```
3.  **Run the script:**
    ```bash
    ./setup.sh
    ```
4.  The script will prompt you to enter the `firebaseConfig` values you got from the Firebase console in Part 1. Copy and paste them one by one.

The script will automatically create a `config.js` file with your credentials.

### 2. Load the Extension in Chrome
1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** using the toggle switch in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the folder containing the extension files (the folder where `manifest.json` is located).
5.  The "NotebookLM Chat" extension should now appear in your list of extensions.

### 3. Test It!
-   Navigate to `https://notebooklm.google.com/`.
-   The first time the extension runs, you may be prompted to enter a display name.
-   Open a notebook and select a note. The "Threaded Discussion" UI should appear at the bottom of the note.

That's it! Your collaborative chat extension is now running.