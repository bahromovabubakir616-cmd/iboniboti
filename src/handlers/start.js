import { mainMenuKeyboard, backKeyboard } from '../../keyboards/keyboards.js';
import { addUser } from '../config/database.js';

export const startHandler = (bot) => {
  // Handle /start command
  bot.command('start', async (ctx) => {
    const user = ctx.from;
    
    // Add user to database
    await addUser({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name
    });
    
    const welcomeText = 
      '✨ *Assalomu alaykum!*\n\n' +
      '🌟 *Raqamli mahsulotlar do\'koniga xush kelibsiz!*\n\n' +
      'Biz sizga quyidagi xizmatlarni taklif etamiz:\n' +
      '• Telegram Stars ⭐\n' +
      '• Telegram Premium 💎\n' +
      '• Robux 🎮\n\n' +
      '👇 Mahsulotni taning:';
    
    await ctx.replyWithMarkdown(welcomeText, {
      reply_markup: mainMenuKeyboard
    });
  });
  
  // Handle back to menu button
  bot.action('back_to_menu', async (ctx) => {
    try {
      await ctx.editMessageText(
        '🏠 *Asosiy menyu*\n\n👇 Mahsulotni taning:',
        {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard
        }
      );
    } catch (error) {
      // Ignore edit errors (message might be too old)
    }
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      // Ignore callback query errors (query might be too old)
    }
  });
};
