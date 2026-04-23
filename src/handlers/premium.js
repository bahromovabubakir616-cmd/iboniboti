import { premiumKeyboard, createBuyKeyboard, backKeyboard } from '../../keyboards/keyboards.js';
import { addOrder, getUserBalance, updateUserBalance } from '../config/database.js';

// Premium prices
const PREMIUM_PRICES = {
  '1_month': 50000,
  '12_month': 318000,
  'gift_3': 185000,
  'gift_6': 232000,
  'gift_12': 432000
};

const PREMIUM_NAMES = {
  '1_month': 'Telegram Premium - 1 oy (Kirish bilan)',
  '12_month': 'Telegram Premium - 12 oy (Kirish bilan)',
  'gift_3': 'Telegram Premium - 3 oy (Sovg\'a)',
  'gift_6': 'Telegram Premium - 6 oy (Sovg\'a)',
  'gift_12': 'Telegram Premium - 12 oy (Sovg\'a)'
};

export const premiumHandler = (bot) => {
  // Show Premium products
  bot.action('premium', async (ctx) => {
    try {
      const text = 
        '💎 *Telegram Premium*\n\n' +
        '⚡ *Tezkor aktivatsiya*\n' +
        '💰 *Qulay narxlar*\n\n' +
        '👇 Turi va muddatni taning:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: premiumKeyboard
      });
    } catch (error) {
      // Ignore edit errors
    }
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      // Ignore callback query errors
    }
  });
  
  // Show specific Premium product
  bot.action(/^premium_(.+)$/, async (ctx) => {
    try {
      const productKey = ctx.match[1];
      
      // Skip category buttons
      if (productKey === 'subscription' || productKey === 'gift') {
        await ctx.answerCbQuery();
        return;
      }
      
      const price = PREMIUM_PRICES[productKey] || 0;
      const name = PREMIUM_NAMES[productKey] || 'Telegram Premium';
      
      const text = 
        `💎 *${name}*\n\n` +
        `💰 *Narx:* ${price.toLocaleString()} so'm\n\n` +
        '⚡ *Yetkazib berish:* Avtomatik\n' +
        '✅ *To\'lov:* Click, Payme, Uzum\n\n' +
        '👇 Sotib olish uchun tugmani bosing:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: createBuyKeyboard(`premium_${productKey}`)
      });
    } catch (error) {
      console.error(error);
    }
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      console.error(error);
    }
  });
  
  // Handle Premium purchase
  bot.action(/^buy_premium_(.+)$/, async (ctx) => {
    try {
      const productKey = ctx.match[1];
      const price = PREMIUM_PRICES[productKey] || 0;
      const name = PREMIUM_NAMES[productKey] || 'Telegram Premium';
      const user = ctx.from;
      
      // Check user balance
      const balance = await getUserBalance(user.id);
      
      if (balance < price) {
        const insufficientText = 
          '❌ *Mablag\' yetarli emas!*\n\n' +
          `💰 *Kerakli summa:* ${price.toLocaleString()} so'm\n` +
          `👛 *Hozirgi balans:* ${balance.toLocaleString()} so'm\n` +
          `⚠️ *Yetmayotgan summa:* ${(price - balance).toLocaleString()} so'm\n\n` +
          '👇 Balansni to\'ldirish uchun "Balansim" tugmasini bosing:';
        
        await ctx.editMessageText(insufficientText, {
          parse_mode: 'Markdown',
          reply_markup: backKeyboard
        });
        return;
      }
      
      // Deduct from balance
      await updateUserBalance(user.id, -price);
      
      // Save order to database
      await addOrder({
        userId: user.id,
        productType: 'Premium',
        productName: name,
        quantity: 1,
        price: price
      });
      
      const text = 
        `💎 *Buyurtma qabul qilindi!*\n\n` +
        `📦 *Mahsulot:* ${name}\n` +
        `💰 *Narx:* ${price.toLocaleString()} so'm\n` +
        `👛 *Balansdan ayirildi:* ${price.toLocaleString()} so'm\n\n` +
        `👤 *Sizning ID:* ${user.id}\n\n` +
        '📞 *Admin bilan bog\'lanish uchun:*\n' +
        '• @zeroxxxxxa\n' +
        '• @zaynet_07\n\n' +
        '⏰ *Admin tez orada siz bilan bog\'lanadi!*';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: backKeyboard
      });
    } catch (error) {
      // Ignore edit errors
    }
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      // Ignore callback query errors
    }
  });
};
