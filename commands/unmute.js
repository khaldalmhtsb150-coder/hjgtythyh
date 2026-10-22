const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'فك كتم مستخدم',
  permissions: PermissionFlagsBits.ModerateMembers,
  botPermissions: PermissionFlagsBits.ModerateMembers,
  async execute(message, args, client) {
    const user = message.mentions.users.first();

    if (!user) {
      return message.reply('❌ الاستخدام: `$unmute <@user>`');
    }

    try {
      const member = message.guild.members.cache.get(user.id);
      
      if (!member) {
        return message.reply('❌ المستخدم غير موجود في هذا السيرفر.');
      }

      if (!member.communicationDisabledUntil) {
        return message.reply('❌ هذا المستخدم غير مكتوم.');
      }

      await member.timeout(null);
      message.reply(`✅ تم فك كتم ${user.tag}.`);
    } catch (error) {
      console.error('Error unmuting user:', error);
      message.reply('❌ فشل فك كتم المستخدم.');
    }
  }
};
