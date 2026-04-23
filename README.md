# Telegram Digital Products Bot (Node.js + Telegraf)

Professional Telegram bot for selling digital products (Telegram Stars, Telegram Premium, and Robux) built with Node.js and Telegraf.js.

## Features

- 🌟 **Telegram Stars** - 50 to 1000 stars (14,000 - 250,000 UZS)
- 💎 **Telegram Premium** - Subscription (1, 12 months) and Gift (3, 6, 12 months)
- 🎮 **Robux** - 40 to 3500 Robux, including special packages (500, 1000)
- ✍️ **Contact** - Direct contact with admins
- 📊 **Reviews** - Customer reviews system
- 👨‍💻 **Admin Panel** - User statistics and broadcast messaging

## Tech Stack

- **Language**: Node.js (ES Modules)
- **Library**: Telegraf.js 4.x
- **Database**: LowDB (JSON file storage)
- **Style**: Modern inline keyboards with emojis

## Project Structure

```
Ibouchunbot/
├── index.js                # Bot entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (bot token)
├── data/
│   └── db.json            # JSON database (auto-created)
├── src/
│   ├── config/
│   │   ├── config.js      # Bot configuration
│   │   └── database.js    # Database operations (LowDB)
│   └── handlers/
│       ├── start.js       # /start command and main menu
│       ├── stars.js       # Stars product handlers
│       ├── premium.js     # Premium product handlers
│       ├── robux.js       # Robux product handlers
│       ├── contact.js     # Contact information
│       ├── reviews.js     # Reviews system
│       └── admin.js       # Admin panel
└── keyboards/
    └── keyboards.js       # Inline keyboard layouts
```

## Installation

1. **Navigate to project directory**
   ```bash
   cd Ibouchunbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   - Edit `.env` file (already created with your token)
   - Update admin IDs in `src/config/config.js` (get IDs from [@userinfobot](https://t.me/userinfobot))

4. **Run the bot**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Admin Commands

- `/admin` - Show admin panel with user statistics
- `/stats` - Show detailed statistics
- `/broadcast <message>` - Send message to all users

## User Commands

- `/start` - Start the bot and show main menu
- `/review <text>` - Leave a review

## Configuration

Edit `src/config/config.js` to set:
- `ADMIN_IDS` - List of admin user IDs (numbers, not usernames)
- `ADMIN_USERNAMES` - List of admin usernames for display

## Product Prices

### Telegram Stars
- 50 ⭐ - 14,000 UZS
- 100 ⭐ - 28,000 UZS
- 150 ⭐ - 42,000 UZS
- 200 ⭐ - 56,000 UZS
- 250 ⭐ - 70,000 UZS
- 500 ⭐ - 140,000 UZS
- 750 ⭐ - 210,000 UZS
- 1000 ⭐ - 250,000 UZS

### Telegram Premium
- 1 month (Subscription) - 80,000 UZS
- 12 months (Subscription) - 850,000 UZS
- 3 months (Gift) - 240,000 UZS
- 6 months (Gift) - 450,000 UZS
- 12 months (Gift) - 850,000 UZS

### Robux
- 40 R$ - 5,000 UZS
- 80 R$ - 10,000 UZS
- 160 R$ - 20,000 UZS
- 200 R$ - 25,000 UZS
- 400 R$ - 50,000 UZS
- 800 R$ - 100,000 UZS
- 1700 R$ - 210,000 UZS
- 3500 R$ - 430,000 UZS
- 500 R$ (Special) - 62,500 UZS
- 1000 R$ (Special) - 125,000 UZS

## License

This project is open source and available for personal and commercial use.
