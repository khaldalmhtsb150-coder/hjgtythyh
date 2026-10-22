const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'مسح الرسائل في القناة',
  permissions: PermissionFlagsBits.ManageMessages,
  botPermissions: PermissionFlagsBits.ManageMessages,
  async execute(message, args, client) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ الاستخدام: `$clear <1-100>`\nمثال: `$clear 50`');
    }

    try {
      const messages = await message.channel.messages.fetch({ limit: amount + 1 });
      await message.channel.bulkDelete(messages, true);
      
      const reply = await message.channel.send(`✅ تم مسح ${amount} رسالة.`);
      setTimeout(() => reply.delete().catch(() => {}), 3000);
    } catch (error) {
      console.error('Error clearing messages:', error);
      message.reply('❌ فشل مسح الرسائل. يمكنني فقط حذف الرسائل الأحدث من 14 يوماً.');
    }
  }
};
