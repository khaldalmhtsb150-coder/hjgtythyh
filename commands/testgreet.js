const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'testgreet',
  description: 'اختبار رسالة الترحيب',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    const greetConfig = global.greetings[guildId];

    if (!greetConfig || !greetConfig.channelId || !greetConfig.message) {
      return message.reply('❌ نظام الترحيب غير مُعد. استخدم `$setgreet` أولاً.');
    }

    try {
      const channel = message.guild.channels.cache.get(greetConfig.channelId);
      if (!channel) {
        return message.reply('❌ لم يتم العثور على قناة الترحيب.');
      }

      const testMessage = greetConfig.message
        .replace('{user}', `<@${message.author.id}>`)
        .replace('{username}', message.author.username)
        .replace('{server}', message.guild.name);

      const sentMessage = await channel.send(testMessage);
      message.reply('✅ تم إرسال رسالة ترحيب تجريبية!');

      if (greetConfig.duration && greetConfig.duration > 0) {
        setTimeout(() => {
          sentMessage.delete().catch(console.error);
        }, greetConfig.duration * 1000);
      }
    } catch (error) {
      console.error('Error testing greeting:', error);
      message.reply('❌ خطأ في إرسال رسالة الترحيب التجريبية.');
    }
  }
};
