import { Telegraf } from 'telegraf';
import { initDatabase } from './src/config/database.js';
import { BOT_TOKEN } from './src/config/config.js';
import { startHandler } from './src/handlers/start.js';
import { starsHandler } from './src/handlers/stars.js';
import { premiumHandler } from './src/handlers/premium.js';
import { robuxHandler } from './src/handlers/robux.js';
import { contactHandler } from './src/handlers/contact.js';
import { reviewsHandler } from './src/handlers/reviews.js';
import { adminHandler } from './src/handlers/admin.js';
import { paymentsHandler } from './src/handlers/payments.js';

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize database
await initDatabase();
console.log('✅ Database initialized');

// Register handlers
startHandler(bot);
starsHandler(bot);
premiumHandler(bot);
robuxHandler(bot);
contactHandler(bot);
reviewsHandler(bot);
adminHandler(bot);
paymentsHandler(bot);

console.log('🤖 Bot started...');

// Start bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
