# Dealer Bot

A feature-rich Discord bot with giveaways, greetings, moderation, and owner management capabilities.

## Running tests

Run the invite tracking tests with:

```sh
npm test
```

## Features

### 🎉 Giveaway System
- `$gstart <duration> <winners> <prize>` - Start a giveaway (e.g., `$gstart 1h 1 Discord Nitro`)
- `$gend <message_id>` - End a giveaway early
- `$box` - View all active giveaways
- `$winners <message_id>` - View winners of a completed giveaway

### 🎡 Wheel & Points System
- `$wheelticket` - Open a private wheel ticket to claim a reward (costs 1 point)
- `$invites [@user]` - View invite totals, invited members, how long they stayed, and whether they left
- `$addpoints @user <amount>` - Add points to a user (requires Manage Server permission)
- `$setinvitelog #channel` - Set the Arabic join/leave and invite log channel
- `$addreward <reward>` - Add a wheel reward (requires Manage Server permission)
- `$removereward <number>` - Remove a reward by its index
- `$listrewards` - List all configured wheel rewards

**How the Wheel System Works:**
- Users earn points through invites or can be given points by admins
- When a user uses `$wheelticket`, a private ticket (thread) is created
- Inside the ticket, the bot spins the wheel and awards a random reward
- The ticket automatically archives after 10 seconds

### 👋 Greeting System
- `$greet <on|off>` - Enable/disable greeting system
- `$setgreet <#channel> <message>` - Set greeting channel and message
  - Variables: `{user}`, `{username}`, `{server}`
- `$greetduration <seconds>` - Set how long greetings stay (0 = permanent)
- `$testgreet` - Test the greeting message

### 🔒 Channel Control
- `$hide [#channel]` - Hide a channel from @everyone and disable @everyone mentions
- `$show [#channel]` - Show a channel to @everyone and enable @everyone mentions

### 🛡️ Moderation
- `$ban <@user> [reason]` - Ban a user
- `$unban <user_id>` - Unban a user
- `$clear <1-100>` - Clear messages
- `$mute <@user> <duration> [reason]` - Timeout a user (e.g., `$mute @user 10m`)
- `$unmute <@user>` - Remove timeout from a user

### 📋 Logging System
- `$setlog #channel` - Set a log channel (select type from dropdown menu)
- `$viewlogs` - View all configured log channels
- `$disablelog` - Disable a specific log type (select from dropdown menu)

**Available Log Types:**
- 👥 **Member Join/Leave** - Logs when members join or leave the server
- ✏️ **Message Edit/Delete** - Logs message edits and deletions
- 🎭 **Role Changes** - Logs when roles are added or removed from members
- 📁 **Channel Changes** - Logs channel creation, deletion, and updates
- 🔨 **Ban/Unban/Kick** - Logs moderation actions
- 🎙️ **Voice State Changes** - Logs voice channel join/leave/move
- 🏷️ **Nickname Changes** - Logs nickname changes
- ⚙️ **Server Updates** - Logs server settings changes

**How It Works:**
- Administrators can set different channels for different log types
- Use the dropdown menu to select which events to log
- Set one channel for all logs or different channels for each type
- Logs are sent automatically when events occur

### 👑 Owner Commands
These commands are restricted to the Discord user IDs listed in OWNER_IDS in index.js.

#### Bot Management
- `$servers` - List all servers the bot is in
- `$leave <server_id>` - Leave a server
- `$setname <new_name>` - Change bot's username
- `$setavatar <image_url>` - Change bot's avatar
- `$setbanner <image_url>` - Change bot's banner (or attach an image)
- `$setcolor <#RRGGBB|default>` - Change the bot's primary embed color
- `$setstatus <text>` - Change bot's status

#### Admin System
- `$addadmin <user_id>` - Add a user to admin list
- `$removeadmin <user_id>` - Remove a user from admin list
- `$adminlist` - View all bot admins

#### Blacklist System
- `$blacklist user <user_id>` - Blacklist/unblacklist a user
- `$blacklist server <server_id>` - Blacklist/unblacklist a server
- `$blacklist list` - View all blacklisted users and servers

## Setup

### 1. Prerequisites
- Node.js 18 or higher
- A Discord bot token
- Your Discord user ID

### 2. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
6. Go to "OAuth2" > "URL Generator"
7. Select scopes: `bot`
8. Select permissions:
   - Manage Channels
   - Manage Roles
   - Ban Members
   - Timeout Members
   - Manage Messages
   - Read Messages/View Channels
   - Send Messages
   - Manage Server
   - Add Reactions
9. Copy the generated URL and invite the bot to your server

### 3. Get Your Discord User ID
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your username and select "Copy User ID"

### 4. Installation
1. Clone this repository or download the files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_bot_client_id_here
   ```

4. Edit `index.js` and add your Discord user IDs to OWNER_IDS:
   ```javascript
   const OWNER_ID = "your_discord_user_id_here";
   const OWNER_IDS = new Set([OWNER_ID, "co_owner_discord_user_id_here"]);
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Required Bot Permissions

The bot needs these permissions to function properly:
- **Manage Channels** - For hide/show commands
- **Manage Roles** - For permission overwrites
- **Ban Members** - For ban/unban commands
- **Timeout Members** - For mute/unmute commands
- **Manage Messages** - For clear command
- **Read Messages/View Channels** - To see messages
- **Send Messages** - To respond to commands
- **Manage Server** - For giveaway management and invite tracking
- **Add Reactions** - For giveaway reactions
- **Create Public Threads** - For wheel ticket system
- **Manage Threads** - For archiving wheel tickets

## 24/7 Hosting on Replit

This bot includes a keep-alive server that runs on port 3000, making it suitable for 24/7 hosting on Replit.

1. Create a new Repl on Replit
2. Upload all files
3. Add your secrets in Replit's Secrets tab:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
4. Run the bot
5. For true 24/7 uptime, use a service like UptimeRobot to ping your Repl URL

## File Structure

```
dealer-bot/
├── commands/           # All command files
│   ├── gstart.js
│   ├── gend.js
│   ├── box.js
│   ├── winners.js
│   ├── greet.js
│   ├── setgreet.js
│   ├── greetduration.js
│   ├── testgreet.js
│   ├── hide.js
│   ├── show.js
│   ├── ban.js
│   ├── unban.js
│   ├── clear.js
│   ├── mute.js
│   ├── unmute.js
│   ├── servers.js
│   ├── leave.js
│   ├── setname.js
│   ├── setavatar.js
│   ├── setbanner.js
│   ├── setcolor.js
│   ├── setstatus.js
│   ├── addadmin.js
│   ├── removeadmin.js
│   ├── adminlist.js
│   └── blacklist.js
├── data/              # Persistent data storage
│   ├── admins.json
│   ├── blacklist.json
│   ├── giveaways.json
│   └── greetings.json
├── index.js           # Main bot file
├── package.json
├── .env               # Environment variables (create this)
├── .env.example       # Template for .env
└── README.md
```

## Data Persistence

The bot stores data in JSON files in the `data/` folder:
- `admins.json` - List of bot admin user IDs
- `blacklist.json` - Blacklisted users and servers
- `giveaways.json` - Active and past giveaways
- `greetings.json` - Server-specific greeting configurations

## Support

For issues or questions:
1. Check that all permissions are correctly set
2. Verify your bot token and OWNER_ID are correct
3. Check the console logs for error messages
4. Ensure the bot has the required intents enabled

## License

MIT License - Feel free to use and modify this bot for your needs.
