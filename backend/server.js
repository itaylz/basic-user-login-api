const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const http = require('http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db'); // Import the database connection
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Load JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;


// --- SECURE LOGIN ENDPOINT ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Parameterized query to find the user (Prevents SQL Injection!)
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    // If no user is found, the rows array will be empty
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = userResult.rows[0];

    // 2. Compare the hashes
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      // 3. Generate Token
      const token = jwt.sign(
        { userId: user.id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.json({ success: true, message: 'Login successful!', token: token });
    } else {
      res.status(401).json({ message: 'Invalid username or password.' });
    }

  } catch (error) {
    console.error("Login database error:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/', (req, res) => {
    res.send('Connection Successful!');
});

// --- REGISTRATION ENDPOINT ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // 1. Check if user already exists in the SQL database
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default secret data for a new user
    const defaultSecret = 'Welcome! Your account is active.';

    // 3. Insert the new user into the database
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error("Registration database error:", error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// --- PROTECTED DATA ENDPOINT ---
app.get('/api/secure-data', async (req, res) => { // <-- Note we added 'async' here!
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 2. Fetch the user's secret data from the SQL database using their decoded ID
    const userResult = await pool.query(
      'SELECT secret_data FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    // 3. Send the data back
    res.json({ data: userResult.rows[0].secret_data });
    
  } catch (err) {
    console.error("Secure data fetch error:", err);
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
});

// --- SERVER & SOCKET.IO SETUP ---
// We pass the Express 'app' to the HTTP server, and then pass THAT to Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL, 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

// CRITICAL: Call .listen on the 'server' object, NOT the 'app' object!
server.listen(port, () => {
    console.log(`Server & Socket.io running on port:${port}`);
});