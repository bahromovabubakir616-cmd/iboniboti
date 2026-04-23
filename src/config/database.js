import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// --- CONFIGURATION ---
// Use process.cwd() to ensure we are relative to the project root in Railway's /app directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [],
  orders: [],
  reviews: [],
  paymentRequests: []
};

// --- DIRECTORY INITIALIZATION ---
// Task 1: Ensure required directories are created at runtime
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Production: Created directory at ${DATA_DIR}`);
  }
} catch (error) {
  console.error('❌ Critical: Failed to create data directory:', error);
}

// --- LOWDB SETUP ---
// Task 3: Improve lowdb / JSON storage logic
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

/**
 * Task 1 & 3: Ensure database is ready for production.
 * Handles missing files and directory structure automatically.
 */
export async function initDatabase() {
  try {
    // Task 5: Fallback handling
    await db.read();
    
    if (!db.data) {
      console.log('📝 First run: Initializing database with default schema...');
      db.data = defaultData;
      await db.write();
    }
    
    console.log('✅ Production: Database initialized and loaded');
  } catch (error) {
    console.error('❌ Database Initialization Error:', error.message);
    // Fallback: keep app running with in-memory data if filesystem fails
    db.data = defaultData;
    console.log('⚠️ Fallback: App running with in-memory database only');
  }
}

// --- UTILITY WRAPPERS ---
// Task 2: Add safe file handling
async function safeRead() {
  try {
    await db.read();
    db.data ||= defaultData;
  } catch (error) {
    console.error('❌ Error reading from database:', error.message);
  }
}

async function safeWrite() {
  try {
    // Task 1: Ensure directory exists before writing
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    await db.write();
  } catch (error) {
    console.error('❌ Error writing to database:', error.message);
    // Task 5: Keep app running even if write fails
  }
}

// --- DATA OPERATIONS ---

export async function addUser(user) {
  await safeRead();
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
  
  await safeWrite();
}

export async function getUser(userId) {
  await safeRead();
  return db.data.users.find(u => u.id === userId);
}

export async function getAllUsers() {
  await safeRead();
  return db.data.users;
}

export async function getUsersCount() {
  await safeRead();
  return db.data.users.length;
}

export async function addOrder(order) {
  await safeRead();
  db.data.orders.push({
    id: Date.now(),
    ...order,
    createdAt: new Date().toISOString(),
    status: 'pending'
  });
  await safeWrite();
}

export async function getOrders() {
  await safeRead();
  return db.data.orders;
}

export async function addReview(review) {
  await safeRead();
  db.data.reviews.push({
    id: Date.now(),
    ...review,
    createdAt: new Date().toISOString()
  });
  await safeWrite();
}

export async function getReviews(limit = 10) {
  await safeRead();
  return db.data.reviews.slice(-limit).reverse();
}

export async function updateUserBalance(userId, amount) {
  await safeRead();
  const userIndex = db.data.users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    db.data.users[userIndex].balance = (db.data.users[userIndex].balance || 0) + amount;
    await safeWrite();
    return db.data.users[userIndex].balance;
  }
  
  return null;
}

export async function getUserBalance(userId) {
  const user = await getUser(userId);
  return user ? (user.balance || 0) : 0;
}

export async function addPaymentRequest(request) {
  await safeRead();
  db.data.paymentRequests.push({
    id: Date.now(),
    ...request,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  await safeWrite();
}

export async function getPaymentRequests() {
  await safeRead();
  return db.data.paymentRequests;
}

export async function updatePaymentRequestStatus(requestId, status) {
  await safeRead();
  const requestIndex = db.data.paymentRequests.findIndex(r => r.id === requestId);
  
  if (requestIndex >= 0) {
    db.data.paymentRequests[requestIndex].status = status;
    await safeWrite();
    return db.data.paymentRequests[requestIndex];
  }
  
  return null;
}

export async function getPaymentRequest(requestId) {
  await safeRead();
  return db.data.paymentRequests.find(r => r.id === requestId);
}

export default db;
