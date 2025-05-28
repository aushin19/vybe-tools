// Background script to extract cookies from localhost:3000

// Configuration
const HOST = 'http://localhost:3000';
const SERVER_URL = 'http://localhost:3001/api/'; // Change this to match your Express server URL
let jwtToken = ''; // Will store the JWT token

// Function to get all cookies from localhost
function getCookiesFromLocalhost() {
  // First try with the specific URL
  chrome.cookies.getAll({ domain: "localhost" }, function(cookies) {
    console.log("All cookies from localhost domain:", cookies);
    
    const localhostCookies = cookies.filter(cookie => 
      cookie.domain === "localhost" || 
      cookie.domain === "127.0.0.1" || 
      cookie.domain.includes("localhost")
    );
    
    console.log("Filtered cookies from localhost:", localhostCookies);
    
    // Store the cookies in local storage for later access
    chrome.storage.local.set({ 'localhostCookies': localhostCookies }, function() {
      console.log("Cookies saved to storage");
      
      // Send cookies to server
      sendCookiesToServer(localhostCookies);
    });
  });
}

// Function to authenticate with the server using Supabase credentials
function authenticateWithSupabase(callback) {
  // First check if we already have a valid token in storage
  chrome.storage.local.get(['jwtToken', 'tokenExpiry'], function(data) {
    const now = Date.now();
    
    if (data.jwtToken && data.tokenExpiry && now < data.tokenExpiry) {
      jwtToken = data.jwtToken;
      console.log("Using stored JWT token");
      if (callback) callback(true);
      return;
    }
    
    // Get Supabase credentials from storage
    chrome.storage.local.get(['supabaseEmail', 'supabasePassword'], function(creds) {
      if (!creds.supabaseEmail || !creds.supabasePassword) {
        console.log("No Supabase credentials found, falling back to default authentication");
        authenticateWithServer(callback);
        return;
      }
      
      // No token in storage or token expired, get a new one using Supabase
      fetch(SERVER_URL + 'supabase/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: creds.supabaseEmail,
          password: creds.supabasePassword
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.token) {
          jwtToken = data.token;
          
          // Save the token for future use with expiry (1 hour minus 5 minutes for safety)
          const expiry = Date.now() + (55 * 60 * 1000);
          chrome.storage.local.set({ 
            'jwtToken': jwtToken,
            'tokenExpiry': expiry,
            'userData': data.user
          }, function() {
            console.log("JWT token from Supabase saved to storage");
          });
          
          console.log("Supabase authentication successful");
          if (callback) callback(true);
        } else {
          console.error("Supabase authentication failed:", data.message);
          
          // Fall back to regular authentication
          console.log("Falling back to default authentication");
          authenticateWithServer(callback);
        }
      })
      .catch(error => {
        console.error("Error during Supabase authentication:", error);
        
        // Fall back to regular authentication
        console.log("Falling back to default authentication");
        authenticateWithServer(callback);
      });
    });
  });
}

// Function to authenticate with the server (fallback)
function authenticateWithServer(callback) {
  // First check if we already have a valid token in storage
  chrome.storage.local.get(['jwtToken', 'tokenExpiry'], function(data) {
    const now = Date.now();
    
    if (data.jwtToken && data.tokenExpiry && now < data.tokenExpiry) {
      jwtToken = data.jwtToken;
      console.log("Using stored JWT token");
      if (callback) callback(true);
      return;
    }
    
    // No token in storage, get a new one
    fetch(SERVER_URL + 'login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin', // This should be configurable in a real app
        password: 'password' // This should be configurable in a real app
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.token) {
        jwtToken = data.token;
        
        // Save the token for future use with expiry (1 hour minus 5 minutes for safety)
        const expiry = Date.now() + (55 * 60 * 1000);
        chrome.storage.local.set({ 
          'jwtToken': jwtToken,
          'tokenExpiry': expiry
        }, function() {
          console.log("JWT token saved to storage");
        });
        
        console.log("Authentication successful");
        if (callback) callback(true);
      } else {
        console.error("Authentication failed:", data.message);
        if (callback) callback(false);
      }
    })
    .catch(error => {
      console.error("Error during authentication:", error);
      if (callback) callback(false);
    });
  });
}

// Function to send cookies to the server
function sendCookiesToServer(cookies) {
  // First try to authenticate with Supabase
  authenticateWithSupabase(function(success) {
    if (!success) {
      console.error("Cannot send cookies: Authentication failed");
      // Update server send status
      updateServerSendStatus(false, "Authentication failed");
      return;
    }
    
    // Now send the cookies with the token
    fetch(SERVER_URL + 'cookies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        cookies: cookies,
        url: HOST
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Cookies sent to server successfully:", data.message);
        
        // Store user data if available
        if (data.isSupabaseAuthenticated && data.userData) {
          chrome.storage.local.set({ 'supabaseUserData': data.userData }, function() {
            console.log("Supabase user data saved");
          });
        }
        
        // Update server send status
        updateServerSendStatus(true, data.message, data.isSupabaseAuthenticated, data.userData);
      } else {
        console.error("Failed to send cookies to server:", data.message);
        // Update server send status
        updateServerSendStatus(false, data.message);
      }
    })
    .catch(error => {
      console.error("Error sending cookies to server:", error);
      // Update server send status
      updateServerSendStatus(false, "Server connection error");
    });
  });
}

// Function to update server send status in storage
function updateServerSendStatus(success, message, isSupabaseAuthenticated = false, userData = null) {
  const status = {
    success: success,
    message: message,
    timestamp: Date.now(),
    isSupabaseAuthenticated: isSupabaseAuthenticated,
    userData: userData
  };
  
  chrome.storage.local.set({ 'serverSendStatus': status }, function() {
    console.log("Server send status updated:", status);
  });
}

// Function to save Supabase credentials
function saveSupabaseCredentials(email, password, callback) {
  chrome.storage.local.set({
    'supabaseEmail': email,
    'supabasePassword': password
  }, function() {
    console.log("Supabase credentials saved");
    
    // Clear existing token so we're forced to re-authenticate
    chrome.storage.local.remove(['jwtToken', 'tokenExpiry'], function() {
      // Try to authenticate with new credentials
      authenticateWithSupabase(callback);
    });
  });
}

// Function to get user profile from the server
function getUserProfile(callback) {
  // Make sure we have a token first
  authenticateWithSupabase(function(success) {
    if (!success) {
      console.error("Cannot get user profile: Authentication failed");
      if (callback) callback(false, { error: "Authentication failed" });
      return;
    }
    
    // Get user profile
    fetch(SERVER_URL + 'user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.profile) {
        console.log("User profile retrieved successfully:", data.profile);
        
        // Store profile data
        chrome.storage.local.set({ 'userProfile': data.profile }, function() {
          console.log("User profile saved");
        });
        
        if (callback) callback(true, data.profile);
      } else {
        console.error("Failed to retrieve user profile:", data.message);
        if (callback) callback(false, { error: data.message });
      }
    })
    .catch(error => {
      console.error("Error retrieving user profile:", error);
      if (callback) callback(false, { error: "Server connection error" });
    });
  });
}

// Variable to store document cookies obtained via JavaScript
let documentCookies = [];

// Extract cookies when extension is installed
chrome.runtime.onInstalled.addListener((reason) => {
  getCookiesFromLocalhost();
});

// Handle message from popup.js or content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractCookies') {
    getCookiesFromLocalhost();
    sendResponse({status: 'Cookies extraction initiated'});
  }
  else if (message.action === 'documentCookies') {
    // Store document cookies received from content script
    documentCookies = message.cookies;
    console.log("Document cookies received from content script:", documentCookies);
    
    // Merge with cookies from chrome.cookies API and store
    chrome.storage.local.get('localhostCookies', function(data) {
      const chromeCookies = data.localhostCookies || [];
      
      // Create a map of existing cookies by name
      const cookieMap = {};
      chromeCookies.forEach(cookie => {
        cookieMap[cookie.name] = cookie;
      });
      
      // Add document cookies if they don't exist in chrome cookies
      documentCookies.forEach(cookie => {
        if (!cookieMap[cookie.name]) {
          chromeCookies.push(cookie);
        }
      });
      
      // Save the merged cookies
      chrome.storage.local.set({ 'localhostCookies': chromeCookies }, function() {
        console.log("Merged cookies saved to storage");
        
        // Send merged cookies to server
        sendCookiesToServer(chromeCookies);
      });
    });
  }
  else if (message.action === 'sendToServer') {
    // Manual request to send cookies to server from popup
    if (message.cookies && Array.isArray(message.cookies)) {
      sendCookiesToServer(message.cookies);
      sendResponse({status: 'Sending cookies to server initiated'});
    } else {
      sendResponse({status: 'Error: No cookies to send'});
    }
  }
  else if (message.action === 'saveSupabaseCredentials') {
    // Save Supabase credentials
    saveSupabaseCredentials(message.email, message.password, function(success) {
      sendResponse({status: success ? 'Credentials saved and authenticated' : 'Authentication failed'});
    });
    return true; // Keep the message channel open for async response
  }
  else if (message.action === 'getUserProfile') {
    // Get user profile
    getUserProfile(function(success, data) {
      sendResponse({
        success: success,
        data: data
      });
    });
    return true; // Keep the message channel open for async response
  }
  return true;
});

// Also extract cookies when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  getCookiesFromLocalhost();
  
  // If on localhost, also try to get document cookies
  if (tab.url && tab.url.includes('localhost')) {
    chrome.tabs.sendMessage(tab.id, { action: 'getDocumentCookies' }, function(response) {
      if (response && response.cookies) {
        console.log("Document cookies received from tab:", response.cookies);
      }
    });
  }
}); 