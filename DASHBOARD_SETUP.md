# SkillSparkHub Dashboard Setup Guide

This guide will help you set up the fully integrated dashboard system for your SkillSparkHub Discord bot.

## Overview

The dashboard provides a web interface to:
- View bot statistics and status
- Manage commands (enable/disable per server)
- Configure moderation settings
- View and manage servers
- Manage greeting messages, auto-line, and feedback systems

## Prerequisites

- A Discord Bot with a valid token
- Discord OAuth2 application credentials
- Python 3.11 (already installed)
- Node.js (already installed)

## Step 1: Get Discord OAuth2 Credentials

1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Go to "OAuth2" section in the left sidebar
4. Copy your **Client ID** and **Client Secret**
5. Add a redirect URL: `http://localhost:5000/callback` (for local development)
   - For production, use your actual domain: `https://yourdomain.com/callback`

## Step 2: Configure Environment Variables

You need to set up the following environment variables in Replit's Secrets:

### Required Secrets:

1. **DISCORD_TOKEN** - Your Discord bot token
2. **DISCORD_CLIENT_ID** - Your Discord application Client ID
3. **DISCORD_CLIENT_SECRET** - Your Discord application Client Secret
4. **DISCORD_REDIRECT_URI** - The OAuth2 callback URL
   - Local: `http://localhost:5000/callback`
   - Production: `https://your-repl-url.repl.co/callback`
5. **FLASK_SECRET_KEY** - A random secret key for Flask sessions
   - Generate one using: `python -c "import secrets; print(secrets.token_hex(32))"`
6. **OWNER_ID** - Your Discord user ID (already set: 1392792427051614249)

### How to add secrets in Replit:

1. Click on the "Secrets" tab in the left sidebar (🔒 icon)
2. Click "Add Secret"
3. Enter the key name and value
4. Click "Add Secret"

Repeat for all the required secrets above.

## Step 3: Run the Dashboard

Once all secrets are configured, simply run your Replit project. The launcher will start both:
- Discord Bot (runs on internal port 3000)
- Flask Dashboard (runs on port 5000 - the main webview)

The dashboard will be accessible at your Replit URL.

## Step 4: Access the Dashboard

1. Open your Replit webview
2. You'll be redirected to the login page
3. Click "Login with Discord"
4. Authorize the application
5. You'll be redirected back to the dashboard

## Dashboard Pages

### 🏠 Home
- View bot statistics (servers, users, status)
- See bot information
- Quick links to other pages

### ⚙️ Commands
- Select a server from the dropdown
- Enable/disable commands per server
- Commands are organized by category

### 🛡️ Moderation
- Configure greeting messages
- Set up auto-line (automatic message sending)
- Configure feedback system
- Manage per-server moderation settings

### 🌐 Servers
- View all servers where you have manage permissions
- Click on a server to see:
  - Text channels
  - Voice channels
  - Roles

### 👤 Profile
- View your Discord profile
- Logout button

## Features

### Discord OAuth2 Authentication
- Secure login using Discord
- Only admins can access the dashboard
- Session-based authentication

### Command Management
- Enable/disable commands per server
- Changes are saved to your bot's data files
- Real-time synchronization with bot

### Moderation Settings
- Configure greeting messages with custom text
- Set greeting duration (auto-delete)
- Enable/disable auto-line feature
- Manage feedback system

### Server Management
- View all channels and roles
- Server-specific settings
- Easy navigation between servers

## Security

- Dashboard requires Discord OAuth2 login
- Only users who are admins in servers where the bot is present can access
- All settings are saved to your bot's existing JSON data files
- Sessions are encrypted with Flask secret key

## Troubleshooting

### "Access Denied" after login
- Make sure you're an admin (or have the Streeter role) in at least one server where the bot is present
- Check that your user ID matches the OWNER_ID or is in the admins.json file

### Dashboard not loading
- Check that all environment variables/secrets are set correctly
- Make sure Flask is running on port 5000
- Check the console logs for errors

### Settings not saving
- Ensure the bot has write permissions to the /data directory
- Check that the data files exist and are properly formatted JSON

### OAuth callback error
- Verify DISCORD_REDIRECT_URI matches exactly what's set in Discord Developer Portal
- For Replit, use: `https://your-repl-name.repl.co/callback`

## File Structure

```
/dashboard/
  main.py              # Flask application with OAuth2
  /templates/          # HTML templates
    login.html
    home.html
    commands.html
    moderation.html
    servers.html
    server_detail.html
    user.html
    unauthorized.html
  /static/             # CSS and static files
    style.css
/data/                 # Bot data files (shared with bot)
  disabledCommands.json
  greetings.json
  autoLine.json
  feedback.json
  admins.json
  ...
launcher.js            # Runs both bot and dashboard
index.js               # Discord bot
```

## Support

If you encounter issues:
1. Check the console logs
2. Verify all environment variables are set
3. Ensure your Discord OAuth2 application is properly configured
4. Check that the redirect URI matches in both Discord Developer Portal and your environment variables

## Notes

- The dashboard shares the same data files as your bot
- Changes made in the dashboard are immediately reflected in the bot
- The bot must be running for the dashboard to work properly
- Admin access is controlled by your bot's admin system
