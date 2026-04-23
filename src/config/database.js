import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/db.json');

// Initialize LowDB with JSON adapter
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, {
  users: [],
  orders: [],
  reviews: [],
  paymentRequests: []
});

// Initialize database with default structure
export async function initDatabase() {
  await db.read();
  db.data ||= { users: [], orders: [], reviews: [], paymentRequests: [] };
  await db.write();
}

// User operations
export async function addUser(user) {
  await db.read();
  const existingIndex = db.data.users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    db.data.users[existingIndex] = { 
      ...db.data.users[existingIndex], 
      ...user,
      balance: db.data.users[existingIndex].balance || 0
    };
  } else {
    db.data.users.push({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      balance: 0,
      joinedAt: new Date().toISOString()
    });
  }
  
  await db.write();
}

export async function getUser(userId) {
  await db.read();
  return db.data.users.find(u => u.id === userId);
}

export async function getAllUsers() {
  await db.read();
  return db.data.users;
}

export async function getUsersCount() {
  await db.read();
  return db.data.users.length;
}

// Order operations
export async function addOrder(order) {
  await db.read();
  db.data.orders.push({
    id: Date.now(),
    ...order,
    createdAt: new Date().toISOString(),
    status: 'pending'
  });
  await db.write();
}

export async function getOrders() {
  await db.read();
  return db.data.orders;
}

// Review operations
export async function addReview(review) {
  await db.read();
  db.data.reviews.push({
    id: Date.now(),
    ...review,
    createdAt: new Date().toISOString()
  });
  await db.write();
}

export async function getReviews(limit = 10) {
  await db.read();
  return db.data.reviews.slice(-limit).reverse();
}

// Balance operations
export async function updateUserBalance(userId, amount) {
  await db.read();
  const userIndex = db.data.users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    db.data.users[userIndex].balance = (db.data.users[userIndex].balance || 0) + amount;
    await db.write();
    return db.data.users[userIndex].balance;
  }
  
  return null;
}

export async function getUserBalance(userId) {
  const user = await getUser(userId);
  return user ? (user.balance || 0) : 0;
}

// Payment request operations
export async function addPaymentRequest(request) {
  await db.read();
  db.data.paymentRequests.push({
    id: Date.now(),
    ...request,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  await db.write();
}

export async function getPaymentRequests() {
  await db.read();
  return db.data.paymentRequests;
}

export async function updatePaymentRequestStatus(requestId, status) {
  await db.read();
  const requestIndex = db.data.paymentRequests.findIndex(r => r.id === requestId);
  
  if (requestIndex >= 0) {
    db.data.paymentRequests[requestIndex].status = status;
    await db.write();
    return db.data.paymentRequests[requestIndex];
  }
  
  return null;
}

export async function getPaymentRequest(requestId) {
  await db.read();
  return db.data.paymentRequests.find(r => r.id === requestId);
}

export default db;
