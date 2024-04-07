// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/groceryTrackerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware
app.use(bodyParser.json());

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Item schema and model
const itemSchema = new mongoose.Schema({
  itemName: String,
  price: Number,
  date: Date
});
const Item = mongoose.model('Item', itemSchema);

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Invalid username or password');
    }
    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(403).send('Invalid token');
    req.userId = decoded.userId;
    next();
  });
}

// Add item route
app.post('/api/addItem', authenticateToken, async (req, res) => {
  try {
    const { itemName, price, date } = req.body;
    const newItem = new Item({ itemName, price, date });
    await newItem.save();
    res.status(201).send('Item added successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding item');
  }
});

// Generate report route
app.get('/api/monthlyReport/:month', authenticateToken, async (req, res) => {
  try {
    const month = req.params.month;
    const startDate = new Date(month);
    startDate.setUTCDate(1);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(startDate.getUTCMonth() + 1);

    const report = await Item.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: '$itemName',
          totalPrice: { $sum: '$price' }
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating monthly report');
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
