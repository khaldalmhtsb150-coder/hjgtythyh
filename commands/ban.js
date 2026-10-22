const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'حظر مستخدم من السيرفر',
  permissions: PermissionFlagsBits.BanMembers,
  botPermissions: PermissionFlagsBits.BanMembers,
  async execute(message, args, client) {
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'لم يتم توفير سبب';

    if (!user) {
      return message.reply('❌ الاستخدام: `$ban <@user> [السبب]`');
    }

    try {
      const member = message.guild.members.cache.get(user.id);
      
      if (member) {
        if (member.roles.highest.position >= message.member.roles.highest.position) {
          return message.reply('❌ لا يمكنك حظر هذا المستخدم (تسلسل الرتب).');
        }
        
        if (!member.bannable) {
          return message.reply('❌ لا يمكنني حظر هذا المستخدم. قد يكون لديه رتبة أعلى مني.');
        }
      }

      await message.guild.members.ban(user, { reason: reason });
      message.reply(`✅ تم حظر ${user.tag}.\n**السبب:** ${reason}`);
    } catch (error) {
      console.error('Error banning user:', error);
      message.reply('❌ فشل حظر المستخدم.');
    }
  }
};
