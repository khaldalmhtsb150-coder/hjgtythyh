# Marka Bot

## Overview
Marka Bot is a feature-rich Discord bot built with Discord.js v14, offering comprehensive server management capabilities. It includes giveaway management, customizable greeting systems, robust moderation tools, comprehensive event logging, and owner-level bot administration. The bot utilizes a simple file-based JSON storage system for data persistence and supports both traditional prefix commands (`$`) and modern slash commands (`/`). Its design emphasizes a clear permission hierarchy, encompassing hardcoded owner IDs, managed admin lists, and Discord's native role/channel permissions, making it suitable for a wide range of Discord server management needs. The bot also features a web dashboard for real-time statistics and an advanced invite/reward system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Command System
The bot employs a dual command system with a modular design:
- **Prefix Commands (`$`):** Each command is a separate file in the `/commands` directory, defining `name`, `description`, `execute` function, and optional permission flags. Commands are loaded dynamically and support aliases. Owner/admin commands are exclusively prefix-based for security.
- **Slash Commands (`/`):** Each command is defined in a separate file in `/slash-commands` using `SlashCommandBuilder`. These are automatically registered with Discord's API on startup. All user-facing functionalities are available as slash commands.
- **Interactive Help Menu:** Both `$help` and `/help` now feature an interactive dropdown menu with 7 categories (Giveaway System, Wheel & Invites, Greeting System, Channel Control, Moderation, Auto-Line System, Feedback System). Users select a category to view only those commands. The menu auto-disables after 5 minutes.
- **Permission Checks:** Commands enforce user, bot, owner-only, and admin-only permissions.
- **Interaction Handler:** Manages slash command execution, including blacklist validation and consistent error handling.

### Data Persistence
A file-based JSON storage system with in-memory caching is used:
- Data is stored in JSON files within the `/data` directory (e.g., `admins.json`, `giveaways.json`, `blacklist.json`, `feedback.json`, `autoLine.json`, `invites.json`, `wheelRewards.json`, `inviteConfig.json`, `logsConfig.json`).
- Data is loaded into global variables on startup for quick access, and helper functions manage file I/O. This approach prioritizes simplicity and avoids external database dependencies.

### Permission System
A three-tier hierarchy governs bot access and functionality:
1.  **Owner Level:** A hardcoded Discord user ID with full bot control.
2.  **Admin Level:** A managed list of users stored in `admins.json`.
3.  **Server Level:** Utilizes standard Discord permission flags (e.g., `ManageGuild`, `BanMembers`).
- **Role-Based Access Control**: All bot commands require users to have the "marka giv" role, except for the bot owner.

### Giveaway System
An event-driven system with reaction-based entry:
- Giveaways are stored with metadata (prize, duration, winner count).
- Reaction (🎉) for entry, with random winner selection.
- Supports early ending and automatic winner announcements.

### Wheel & Points System
Interactive reward system with private ticket support:
- Users earn points through invites or admin allocation.
- Points tracked in `invites.json` per-guild, per-user.
- **Wheel Ticket**: When users run `$wheelticket`, the bot creates a private thread (ticket) where the wheel is spun.
- The wheel randomly selects a reward from `wheelRewards.json` and displays it in the private thread.
- Tickets automatically archive after 10 seconds for cleanup.
- **Points Management**: Admins can add points to users via `$addpoints` command.
- **Reward Management**: Admins configure the reward pool with `$addreward`, `$removereward`, and `$listrewards`.

### Greeting System
Event-based customizable welcome messages:
- Per-guild configuration stored in `greetings.json`.
- Supports template variables and optional auto-deletion.

### Welcome System
Advanced image-based welcome system with avatar overlay:
- Per-guild configuration stored in `welcome.json`.
- **Custom Welcome Images**: Admins can set a background image URL where new member avatars appear in a circular area.
- **Avatar Positioning**: Configurable X/Y coordinates and radius for the avatar circle overlay (default: center at 512x250 with 100px radius on 1024x500 canvas).
- **Welcome Messages**: Customizable text messages with template variables: `{user}` (mention), `{username}`, `{server}`, `{membercount}`, `{inviter}`.
- **Canvas Integration**: Uses the canvas library to composite welcome images with user avatars in real-time.
- **Commands**: `setwelcomechannel`, `setwelcomeimage`, `setwelcomemessage`, `togglewelcome`, `testwelcome` (both prefix and slash versions).
- **Testing**: `testwelcome` command allows admins to preview the welcome setup before enabling it.

### Blacklist System
Global ban lists for users and servers, managed via owner commands, preventing bot usage and operation in specified entities.

### Command Disabling System
Provides granular control for owners to disable/re-enable specific commands per server, stored in `disabledCommands.json`. This works for both prefix and slash commands.

### Feedback System
Event-driven automatic message transformation:
- Configurable channels where user messages are converted into rich embeds with author info and custom reaction emojis.
- Supports image attachments and automatically exempts bot commands from transformation.

### Auto-Line System
Event-driven automatic message responses:
- Configurable channels where a specified image or GIF URL is automatically sent after any user message.
- Provides visual engagement or branding in specific channels.

### Logging System
Comprehensive event logging with customizable log channels:
- **Per-guild configuration** stored in `logsConfig.json` with separate channels for each log type.
- **Eight log types**: Member Join/Leave, Message Edit/Delete, Role Changes, Channel Changes, Moderation Actions (Ban/Unban), Voice State Changes, Nickname Changes, and Server Updates.
- **Interactive configuration**: Administrators use `$setlog #channel` or `/setlog #channel` to open a dropdown menu and select which events to log.
- **Flexible setup**: Set one channel for all logs or different channels for each log type.
- **Rich embeds**: All logs are sent as detailed embeds with relevant information (user, timestamp, before/after values, etc.).
- **Commands**: `setlog` (configure), `viewlogs` (view current settings), `disablelog` (disable specific log types).
- **Event listeners**: Automatically log events when they occur, with proper error handling and null checks.

### Web Dashboard (Flask Integration)
A comprehensive Flask-based management dashboard with Discord OAuth2 authentication:
- **Authentication**: Secure Discord OAuth2 login with CSRF protection and server-side token storage
- **Access Control**: Only admins in servers where the bot is present can access
- **Pages**: Home (stats), Commands (enable/disable per server), Moderation (settings), Servers (management), User Profile
- **API Endpoints**: RESTful API for managing bot settings, commands, and server configurations
- **Security**: Server-side bearer token storage, OAuth state validation, comprehensive error handling
- **Integration**: Runs alongside the bot using a process supervisor (`launcher.js`)
- **Design**: Modern, responsive UI inspired by ProBot with Discord theming

The dashboard shares the bot's JSON data files for seamless synchronization and runs on port 5000.

## Recent Changes

### Welcome System (November 14, 2025)
- Implemented advanced welcome system with custom image backgrounds and avatar overlays
- Added canvas library for real-time image composition
- Created `setwelcomechannel` command to set welcome channel
- Created `setwelcomeimage` command to configure background image and avatar position
- Created `setwelcomemessage` command to set customizable welcome text with variables
- Created `togglewelcome` command to enable/disable the system
- Created `testwelcome` command to preview welcome configuration
- Support for template variables: `{user}`, `{username}`, `{server}`, `{membercount}`, `{inviter}`
- Avatar appears in a circular area with white border at configurable position
- Installed libuuid system dependency for canvas support

### Dashboard Integration (November 14, 2025)
- Created full-featured Flask dashboard with Discord OAuth2 authentication
- Implemented server-side token storage for enhanced security
- Added command management (enable/disable per server)
- Added moderation settings management (greetings, auto-line, feedback)
- Added server management with channel and role viewing
- Created modern responsive UI with Discord-themed design
- Integrated launcher to run bot and dashboard simultaneously
- Added comprehensive setup documentation (DASHBOARD_SETUP.md)

### Wheel Ticket System Enhancement (November 8, 2025)
- Updated `$wheelticket` and `/wheelticket` to create private threads instead of replying in the same channel.
- Added visual feedback with a spinning animation (2-second delay before revealing the reward).
- Tickets automatically archive after 10 seconds for better channel organization.
- Created `$addpoints` and `/addpoints` commands for admins to manage user points.
- Updated help menus to include the new addpoints command.

### Channel Control Enhancement (November 8, 2025)
- Updated `$hide` and `/hide` to also disable @everyone mention permissions when hiding a channel.
- Updated `$show` and `/show` to enable @everyone mention permissions when showing a channel.
- Improved user feedback messages to reflect both permission changes.

### Logging System (November 14, 2025)
- Implemented comprehensive logging system with 8 different log types
- Created `$setlog` and `/setlog` commands with interactive dropdown menu for log type selection
- Created `$viewlogs` and `/viewlogs` commands to view all configured log channels
- Created `$disablelog` and `/disablelog` commands to disable specific log types
- Added event listeners for all log types: member join/leave, message edit/delete, role changes, channel changes, bans/unbans, voice state changes, nickname changes, and server updates
- Added required Discord intents: GuildModeration and GuildVoiceStates
- Log configuration stored in `logsConfig.json` with per-guild settings
- All logs sent as rich embeds with relevant contextual information
- Supports setting one channel for all logs or different channels for each type

## External Dependencies

### Discord API
-   **discord.js v14.14.1**: The primary Discord API wrapper.
-   **Gateway Intents**: Guilds, GuildMessages, MessageContent, GuildMembers, GuildMessageReactions.
-   **Permissions**: Utilizes various Discord permission flags.

### Runtime & Utilities
-   **Node.js**: JavaScript runtime environment.
-   **dotenv**: For managing environment variables (e.g., Discord token).
-   **express**: Used for the minimal HTTP server for the web dashboard and API endpoints.
-   **canvas**: Image manipulation library for generating welcome images with avatar overlays.

### System Dependencies
-   **libuuid**: Required system library for canvas package functionality.

### File System
-   **fs**: Node.js native module for JSON file persistence.
-   **path**: Node.js native module for resolving file paths.

### Storage
-   **Data Directory (`/data`):** Stores all bot configurations and persistent data in JSON files, including `admins.json`, `blacklist.json`, `giveaways.json`, `greetings.json`, `welcome.json`, `disabledCommands.json`, `invites.json`, `wheelRewards.json`, `inviteConfig.json`, `autoLine.json`, and `feedback.json`.
-   **Commands Directories (`/commands`, `/slash-commands`):** Contain modules for prefix and slash commands, respectively.