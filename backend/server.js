const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());

// Conditional JSON middleware
app.use((request, response, next) => {
  if (request.originalUrl.startsWith('/api/payments/webhook')) {
    return next();
  }
  express.json()(request, response, next);
});

const JWT_SECRET = 'supersecretkey'; // In production, use env variable

mongoose.connect('mongodb://localhost:27017/yourdbname');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// FoodLog model
const foodLogSchema = new mongoose.Schema({
  userEmail: String,
  date: { type: Date, default: Date.now },
  meal: String,
  calories: Number,
  description: String,
});
const FoodLog = mongoose.model('FoodLog', foodLogSchema);

// WorkoutLog model
const workoutLogSchema = new mongoose.Schema({
  userEmail: String,
  date: { type: Date, default: Date.now },
  type: String,
  duration: Number, // in minutes
  caloriesBurned: Number,
  notes: String,
});
const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Protected user profile endpoint
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- FoodLog Endpoints ---
// Create food log
app.post('/api/food', authenticateToken, async (req, res) => {
  try {
    const { meal, calories, description, date } = req.body;
    const log = new FoodLog({
      userEmail: req.user.email,
      meal,
      calories,
      description,
      date: date ? new Date(date) : undefined,
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all food logs for user
app.get('/api/food', authenticateToken, async (req, res) => {
  try {
    const logs = await FoodLog.find({ userEmail: req.user.email }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Update food log
app.put('/api/food/:id', authenticateToken, async (req, res) => {
  try {
    const log = await FoodLog.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.user.email },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Delete food log
app.delete('/api/food/:id', authenticateToken, async (req, res) => {
  try {
    const result = await FoodLog.deleteOne({ _id: req.params.id, userEmail: req.user.email });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- WorkoutLog Endpoints ---
// Create workout log
app.post('/api/workout', authenticateToken, async (req, res) => {
  try {
    const { type, duration, caloriesBurned, notes, date } = req.body;
    const log = new WorkoutLog({
      userEmail: req.user.email,
      type,
      duration,
      caloriesBurned,
      notes,
      date: date ? new Date(date) : undefined,
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all workout logs for user
app.get('/api/workout', authenticateToken, async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ userEmail: req.user.email }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Update workout log
app.put('/api/workout/:id', authenticateToken, async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.user.email },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Delete workout log
app.delete('/api/workout/:id', authenticateToken, async (req, res) => {
  try {
    const result = await WorkoutLog.deleteOne({ _id: req.params.id, userEmail: req.user.email });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 4000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
module.exports = app; 