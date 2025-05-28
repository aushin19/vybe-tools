const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found, using default environment variables');
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-supabase-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors({
  origin: '*', // For development - restrict in production
  methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
};

// Login route to get JWT token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // In a real application, validate against database
  // This is a simple example
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      success: true,
      message: 'Authentication successful',
      token
    });

    console.log('Authentication successful');
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

    console.log('Invalid credentials');
  }
});

// Supabase login route
app.post('/api/supabase/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    // Create our own JWT token that includes the Supabase token
    const token = jwt.sign({ 
      email: data.user.email,
      id: data.user.id,
      supabaseToken: data.session.access_token 
    }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      success: true,
      message: 'Supabase authentication successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });

    console.log('Supabase authentication successful');
  } catch (error) {
    console.error('Supabase login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }

  console.log('Supabase login error:', error);
});

// Get user profile from Supabase
app.get('/api/user/profile', authenticateJWT, async (req, res) => {
  try {
    // Check if the JWT token contains a Supabase token
    if (!req.user.supabaseToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated with Supabase'
      });
    }

    // Use the stored Supabase token to make authenticated calls
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${req.user.supabaseToken}`,
        },
      },
    });

    // Get the user profile data from Supabase
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')  // Replace with your actual Supabase table name
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      return res.status(400).json({
        success: false,
        message: profileError.message
      });

      console.log('Error fetching user profile:', profileError);
    }

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      profile
    });

    console.log('User profile retrieved successfully');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });

    console.log('Error fetching user profile:', error);
  }
});

// Route to receive cookies
app.post('/api/cookies', authenticateJWT, async (req, res) => {
  const { cookies, url } = req.body;

  if (!cookies || !Array.isArray(cookies)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid cookie data' 
    });
  }

  //console.log(`Received ${cookies.length} cookies from ${url || 'unknown source'}`);
  //console.log('Cookies:', JSON.stringify(cookies, null, 2));

  // Check if user is authenticated with Supabase
  let userData = null;
  let isSupabaseAuthenticated = false;
  
  if (req.user.supabaseToken) {
    try {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${req.user.supabaseToken}`,
          },
        },
      });

      // Get the user information
      const { data: user, error } = await supabaseClient.auth.getUser();
      if (!error && user) {
        isSupabaseAuthenticated = true;
        userData = user;
        console.log('User authenticated with Supabase:', user.id);
      }
    } catch (error) {
      console.error('Error verifying Supabase authentication:', error);
    }
  }

  // In a real application, you might store these cookies in the database
  // associated with the authenticated user
  if (isSupabaseAuthenticated && userData) {
    // Here you would save cookies to Supabase
    console.log('Could store cookies for user:', userData.id);
  }
  
  res.json({
    success: true,
    message: `Received ${cookies.length} cookies successfully`,
    isSupabaseAuthenticated,
    userData: isSupabaseAuthenticated ? {
      id: userData.id,
      email: userData.email
    } : null
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 