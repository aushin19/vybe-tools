// Get references to DOM elements
const extractBtn = document.getElementById('extract-btn');
const cookieContainer = document.getElementById('cookie-container');
const SERVER_URL = 'http://localhost:3001/api/';

// Function to display cookies in the popup
function displayCookies() {
  // Get cookies from storage that were saved by the background script
  chrome.storage.local.get(['localhostCookies', 'serverSendStatus', 'supabaseUserData', 'userProfile'], function(data) {
    const cookies = data.localhostCookies || [];
    const serverStatus = data.serverSendStatus;
    const supabaseUserData = data.supabaseUserData;
    const userProfile = data.userProfile;
    
    if (cookies.length === 0) {
      cookieContainer.innerHTML = '<p>No cookies found for localhost:3000</p>';
      return;
    }
    
    // Create HTML to display the cookies
    let html = '<h3>Cookies:</h3>';
    
    // Show Supabase user data if available
    if (supabaseUserData) {
      html += `<div class="supabase-user">
        <h4>Supabase User:</h4>
        <p><strong>ID:</strong> ${supabaseUserData.id}</p>
        <p><strong>Email:</strong> ${supabaseUserData.email}</p>
        <button id="get-profile-btn">Get Full Profile</button>
      </div>`;
    }
    
    // Show user profile if available
    if (userProfile) {
      html += `<div class="user-profile">
        <h4>User Profile:</h4>
        <pre>${JSON.stringify(userProfile, null, 2)}</pre>
      </div>`;
    }
    
    // Show server status if available
    if (serverStatus) {
      const statusClass = serverStatus.success ? 'success' : 'error';
      html += `<div class="server-status ${statusClass}">
        <strong>Server Status:</strong> ${serverStatus.message}
        <br>
        <small>Last update: ${new Date(serverStatus.timestamp).toLocaleString()}</small>
      </div>`;
    }
    
    html += '<ul>';
    
    cookies.forEach(cookie => {
      html += `<li>
        <strong>${cookie.name}</strong>: ${cookie.value}
        <br>
        <small>Domain: ${cookie.domain}, Path: ${cookie.path}, 
        Secure: ${cookie.secure ? 'Yes' : 'No'}, 
        HttpOnly: ${cookie.httpOnly ? 'Yes' : 'No'}</small>
      </li>`;
    });
    
    html += '</ul>';
    
    // Add buttons
    html += `<div class="button-container">
      <button id="send-to-server-btn">Send to Server</button>
      <button id="login-supabase-btn">Supabase Login</button>
    </div>`;
    
    cookieContainer.innerHTML = html;
    
    // Add event listener to send to server button
    document.getElementById('send-to-server-btn').addEventListener('click', function() {
      sendCookiesToServer(cookies);
    });
    
    // Add event listener to login button
    document.getElementById('login-supabase-btn').addEventListener('click', function() {
      showLoginForm();
    });
    
    // Add event listener to get profile button if it exists
    const profileBtn = document.getElementById('get-profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', function() {
        getUserProfile();
      });
    }
    
    // Also log to console
    console.log('Cookies displayed in popup:', cookies);
  });
}

// Function to show login form
function showLoginForm() {
  const loginHtml = `
    <h3>Supabase Login</h3>
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" placeholder="Enter your email">
    </div>
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" placeholder="Enter your password">
    </div>
    <div class="button-container">
      <button id="submit-login-btn">Login</button>
      <button id="cancel-login-btn">Cancel</button>
    </div>
  `;
  
  cookieContainer.innerHTML = loginHtml;
  
  // Add event listeners
  document.getElementById('submit-login-btn').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    loginWithSupabase(email, password);
  });
  
  document.getElementById('cancel-login-btn').addEventListener('click', function() {
    displayCookies();
  });
}

// Function to login with Supabase
function loginWithSupabase(email, password) {
  // Show loading state
  cookieContainer.innerHTML = '<p>Logging in, please wait...</p>';
  
  // Send credentials to background script
  chrome.runtime.sendMessage({
    action: 'saveSupabaseCredentials',
    email: email,
    password: password
  }, function(response) {
    if (response && response.status) {
      // Refresh the display
      displayCookies();
    }
  });
}

// Function to get user profile
function getUserProfile() {
  // Show loading state
  const profileBtn = document.getElementById('get-profile-btn');
  if (profileBtn) {
    profileBtn.disabled = true;
    profileBtn.textContent = 'Loading...';
  }
  
  // Send request to background script
  chrome.runtime.sendMessage({
    action: 'getUserProfile'
  }, function(response) {
    if (profileBtn) {
      profileBtn.disabled = false;
      profileBtn.textContent = 'Get Full Profile';
    }
    
    if (response && response.success) {
      // Refresh the display
      displayCookies();
    } else {
      alert('Failed to retrieve user profile: ' + (response?.data?.error || 'Unknown error'));
    }
  });
}

// Function to send cookies to server (for the manual button)
function sendCookiesToServer(cookies) {
  chrome.runtime.sendMessage({
    action: 'sendToServer',
    cookies: cookies
  }, function(response) {
    if (response && response.status) {
      // Refresh the display to show the updated status
      displayCookies();
    }
  });
}

// Extract cookies when button is clicked
extractBtn.addEventListener('click', function() {
  // Call the background script's function
  chrome.runtime.sendMessage({action: 'extractCookies'}, function(response) {
    // After cookies are extracted, display them
    displayCookies();
  });
});

// Update the view when popup opens
document.addEventListener('DOMContentLoaded', displayCookies); 