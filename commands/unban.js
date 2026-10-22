const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'فك حظر مستخدم من السيرفر',
  permissions: PermissionFlagsBits.BanMembers,
  botPermissions: PermissionFlagsBits.BanMembers,
  async execute(message, args, client) {
    const userId = args[0];

    if (!userId) {
      return message.reply('❌ الاستخدام: `$unban <user_id>`');
    }

    try {
      await message.guild.members.unban(userId);
      message.reply(`✅ تم فك حظر المستخدم ذو الـ ID ${userId}.`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      message.reply('❌ فشل فك حظر المستخدم. تأكد من صحة الـ ID وأن المستخدم محظور.');
    }
  }
};
