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

// Add route to handle POST requests for creating orders
app.post('/api/createOrder', async (req, res) => {
  try {
    const { username, itemName, price, date } = req.body;
    
    log(username);

    // Validate if required fields are provided
    if (!username || !itemName || !price || !date) {
      return res.status(400).send('Incomplete order data');
    }

    // Create a filename based on the username
    const filename = `${username}.txt`;
    const orderData = `${itemName}, ${price}, ${date}\n`;

    // Check if file exists
    const fileExists = fs.existsSync(filename);

    if (!fileExists) {
      // If file doesn't exist, create a new file and write the order data
      await fs.promises.writeFile(filename, orderData, 'utf8');
    } else {
      // If file exists, append the order data to the existing file
      await fs.promises.appendFile(filename, orderData, 'utf8');
    }

    res.status(201).send('Order created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating order');
  }
});

// Add route to handle GET requests for retrieving items by month, year, and username
app.get('/api/getItemsByUsername/:year/:month/:username', async (req, res) => {
  try {
    const { year, month, username } = req.params;

    // Parse month and year to integers
    const targetMonth = parseInt(month);
    const targetYear = parseInt(year);
    
    // Parse username if needed
    const parsedUsername = decodeURIComponent(username);

    log(parsedUsername, targetMonth, targetYear);
    // Validate month and year
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).send('Invalid month or year');
    }

    // Validate username
    if (!parsedUsername) {
      return res.status(400).send('Invalid username');
    }

    // Create filename based on the username
    const filename = `${parsedUsername}.txt`;

    // Read orders from file
    const orders = await readOrdersByUsername(filename);

    // Filter orders for the specified month and year
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getFullYear() === targetYear && orderDate.getMonth() === (targetMonth - 1); // JavaScript months are 0-based
    });

    // Calculate the sum of prices for each item
    const itemSumMap = new Map();
    filteredOrders.forEach(order => {
      const { itemName, price } = order;
      if (itemSumMap.has(itemName)) {
        itemSumMap.set(itemName, itemSumMap.get(itemName) + price);
      } else {
        itemSumMap.set(itemName, price);
      }
    });

    // Convert itemSumMap to an array of objects for response
    const result = Array.from(itemSumMap.entries()).map(([itemName, totalPrice]) => ({
      itemName,
      totalPrice
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving items by month, year, and username');
  }
});


async function readOrdersByUsername(filename) {
  try {
    const data = await fs.promises.readFile(filename, 'utf8');
    const orders = JSON.parse(data);
    return orders;
  } catch (error) {
    console.error(error);
    return []; // Return an empty array if there's an error reading or parsing the file
  }
};




// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
