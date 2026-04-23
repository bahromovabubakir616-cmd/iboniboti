import { robuxKeyboard, createBuyKeyboard, backKeyboard } from '../../keyboards/keyboards.js';
import { addOrder, getUserBalance, updateUserBalance } from '../config/database.js';

// Robux prices
const ROBUX_PRICES = {
  '40': 14000,
  '80': 22000,
  '160': 44000,
  '240': 55000,
  '400': 79000,
  '540': 120000,
  '800': 155000,
  '1700': 280000,
  '2500': 430000,
  '3500': 550000,
  '500': 92000,
  '1000': 165000
};

export const robuxHandler = (bot) => {
  // Show Robux products
  bot.action('robux', async (ctx) => {
    try {
      const text = 
        '🎮 *Robux*\n\n' +
        '⚡ *Tezkor yetkazib berish*\n' +
        '💰 *Qulay narxlar*\n\n' +
        '👇 Miqdorni taning:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: robuxKeyboard
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
  
  // Show specific Robux product
  bot.action(/^robux_(\d+)$/, async (ctx) => {
    try {
      const quantity = ctx.match[1];
      
      // Skip category button
      if (quantity === 'special') {
        await ctx.answerCbQuery();
        return;
      }
      
      const price = ROBUX_PRICES[quantity] || 0;
      const isSpecial = quantity === '500' || quantity === '1000';
      
      const text = 
        `🎮 *Robux - ${quantity}${isSpecial ? ' (Maxsus)' : ''}*\n\n` +
        `💰 *Narx:* ${price.toLocaleString()} so'm\n\n` +
        '⚡ *Yetkazib berish:* Avtomatik\n' +
        '✅ *To\'lov:* Click, Payme, Uzum\n\n' +
        '👇 Sotib olish uchun tugmani bosing:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: createBuyKeyboard(`robux_${quantity}`)
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
  
  // Handle Robux purchase
  bot.action(/^buy_robux_(\d+)$/, async (ctx) => {
    try {
      const quantity = ctx.match[1];
      const price = ROBUX_PRICES[quantity] || 0;
      const isSpecial = quantity === '500' || quantity === '1000';
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
        productType: 'Robux',
        productName: `${quantity} Robux${isSpecial ? ' (Maxsus)' : ''}`,
        quantity: parseInt(quantity),
        price: price
      });
      
      const text = 
        `🎮 *Buyurtma qabul qilindi!*\n\n` +
        `📦 *Mahsulot:* Robux - ${quantity}${isSpecial ? ' (Maxsus)' : ''}\n` +
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
