// Main menu keyboard
export const mainMenuKeyboard = {
  inline_keyboard: [
    [
      { text: '🌟 Stars', callback_data: 'stars' },
      { text: '💎 Premium', callback_data: 'premium' },
      { text: '🎮 Robux', callback_data: 'robux' }
    ],
    [
      { text: '💰 Balansim', callback_data: 'balance' },
      { text: '✍️ Aloqa', callback_data: 'contact' },
      { text: '📊 Sharhlar', callback_data: 'reviews' }
    ]
  ]
};

// Stars products keyboard
export const starsKeyboard = {
  inline_keyboard: [
    [{ text: '50 ⭐', callback_data: 'stars_50' }],
    [{ text: '75 ⭐', callback_data: 'stars_75' }],
    [{ text: '100 ⭐', callback_data: 'stars_100' }],
    [{ text: '150 ⭐', callback_data: 'stars_150' }],
    [{ text: '200 ⭐', callback_data: 'stars_200' }],
    [{ text: '250 ⭐', callback_data: 'stars_250' }],
    [{ text: '300 ⭐', callback_data: 'stars_300' }],
    [{ text: '350 ⭐', callback_data: 'stars_350' }],
    [{ text: '400 ⭐', callback_data: 'stars_400' }],
    [{ text: '450 ⭐', callback_data: 'stars_450' }],
    [{ text: '500 ⭐', callback_data: 'stars_500' }],
    [{ text: '600 ⭐', callback_data: 'stars_600' }],
    [{ text: '750 ⭐', callback_data: 'stars_750' }],
    [{ text: '1000 ⭐', callback_data: 'stars_1000' }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Premium products keyboard
export const premiumKeyboard = {
  inline_keyboard: [
    [{ text: '📱 Kirish bilan', callback_data: 'premium_subscription' }],
    [{ text: '1 oy - 50,000 so\'m', callback_data: 'premium_1_month' }],
    [{ text: '12 oy - 318,000 so\'m', callback_data: 'premium_12_month' }],
    [{ text: '🎁 Sovg\'a sifatida', callback_data: 'premium_gift' }],
    [{ text: '3 oy - 185,000 so\'m', callback_data: 'premium_gift_3' }],
    [{ text: '6 oy - 232,000 so\'m', callback_data: 'premium_gift_6' }],
    [{ text: '12 oy - 432,000 so\'m', callback_data: 'premium_gift_12' }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Robux products keyboard
export const robuxKeyboard = {
  inline_keyboard: [
    [{ text: '40 R$', callback_data: 'robux_40' }],
    [{ text: '80 R$', callback_data: 'robux_80' }],
    [{ text: '160 R$', callback_data: 'robux_160' }],
    [{ text: '240 R$', callback_data: 'robux_240' }],
    [{ text: '400 R$', callback_data: 'robux_400' }],
    [{ text: '540 R$', callback_data: 'robux_540' }],
    [{ text: '800 R$', callback_data: 'robux_800' }],
    [{ text: '1700 R$', callback_data: 'robux_1700' }],
    [{ text: '2500 R$', callback_data: 'robux_2500' }],
    [{ text: '3500 R$', callback_data: 'robux_3500' }],
    [{ text: '⭐ Maxsus paketlar', callback_data: 'robux_special' }],
    [{ text: '500 R$ - Maxsus', callback_data: 'robux_500' }],
    [{ text: '1000 R$ - Maxsus', callback_data: 'robux_1000' }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Back button keyboard
export const backKeyboard = {
  inline_keyboard: [
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Contact admin keyboard
export const contactAdminKeyboard = {
  inline_keyboard: [
    [{ text: '👤 Admin: @zeroxxxxxa', url: 'https://t.me/zeroxxxxxa' }],
    [{ text: '👤 Admin: @zaynet_07', url: 'https://t.me/zaynet_07' }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Buy button keyboard
export const createBuyKeyboard = (productCallback) => ({
  inline_keyboard: [
    [{ text: '✅ Sotib olish', callback_data: `buy_${productCallback}` }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
});

// Balance keyboard
export const balanceKeyboard = {
  inline_keyboard: [
    [{ text: '➕ Balansni to\'ldirish', callback_data: 'topup_balance' }],
    [{ text: '◀️ Orqaga', callback_data: 'back_to_menu' }]
  ]
};

// Admin payment approval keyboard
export const createPaymentApprovalKeyboard = (requestId) => ({
  inline_keyboard: [
    [
      { text: '✅ Tasdiqlash', callback_data: `approve_payment_${requestId}` },
      { text: '❌ Rad etish', callback_data: `reject_payment_${requestId}` }
    ]
  ]
});
