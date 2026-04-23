import { starsKeyboard, createBuyKeyboard, backKeyboard } from '../../keyboards/keyboards.js';
import { addOrder, getUserBalance, updateUserBalance } from '../config/database.js';

// Stars prices
const STARS_PRICES = {
  '50': 14000,
  '75': 18000,
  '100': 25000,
  '150': 38000,
  '200': 50000,
  '250': 62000,
  '300': 75000,
  '350': 88000,
  '400': 100000,
  '450': 114000,
  '500': 125000,
  '600': 150000,
  '750': 188000,
  '1000': 250000
};

export const starsHandler = (bot) => {
  // Show Stars products
  bot.action('stars', async (ctx) => {
    try {
      const text = 
        '🌟 *Telegram Stars*\n\n' +
        '⚡ *Tezkor yetkazib berish*\n' +
        '💰 *Qulay narxlar*\n\n' +
        '👇 Miqdorni taning:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: starsKeyboard
      });
    } catch (error) {
      // Ignore edit errors
    }
    try {
      await ctx.answerCbQuery();
    } catch (error) {
    }
  });
  
  // Show specific Stars product
  bot.action(/^stars_(\d+)$/, async (ctx) => {
    try {
      const quantity = ctx.match[1];
      const price = STARS_PRICES[quantity] || 0;
      
      const text = 
        `🌟 *Telegram Stars - ${quantity} ta*\n\n` +
        `💰 *Narx:* ${price.toLocaleString()} so'm\n\n` +
        '⚡ *Yetkazib berish:* Avtomatik\n' +
        '✅ *To\'lov:* Click, Payme, Uzum\n\n' +
        '👇 Sotib olish uchun tugmani bosing:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: createBuyKeyboard(`stars_${quantity}`)
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
  
  // Handle Stars purchase
  bot.action(/^buy_stars_(\d+)$/, async (ctx) => {
    try {
      const quantity = ctx.match[1];
      const price = STARS_PRICES[quantity] || 0;
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
        productType: 'Stars',
        productName: `${quantity} Stars`,
        quantity: parseInt(quantity),
        price: price
      });
      
      const text = 
        `🌟 *Buyurtma qabul qilindi!*\n\n` +
        `📦 *Mahsulot:* Telegram Stars - ${quantity} ta\n` +
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
