const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setjaillog',
  description: 'تعيين قناة سجل السجن - Set the jail log channel',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) {
      return message.reply('❌ الاستخدام: `$setjaillog #القناة`\n❌ Usage: `$setjaillog #channel`');
    }

    const guildId = message.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailLogId = channel.id;
    global.saveJailConfig();

    message.reply(`✅ تم تعيين قناة سجل السجن إلى ${channel}\n✅ Jail log channel set to ${channel}\n\nسيتم إرسال سجلات السجن والإفراج إلى هذه القناة.\nJail and release logs will be sent to this channel.`);
  }
};
