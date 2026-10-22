const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setgreet',
  description: 'تعيين قناة ورسالة الترحيب',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const channelMention = args[0];
    const greetMessage = args.slice(1).join(' ');

    if (!channelMention || !greetMessage) {
      return message.reply('❌ الاستخدام: `$setgreet <#القناة> <الرسالة>`\n**المتغيرات:** `{user}` `{username}` `{server}`\nمثال: `$setgreet #welcome أهلاً {user} في {server}!`');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ الرجاء منشن قناة صحيحة.');
    }

    const guildId = message.guild.id;
    
    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {
        enabled: false,
        channelId: null,
        message: '',
        duration: 0
      };
    }

    global.greetings[guildId].channelId = channel.id;
    global.greetings[guildId].message = greetMessage;
    global.saveGreetings();

    message.reply(`✅ تم تعيين رسالة الترحيب لـ ${channel}!\n**الرسالة:** ${greetMessage}`);
  }
};
