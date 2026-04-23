import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// 1. Simplified Path: Use root directory directly for db.json
// This avoids the "no such directory" error for 'data' folder
const DB_FILE = path.resolve(process.cwd(), 'db.json');

console.log(`🚀 DEBUG: Database file path: ${DB_FILE}`);

const defaultData = {
  users: [],
  orders: [],
  reviews: [],
  paymentRequests: []
};

// 2. Immediate Setup
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

export async function initDatabase() {
  try {
    console.log('📖 DEBUG: Reading database...');
    await db.read();
    
    if (!db.data) {
      console.log('📝 DEBUG: Initializing default data...');
      db.data = defaultData;
      await db.write();
      console.log('✅ DEBUG: Database created at root');
    } else {
      console.log('✅ DEBUG: Database loaded successfully');
    }
  } catch (error) {
    console.error('❌ DEBUG: Init Error:', error.message);
    db.data = defaultData;
  }
}

// Safe Wrappers
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
    await db.write();
  } catch (error) {
    console.error('❌ DB Write Error:', error.message);
  }
}

// Data Operations
export async function addUser(user) {
  await safeRead();
  const existingIndex = (db.data.users || []).findIndex(u => u.id === user.id);
  
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
  return (db.data.users || []).find(u => u.id === userId);
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
  db.data.orders ||= [];
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
  db.data.reviews ||= [];
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
  const userIndex = (db.data.users || []).findIndex(u => u.id === userId);
  
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
  db.data.paymentRequests ||= [];
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
  const requestIndex = (db.data.paymentRequests || []).findIndex(r => r.id === requestId);
  
  if (requestIndex >= 0) {
    db.data.paymentRequests[requestIndex].status = status;
    await safeWrite();
    return db.data.paymentRequests[requestIndex];
  }
  return null;
}

export async function getPaymentRequest(requestId) {
  await safeRead();
  return (db.data.paymentRequests || []).find(r => r.id === requestId);
}

export default db;
