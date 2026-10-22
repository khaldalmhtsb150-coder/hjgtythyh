const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setwelcomechannel',
  description: 'Set the channel for welcome messages',
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

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel. Example: `$setwelcomechannel #welcome`\n❌ الرجاء الإشارة إلى قناة. مثال: `$setwelcomechannel #welcome`');
    }

    global.welcome[guildId].channelId = channel.id;
    global.saveWelcome();

    message.reply(`✅ Welcome channel set to ${channel}!\n✅ تم تعيين قناة الترحيب إلى ${channel}!\n\nDon't forget to:\n1. Set a background image: \`$setwelcomeimage <url> [x] [y] [radius]\`\n2. Set a welcome message: \`$setwelcomemessage <message>\`\n3. Enable the system: \`$togglewelcome on\`\n\nلا تنسَ:\n1. تعيين صورة الخلفية: \`$setwelcomeimage <url> [x] [y] [radius]\`\n2. تعيين رسالة الترحيب: \`$setwelcomemessage <message>\`\n3. تفعيل النظام: \`$togglewelcome on\``);
  }
};
