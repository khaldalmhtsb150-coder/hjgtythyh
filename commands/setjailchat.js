const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setjailchat',
  description: 'تعيين قناة السجن - Set the jail chat channel',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) {
      return message.reply('❌ الاستخدام: `$setjailchat #القناة`\n❌ Usage: `$setjailchat #channel`');
    }

    const guildId = message.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailChatId = channel.id;
    global.saveJailConfig();

    message.reply(`✅ تم تعيين قناة السجن إلى ${channel}\n✅ Jail chat channel set to ${channel}\n\nالآن سيتمكن المسجونون فقط من رؤية هذه القناة.\nNow only jailed members will be able to see this channel.`);
  }
};
