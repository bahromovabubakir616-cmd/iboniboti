import { backKeyboard } from '../../keyboards/keyboards.js';
import { addReview, getReviews } from '../config/database.js';

export const reviewsHandler = (bot) => {
  // Show reviews
  bot.action('reviews', async (ctx) => {
    try {
      const reviews = await getReviews(5);
      
      let text = '📊 *Sharhlar*\n\n';
      
      if (reviews.length === 0) {
        text += '😊 *Hozircha sharhlar yo\'q*\n\n' +
                '👇 Birinchi sharhni siz qoldiring!';
      } else {
        reviews.forEach(review => {
          const username = review.username || 'Foydalanuvchi';
          const stars = '⭐'.repeat(review.rating || 5);
          text += `${stars} *${username}*\n`;
          text += `${review.reviewText}\n\n`;
        });
        text += '👇 Sharh qoldirish uchun /review buyrug\'ini yozing';
      }
      
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
  
  // Handle /review command
  bot.command('review', async (ctx) => {
    const messageText = ctx.message.text.replace('/review', '').trim();
    
    if (!messageText) {
      await ctx.reply(
        '📝 *Sharh qoldirish*\n\n' +
        'Marhamat, sharhingizni yozing:\n\n' +
        '⭐️ *Baho:* 1-5 orasida\n' +
        '💬 *Matn:* Sharhingiz',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    const user = ctx.from;
    const username = user.username || user.first_name;
    
    // Simple rating based on message length
    const rating = Math.min(5, Math.max(1, Math.floor(messageText.length / 10) + 1));
    
    await addReview({
      userId: user.id,
      username: username,
      reviewText: messageText,
      rating: rating
    });
    
    await ctx.reply(
      '✅ *Sharh qabul qilindi!*\n\n' +
      'Rahmat! Sharhingiz uchun tashakkur!',
      { parse_mode: 'Markdown', reply_markup: backKeyboard }
    );
  });
};
