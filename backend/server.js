const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());

// Conditional JSON middleware
app.use((request, response, next) => {
  // Skip JSON middleware for the webhook endpoint
  if (request.originalUrl.startsWith('/api/payments/webhook')) {
    return next(); // Bypass JSON parsing for this route
  }
  // Apply JSON parsing to all other routes
  express.json()(request, response, next);
});

const USERS_FILE = './users.json';
const JWT_SECRET = 'supersecretkey'; // In production, use env variable

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { name, email, password: hashedPassword };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ message: 'User registered successfully.' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = jwt.sign({ name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { name: user.name, email: user.email } });
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }
  const users = readUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) {
    return res.status(404).json({ message: 'Email not found.' });
  }
  users[idx].password = await bcrypt.hash(newPassword, 10);
  writeUsers(users);
  res.json({ message: 'Password reset successful.' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 