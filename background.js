// This is the background service worker for the extension.

// It listens for when a tab is updated.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab has finished loading and the URL is for NotebookLM.
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('notebooklm.google.com')) {
    
    // Inject the CSS file first.
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ["styles.css"]
    });

    // Then, inject the main content script.
    // Programmatically injecting the script like this allows it to be treated as a module.
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    })
    .then(() => {
      console.log("NotebookLM Chat: Content script injected successfully.");
    })
    .catch(err => {
      console.error("NotebookLM Chat: Failed to inject content script:", err);
    });
  }
});
