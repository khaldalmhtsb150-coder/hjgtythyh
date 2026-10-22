const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'togglewelcome',
  description: 'Enable or disable the welcome system',
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

    const action = args[0]?.toLowerCase();
    
    if (!action || (action !== 'on' && action !== 'off')) {
      return message.reply('❌ Usage: `$togglewelcome <on|off>`\n❌ الاستخدام: `$togglewelcome <on|off>`');
    }

    const enable = action === 'on';
    
    if (enable && !global.welcome[guildId].channelId) {
      return message.reply('❌ Please set a welcome channel first using `$setwelcomechannel #channel`\n❌ الرجاء تعيين قناة الترحيب أولاً باستخدام `$setwelcomechannel #قناة`');
    }

    global.welcome[guildId].enabled = enable;
    global.saveWelcome();

    if (enable) {
      message.reply('✅ Welcome system enabled!\n✅ تم تفعيل نظام الترحيب!\n\nNew members will now receive welcome messages.\nسيتلقى الأعضاء الجدد الآن رسائل الترحيب.');
    } else {
      message.reply('⚠️ Welcome system disabled.\n⚠️ تم تعطيل نظام الترحيب.');
    }
  }
};
