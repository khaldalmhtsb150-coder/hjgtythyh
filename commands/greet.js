const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'greet',
  description: 'تفعيل أو تعطيل نظام الترحيب',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off'].includes(action)) {
      return message.reply('❌ الاستخدام: `$greet <on|off>`');
    }

    const guildId = message.guild.id;
    
    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {
        enabled: false,
        channelId: null,
        message: 'أهلاً {user} في {server}!',
        duration: 0
      };
    }

    global.greetings[guildId].enabled = action === 'on';
    global.saveGreetings();

    if (action === 'on') {
      if (!global.greetings[guildId].channelId) {
        return message.reply('✅ تم تفعيل نظام الترحيب! استخدم `$setgreet <القناة> <الرسالة>` لإعداده.');
      }
      message.reply('✅ تم تفعيل نظام الترحيب!');
    } else {
      message.reply('✅ تم تعطيل نظام الترحيب!');
    }
  }
};
