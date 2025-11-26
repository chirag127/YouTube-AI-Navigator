// Background service worker
console.log('YouTube AI Master: Background service worker started.')

// Handle extension action click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on a YouTube page
  if (tab.url?.includes('youtube.com/watch')) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id })
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  }
})

// Set side panel options
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
  console.error('Failed to set panel behavior:', error)
})
