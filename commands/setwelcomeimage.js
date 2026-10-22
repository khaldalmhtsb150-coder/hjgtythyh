const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setwelcomeimage',
  description: 'Set the background image and avatar position for welcome messages',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.welcome[guildId]) {
      global.welcome[guildId] = {
        enabled: false,
        channelId: null,
        imageUrl: null,
        avatarX: 512,
        avatarY: 250,
        avatarRadius: 100,
        message: null
      };
    }

    const imageUrl = args[0];
    if (!imageUrl) {
      return message.reply('❌ Usage: `$setwelcomeimage <image_url> [x] [y] [radius]`\n\nExample: `$setwelcomeimage https://example.com/welcome.png 512 250 100`\n\n**Parameters:**\n- `image_url`: URL of the background image (required)\n- `x`: X position of avatar circle center (default: 512)\n- `y`: Y position of avatar circle center (default: 250)\n- `radius`: Radius of avatar circle (default: 100)\n\n**Note:** Image size will be 1024x500 pixels');
    }

    const avatarX = parseInt(args[1]) ?? 512;
    const avatarY = parseInt(args[2]) ?? 250;
    const avatarRadius = parseInt(args[3]) ?? 100;

    global.welcome[guildId].imageUrl = imageUrl;
    global.welcome[guildId].avatarX = avatarX;
    global.welcome[guildId].avatarY = avatarY;
    global.welcome[guildId].avatarRadius = avatarRadius;
    global.saveWelcome();

    message.reply(`✅ Welcome image configured!\n✅ تم تكوين صورة الترحيب!\n\n**Image URL:** ${imageUrl}\n**Avatar Position:** (${avatarX}, ${avatarY})\n**Avatar Radius:** ${avatarRadius}px\n\nUse \`$testwelcome\` to preview the result!\nاستخدم \`$testwelcome\` لمعاينة النتيجة!`);
  }
};
