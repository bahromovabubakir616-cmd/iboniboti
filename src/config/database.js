import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Manzillarni aniqlash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /src/config/dan 2 pog'ona yuqoriga chiqib, /data/ papkasini topamiz
const ROOT_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  users: [],
  orders: [],
  reviews: [],
  paymentRequests: []
};

// 2. Papkani tekshirish va yaratish funksiyasi
const ensureDirectoryExists = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
      console.log(`📁 Papka yaratildi: ${DATA_DIR}`);
    }
  } catch (err) {
    console.error('❌ Papka yaratishda xato:', err.message);
  }
};

// Birinchi marta ishga tushganda tekshiramiz
ensureDirectoryExists();

// 3. LowDB sozlamalari
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

export async function initDatabase() {
  try {
    ensureDirectoryExists();
    console.log('📖 Baza o\'qilmoqda...');
    await db.read();
    
    if (!db.data) {
      console.log('📝 Yangi baza fayli yaratilmoqda...');
      db.data = defaultData;
      await db.write();
    }
    console.log('✅ Baza muvaffaqiyatli yuklandi');
  } catch (error) {
    console.error('❌ Baza yuklashda xato:', error.message);
    db.data = defaultData; // Xato bo'lsa xotiradagi bo'sh baza bilan ishlayveradi
  }
}

// 4. Xavfsiz o'qish va yozish funksiyalari
async function safeRead() {
  try {
    await db.read();
    if (!db.data) db.data = defaultData;
  } catch (error) {
    console.error('❌ O\'qishda xato:', error.message);
  }
}

async function safeWrite() {
  try {
    // Har safar yozishdan oldin papka borligiga ishonch hosil qilamiz
    ensureDirectoryExists();
    await db.write();
  } catch (error) {
    console.error('❌ Yozishda xato:', error.message);
    // Crash bo'lmasligi uchun xatoni ushlab qolamiz
  }
}

// --- DATA OPERATIONS ---

export async function addUser(user) {
  await safeRead();
  const users = db.data.users || [];
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = { 
      ...users[existingIndex], 
      ...user,
      balance: users[existingIndex].balance || 0
    };
  } else {
    users.push({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      balance: 0,
      joinedAt: new Date().toISOString()
    });
  }
  db.data.users = users;
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
  return (db.data.users || []).length;
}

export async function addOrder(order) {
  await safeRead();
  db.data.orders = db.data.orders || [];
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
  db.data.reviews = db.data.reviews || [];
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
  const users = db.data.users || [];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex].balance = (users[userIndex].balance || 0) + amount;
    db.data.users = users;
    await safeWrite();
    return users[userIndex].balance;
  }
  return null;
}

export async function getUserBalance(userId) {
  const user = await getUser(userId);
  return user ? (user.balance || 0) : 0;
}

export async function addPaymentRequest(request) {
  await safeRead();
  db.data.paymentRequests = db.data.paymentRequests || [];
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
  const requests = db.data.paymentRequests || [];
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex >= 0) {
    requests[requestIndex].status = status;
    db.data.paymentRequests = requests;
    await safeWrite();
    return requests[requestIndex];
  }
  return null;
}

export async function getPaymentRequest(requestId) {
  await safeRead();
  return (db.data.paymentRequests || []).find(r => r.id === requestId);
}

export default db;
