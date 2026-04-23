import { ADMIN_IDS } from '../config/config.js';
import { getUsersCount, getAllUsers, getUser, updateUserBalance } from '../config/database.js';

export const adminHandler = (bot) => {
  // Admin panel
  bot.command('admin', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!ADMIN_IDS.includes(userId)) {
      await ctx.reply('❌ Siz admin emassiz!');
      return;
    }
    
    const usersCount = await getUsersCount();
    
    const text = 
      '👨‍💻 *Admin Panel*\n\n' +
      `👥 *Foydalanuvchilar soni:* ${usersCount}\n\n` +
      '📢 *Xabar yuborish uchun:* /broadcast\n' +
      '📊 *Statistika uchun:* /stats\n' +
      '💰 *Balans to\'ldirish uchun:* /addbalance <user_id> <summa>';
    
    await ctx.replyWithMarkdown(text);
  });
  
  // Show statistics
  bot.command('stats', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!ADMIN_IDS.includes(userId)) {
      await ctx.reply('❌ Siz admin emassiz!');
      return;
    }
    
    const usersCount = await getUsersCount();
    const users = await getAllUsers();
    
    let text = 
      '📊 *Statistika*\n\n' +
      `👥 *Jami foydalanuvchilar:* ${usersCount}\n\n` +
      '*Oxirgi 10 foydalanuvchi:*\n';
    
    const lastUsers = users.slice(-10);
    lastUsers.forEach(user => {
      const username = user.username || 'No username';
      const firstName = user.firstName || 'No name';
      text += `• ${firstName} (@${username}) - ID: ${user.id}\n`;
    });
    
    await ctx.replyWithMarkdown(text);
  });
  
  // Broadcast message
  bot.command('broadcast', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!ADMIN_IDS.includes(userId)) {
      await ctx.reply('❌ Siz admin emassiz!');
      return;
    }
    
    const messageText = ctx.message.text.replace('/broadcast', '').trim();
    
    if (!messageText) {
      await ctx.reply(
        '📢 *Xabar yuborish*\n\n' +
        'Marhamat, yubormoqchi bo\'lgan xabaringizni yozing:\n' +
        'Masalan: /broadcast Salom hammaga!',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    const users = await getAllUsers();
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        await ctx.telegram.sendMessage(
          user.id,
          `📢 *E'lon*\n\n${messageText}`,
          { parse_mode: 'Markdown' }
        );
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
    
    await ctx.reply(
      `✅ *Xabar yuborildi!*\n\n` +
      `✅ *Muvaffaqiyatli:* ${successCount}\n` +
      `❌ *Muvaffaqiyatsiz:* ${failCount}`,
      { parse_mode: 'Markdown' }
    );
  });
  
  // Add balance to user
  bot.command('addbalance', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!ADMIN_IDS.includes(userId)) {
      await ctx.reply('❌ Siz admin emassiz!');
      return;
    }
    
    const args = ctx.message.text.split(' ');
    
    if (args.length < 3) {
      await ctx.reply(
        '💰 *Balans to\'ldirish*\n\n' +
        'Foydalanish: /addbalance <user_id yoki @username> <summa>\n\n' +
        'Masalan: /addbalance 123456789 50000\n' +
        'Yoki: /addbalance @username 50000',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    const targetUserInput = args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount)) {
      await ctx.reply('❌ Noto\'g\'ri format! Summa raqam bo\'lishi kerak.');
      return;
    }
    
    if (amount <= 0) {
      await ctx.reply('❌ Summa musbat bo\'lishi kerak!');
      return;
    }
    
    let targetUserId;
    let user;
    
    // Check if input is username or user ID
    if (targetUserInput.startsWith('@')) {
      // It's a username, find user by username
      const username = targetUserInput.substring(1).toLowerCase();
      const allUsers = await getAllUsers();
      user = allUsers.find(u => u.username && u.username.toLowerCase() === username);
      
      if (!user) {
        await ctx.reply(`❌ Foydalanuvchi topilmadi: ${targetUserInput}`);
        return;
      }
      targetUserId = user.id;
    } else {
      // It's a user ID
      targetUserId = parseInt(targetUserInput);
      
      if (isNaN(targetUserId)) {
        await ctx.reply('❌ Noto\'g\'ri format! User_id raqam bo\'lishi kerak.');
        return;
      }
      
      user = await getUser(targetUserId);
      if (!user) {
        await ctx.reply('❌ Foydalanuvchi topilmadi!');
        return;
      }
    }
    
    // Add balance
    const newBalance = await updateUserBalance(targetUserId, amount);
    
    // Notify admin
    await ctx.reply(
      `✅ *Balans to\'ldirildi!*\n\n` +
      `👤 *Foydalanuvchi ID:* ${targetUserId}\n` +
      `👛 *Ism:* ${user.firstName || 'No name'}\n` +
      `💰 *Qo\'shilgan summa:* ${amount.toLocaleString()} so'm\n` +
      `📊 *Yangi balans:* ${newBalance.toLocaleString()} so'm`,
      { parse_mode: 'Markdown' }
    );
    
    // Notify user
    try {
      await ctx.telegram.sendMessage(
        targetUserId,
        `✅ *Balansingiz to\'ldirildi!*\n\n` +
        `💰 *Qo\'shilgan summa:* ${amount.toLocaleString()} so'm\n` +
        `📊 *Hozirgi balans:* ${newBalance.toLocaleString()} so'm\n\n` +
        `🎉 Endi mahsulotlarni sotib olishingiz mumkin!`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error notifying user:', error);
    }
  });
};
