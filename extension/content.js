console.log('Cookie Extractor extension content script running on:', window.location.href);

// Function to get cookies via JavaScript
function getDocumentCookies() {
  const cookies = document.cookie.split(';').map(cookie => {
    const parts = cookie.trim().split('=');
    return {
      name: parts[0],
      value: parts.slice(1).join('=')
    };
  });
  
  console.log('Document cookies found via JavaScript:', cookies);
  
  // Send cookies to background script
  chrome.runtime.sendMessage({
    action: 'documentCookies',
    cookies: cookies
  });
  
  return cookies;
}

// Run immediately
const docCookies = getDocumentCookies();

// Also listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDocumentCookies') {
    const cookies = getDocumentCookies();
    sendResponse({ cookies: cookies });
  }
  return true;
}); 