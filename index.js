// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = 'my_secret_key';

// Dummy user data
const users = [
  { id: 1, username: 'john', password: 'password123' },
  { id: 2, username: 'jane', password: 'mypassword' }
];

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the User Authentication API! Use /login to get a token.');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Token validation route
app.post('/validate-token', (req, res) => {
  const { token } = req.body;

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    res.json({ message: 'Token is valid', user });
  });
});

// Not found route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
