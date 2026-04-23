import { balanceKeyboard, backKeyboard, createPaymentApprovalKeyboard } from '../../keyboards/keyboards.js';
import { 
  getUserBalance, 
  addPaymentRequest, 
  updatePaymentRequestStatus, 
  getPaymentRequest,
  updateUserBalance 
} from '../config/database.js';
import { ADMIN_IDS } from '../config/config.js';

// Payment info
const PAYMENT_INFO = {
  cardNumber: '5614 6838 5652 7148',
  cardHolder: 'Lola Abdullayeva uzcard'
};

export const paymentsHandler = (bot) => {
  // Show balance
  bot.action('balance', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const balance = await getUserBalance(userId);
      
      const text = 
        '💰 *Balansim*\n\n' +
        `👛 *Hozirgi balans:* ${balance.toLocaleString()} so'm\n\n` +
        '👇 Balansni to\'ldirish uchun tugmani bosing:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: balanceKeyboard
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
  
  // Show top-up instructions
  bot.action('topup_balance', async (ctx) => {
    try {
      const text = 
        '➕ *Balansni to\'ldirish*\n\n' +
        `💳 *Karta raqami:* ${PAYMENT_INFO.cardNumber}\n` +
        `👤 *Karta egasi:* ${PAYMENT_INFO.cardHolder}\n\n` +
        '📝 *Ko\'rsatma:*\n' +
        '1. Yuqoridagi kartaga to\'lov amalga oshiring\n' +
        '2. Ism-Familiyangizni yozing\n' +
        '3. Chek rasmini yuboring\n\n' +
        '⏰ *Admin tez orada tekshirib balansingizni to\'ldiradi!*';
      
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
  
  // Handle payment submission (text message with amount and name)
  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    
    // Check if this is a payment submission (contains numbers and looks like payment info)
    if (text.match(/\d+/) && (text.includes('so\'m') || text.includes('sum') || text.includes('to\'lov'))) {
      const userId = ctx.from.id;
      const username = ctx.from.username || ctx.from.first_name;
      
      // Extract amount from text
      const amountMatch = text.match(/(\d+(?:,\d+)*)/);
      const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
      
      if (amount > 0) {
        // Create payment request
        const requestId = Date.now();
        await addPaymentRequest({
          userId: userId,
          username: username,
          amount: amount,
          message: text,
          photoId: null // Will be updated if photo is sent
        });
        
        // Send to admin
        const adminText = 
          '💳 *Yangi to\'lov so\'rovi!*\n\n' +
          `👤 *Foydalanuvchi:* @${username}\n` +
          `🆔 *ID:* ${userId}\n` +
          `💰 *Summa:* ${amount.toLocaleString()} so'm\n\n` +
          `📝 *Xabar:* ${text}\n\n` +
          '⏰ Tasdiqlash yoki rad etish uchun tugmalardan foydalaning:';
        
        await ctx.telegram.sendMessage(
          ADMIN_IDS[0],
          adminText,
          {
            parse_mode: 'Markdown',
            reply_markup: createPaymentApprovalKeyboard(requestId)
          }
        );
        
        await ctx.reply(
          '✅ *To\'lov ma\'lumotlari yuborildi!*\n\n' +
          '📞 Admin tez orada tekshirib balansingizni to\'ldiradi.\n' +
          '⏰ Iltimos, kuting...',
          { parse_mode: 'Markdown' }
        );
        return;
      }
    }
    
    next();
  });
  
  // Handle payment photo submission
  bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const caption = ctx.message.caption || '';
    
    // Extract amount from caption
    const amountMatch = caption.match(/(\d+(?:,\d+)*)/);
    const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
    
    if (amount > 0) {
      const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      
      // Create payment request
      const requestId = Date.now();
      await addPaymentRequest({
        userId: userId,
        username: username,
        amount: amount,
        message: caption,
        photoId: photoId
      });
      
      // Send to admin with photo
      const adminText = 
        '💳 *Yangi to\'lov so\'rovi (rasm bilan)!*\n\n' +
        `👤 *Foydalanuvchi:* @${username}\n` +
        `🆔 *ID:* ${userId}\n` +
        `💰 *Summa:* ${amount.toLocaleString()} so'm\n\n` +
        `📝 *Xabar:* ${caption}\n\n` +
        '⏰ Tasdiqlash yoki rad etish uchun tugmalardan foydalaning:';
      
      await ctx.telegram.sendPhoto(
        ADMIN_IDS[0],
        photoId,
        {
          caption: adminText,
          parse_mode: 'Markdown',
          reply_markup: createPaymentApprovalKeyboard(requestId)
        }
      );
      
      await ctx.reply(
        '✅ *To\'lov ma\'lumotlari yuborildi!*\n\n' +
        '📞 Admin tez orada tekshirib balansingizni to\'ldiradi.\n' +
        '⏰ Iltimos, kuting...',
        { parse_mode: 'Markdown' }
      );
    }
  });
  
  // Admin: Approve payment
  bot.action(/^approve_payment_(\d+)$/, async (ctx) => {
    const requestId = parseInt(ctx.match[1]);
    const request = await getPaymentRequest(requestId);
    
    if (!request) {
      await ctx.answerCbQuery('So\'rov topilmadi');
      return;
    }
    
    // Update payment status
    await updatePaymentRequestStatus(requestId, 'approved');
    
    // Add balance to user
    await updateUserBalance(request.userId, request.amount);
    
    // Notify user
    const userText = 
      '✅ *Balans to\'ldirildi!*\n\n' +
      `💰 *Qo\'shilgan summa:* ${request.amount.toLocaleString()} so'm\n` +
      '🎉 Endi mahsulotlarni sotib olishingiz mumkin!';
    
    try {
      await ctx.telegram.sendMessage(request.userId, userText, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error notifying user:', error);
    }
    
    // Update admin message
    try {
      await ctx.editMessageText(
        `✅ *To\'lov tasdiqlandi!*\n\n` +
        `👤 *Foydalanuvchi:* @${request.username}\n` +
        `💰 *Summa:* ${request.amount.toLocaleString()} so'm\n\n` +
        `🆔 *ID:* ${request.userId}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      // Ignore edit errors
    }
    
    await ctx.answerCbQuery('To\'lov tasdiqlandi');
  });
  
  // Admin: Reject payment
  bot.action(/^reject_payment_(\d+)$/, async (ctx) => {
    const requestId = parseInt(ctx.match[1]);
    const request = await getPaymentRequest(requestId);
    
    if (!request) {
      await ctx.answerCbQuery('So\'rov topilmadi');
      return;
    }
    
    // Update payment status
    await updatePaymentRequestStatus(requestId, 'rejected');
    
    // Notify user
    const userText = 
      '❌ *To\'lov rad etildi!*\n\n' +
      '📞 Iltimos, admin bilan bog\'laning: @zeroxxxxxa\n' +
      '🔄 Qayta urinib ko\'ring.';
    
    try {
      await ctx.telegram.sendMessage(request.userId, userText, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error notifying user:', error);
    }
    
    // Update admin message
    try {
      await ctx.editMessageText(
        `❌ *To\'lov rad etildi!*\n\n` +
        `👤 *Foydalanuvchi:* @${request.username}\n` +
        `💰 *Summa:* ${request.amount.toLocaleString()} so'm\n\n` +
        `🆔 *ID:* ${request.userId}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      // Ignore edit errors
    }
    
    await ctx.answerCbQuery('To\'lov rad etildi');
  });
};
