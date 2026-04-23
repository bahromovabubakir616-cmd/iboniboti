import { contactAdminKeyboard } from '../../keyboards/keyboards.js';

export const contactHandler = (bot) => {
  bot.action('contact', async (ctx) => {
    try {
      const text = 
        '✍️ *Aloqa*\n\n' +
        '👨‍💻 *Adminlarimiz bilan bog\'lanish:*\n\n' +
        '• @zeroxxxxxa\n' +
        '• @zaynet_07\n\n' +
        '⏰ *Ish vaqti:* 09:00 - 22:00\n' +
        '📞 *Tezkor javob garantilangan!*\n\n' +
        '👇 Admin bilan bog\'lanish uchun tugmani bosing:';
      
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: contactAdminKeyboard
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
