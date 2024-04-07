// tests/server.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../server/server');

// Mock User model
jest.mock('../server/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

// Mock Item model
jest.mock('../server/models/Item', () => ({
  create: jest.fn(),
  aggregate: jest.fn()
}));

describe('User Registration', () => {
  it('should register a new user', async () => {
    const newUser = { username: 'testuser', password: 'testpassword' };
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    const user = { _id: 'testuserid', username: newUser.username, password: hashedPassword };
    require('../server/models/User').create.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/register')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.text).toBe('User registered successfully');
  });
});

describe('User Login', () => {
  it('should log in a registered user', async () => {
    const user = { username: 'testuser', password: 'testpassword' };
    const hashedPassword = await bcrypt.hash(user.password, 10);
    require('../server/models/User').findOne.mockResolvedValue({ _id: 'testuserid', username: user.username, password: hashedPassword });

    const response = await request(app)
      .post('/api/login')
      .send(user);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

describe('Adding Items', () => {
  it('should add a new item', async () => {
    const newItem = { itemName: 'milk', price: 20, date: '2024-01-01' };
    require('../server/models/Item').create.mockResolvedValue(newItem);

    const response = await request(app)
      .post('/api/addItem')
      .set('Authorization', 'Bearer testtoken')
      .send(newItem);

    expect(response.status).toBe(201);
    expect(response.text).toBe('Item added successfully');
  });
});

describe('Generating Reports', () => {
  it('should generate a monthly report', async () => {
    const report = [{ _id: 'milk', totalPrice: 50 }];
    require('../server/models/Item').aggregate.mockResolvedValue(report);

    const response = await request(app)
      .get('/api/monthlyReport/2024-01')
      .set('Authorization', 'Bearer testtoken');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(report);
  });
});
