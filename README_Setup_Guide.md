# NotebookLM Chat Extension: Setup Guide

This guide will walk you through setting up the NotebookLM Chat extension, including configuring Firebase for real-time messaging and loading the extension into Chrome.

## Step 1: Create a Firebase Project

1.  Go to the Firebase Console.
2.  Click **Add project** and give your project a name (e.g., "notebooklm-chat-backend").
3.  Continue through the setup steps. You can disable Google Analytics for this simple project if you wish.
4.  Once your project is created, you'll be taken to the project dashboard.

## Step 2: Get Your Firebase Configuration

1.  On your project dashboard, click the **Web icon (`</>`)** to add a web app to your project.
2.  Give the app a nickname (e.g., "NotebookLM Extension") and click **Register app**.
3.  Firebase will show you your `firebaseConfig` object. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      // ... and so on
    };
    ```
4.  Copy this entire object. You will need it for `content.js`.

## Step 3: Set Up Firebase Services

### Authentication
1.  In the Firebase console, go to the **Authentication** section (from the left-hand Build menu).
2.  Click the **Get started** button.
3.  Go to the **Sign-in method** tab.
4.  Click on **Anonymous** from the list of providers, enable it, and click **Save**.

### Firestore Database
1.  Go to the **Firestore Database** section (from the left-hand Build menu).
2.  Click **Create database**.
3.  Choose to start in **Production mode** and click **Next**.
4.  Select a Firestore location (choose one close to you). Click **Enable**.
5.  After it's created, go to the **Rules** tab and replace the existing rules with the following to allow authenticated users to read/write:
    ```
    rules_version = '2';
    service cloud.firestore {
    }
  }
}
Publish your new rules.Step 4: Prepare the Extension FilesCreate a new folder on your computer (e.g., my-notebooklm-extension).Inside this folder, create three files: manifest.json, content.js, and styles.css.Copy the code I provided into the corresponding files.Crucially, in content.js, replace the placeholder firebaseConfig with the one you copied from your Firebase project.Download the Firebase JS SDK files: You need to provide the Firebase JS files for the import statements to work.Go to this page: https://firebase.google.com/docs/web/setup#access-sdk-from-zipDownload the zip file.From the zip, find and copy firebase-app.js, firebase-auth.js, and firebase-firestore.js into your extension folder.Step 5: Load the Extension in ChromeOpen Google Chrome and navigate to chrome://extensions.Enable "Developer mode" using the toggle switch in the top-right corner.Click the "Load unpacked" button.Select the folder you created in Step 4 (my-notebooklm-extension).The "NotebookLM Chat" extension should now appear in your list of extensions.Step 6: Test It!Navigate to https://notebooklm.google.com/.The first time it loads, you may be prompted to enter a display name.Open a notebook and click on or create a note in the right-hand panel.You should see the "Threaded Discussion" UI appear at the bottom of the note card. Try sending some messages! To test the collaborative aspect, you could load the unpacked extension on another Chrome profile or computer, connect it to the same Firebase project, and chat with yourself.Good luck, Johnny! This should give you a powerful and functional prototype. From here, you could refine the UI, add more robust user management (like Google Sign-In), or improve how the extension identifies notes on the page. Let me know how it goes!