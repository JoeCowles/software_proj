const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const { promisify } = require('util');
const { log } = require('console');

const app = express();
const PORT = 5000;

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());

const usersFilePath = './users.txt'; // Path to the users file

// Helper function to get users from text file
async function getUsers() {
  try {
    const data = await fs.promises.readFile(usersFilePath, 'utf8');
    const users = data.split('\n').map(line => {
      const [username, password] = line.split(',');
      return { username, password };
    }).filter(user => user.username && user.password); // Filter out empty lines
    return users;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Return an empty array if the file does not exist
    } else {
      throw error;
    }
  }
}

// Function to add a user to the text file
async function addUser(username, password) {
  const userString = `${username},${password}\n`; // Format the user as a string to be appended
  await fs.promises.appendFile(usersFilePath, userString, 'utf8'); // Append the user to the file
}

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const t_username = username.trim().toLowerCase();
    const t_password = password.trim();
    const hashedPassword = await bcrypt.hash(t_password, 10);

    const users = await getUsers();
    if (users.some(user => user.username === t_username)) {
      return res.status(400).send('User already exists');
    }

    await addUser(t_username, hashedPassword);
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
    const t_username = username.trim().toLowerCase();
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

    const token = jwt.sign({ username: t_username }, 'secret_key', {
      expiresIn: '1h', // Optional expiration time
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
