import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Get absolute root directory accurately
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming this file is in /src/config/database.js, root is two levels up
const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [],
  orders: [],
  reviews: [],
  paymentRequests: []
};

// 2. Ultra-robust directory creation at the very top level
console.log(`🔍 System: Initializing filesystem at ${DATA_DIR}`);
try {
  // Ensure we have an absolute path and create recursively
  if (!fs.existsSync(DATA_DIR)) {
    console.log('📂 Directory missing, creating...');
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
    console.log('✅ Directory created successfully');
  } else {
    console.log('✅ Directory already exists');
  }
  
  // Test write permissions immediately
  const testFile = path.join(DATA_DIR, '.write_test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Filesystem is writable');
} catch (error) {
  console.error('❌ CRITICAL FILESYSTEM ERROR:', error.message);
  // We don't throw here to allow the app to try starting with in-memory fallback
}

// 3. Initialize LowDB
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

export async function initDatabase() {
  try {
    console.log('📖 Reading database file...');
    await db.read();
    
    if (!db.data) {
      console.log('🆕 Database file not found or empty. Initializing with defaults...');
      db.data = defaultData;
      
      // Double check directory before writing
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      
      await db.write();
      console.log('✅ Database file created');
    } else {
      console.log('✅ Database loaded: %d users found', db.data.users?.length || 0);
    }
  } catch (error) {
    console.error('❌ Database Load Error:', error.message);
    db.data = defaultData;
    console.log('⚠️ Using in-memory fallback database');
  }
}

// 4. Safe Wrappers for runtime operations
async function safeRead() {
  try {
    await db.read();
    if (!db.data) db.data = defaultData;
  } catch (error) {
    console.error('❌ DB Read Error:', error.message);
  }
}

async function safeWrite() {
  try {
    // One last check for directory before any write
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    await db.write();
  } catch (error) {
    console.error('❌ DB Write Error:', error.message);
    // If it fails, we keep going in memory
  }
}

// 5. Data Operations
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
  return db.data.users || [];
}

export async function getUsersCount() {
  await safeRead();
  return db.data.users?.length || 0;
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
  return db.data.orders || [];
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
  return (db.data.reviews || []).slice(-limit).reverse();
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
  return db.data.paymentRequests || [];
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
