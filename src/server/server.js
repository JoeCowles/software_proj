const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const { promisify } = require('util');
const { createObjectCsvWriter } = require('csv-writer');
const csv = require('csv-parser');
const { log } = require('console');

const app = express();
const PORT = 5000;


const cors = require('cors');
app.use(cors());


// Promisify the readFile function to use async/await
const readFileAsync = promisify(fs.readFile);

app.use(bodyParser.json());

// CSV writer setup
const csvWriter = createObjectCsvWriter({
  path: './users.csv',
  header: [
    { id: 'username', title: 'USERNAME' },
    { id: 'password', title: 'PASSWORD' }
  ],
  append: true, // Append new users to the CSV instead of rewriting the file
});

// Register route
app.post('/api/register', async (req, res) => {
  log("registering user");
  try {
    const { username, password } = req.body;
    const t_username = username.trim();
    const t_password = password.trim();
    const hashedPassword = await bcrypt.hash(t_password, 10);

    // Check if the user already exists
    const users = await getUsers();
    if (users.some(user => user.USERNAME === t_username)) {
      return res.status(400).send('User already exists');
    }

    // Write the new user to the CSV
    await csvWriter.writeRecords([{username, password: hashedPassword }]);
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const {username, password } = req.body;
    const t_username = username.trim();
    const t_password = password.trim();
    const users = await getUsers();
    const user = users.find(user => user.username === t_username);

    if (!user) {
      return res.status(401).send('Invalid username');
    }

    const validPassword = await bcrypt.compare(t_password, user.password);
    if (!validPassword) {
      return res.status(401).send('Invalid username or password');
    }

    const token = jwt.sign({ t_username }, 'secret_key'); // Use username instead of MongoDB's _id
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Helper function to get users from CSV
async function getUsers() {
  const results = [];
  const data = await readFileAsync('./users.csv');
  return new Promise((resolve, reject) => {
    fs.createReadStream('./users.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        log("FOUND RESULT");
        log(results);
        resolve(results.map(user => ({ username: user.USERNAME, password: user.PASSWORD })));
      })
      .on('error', reject);
  });
}

// Token verification middleware (remains the same)
function verifyToken(req, res, next) {
  // ... your existing verifyToken code ...
}

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
