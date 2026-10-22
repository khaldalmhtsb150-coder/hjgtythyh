const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'كتم مستخدم',
  permissions: PermissionFlagsBits.ModerateMembers,
  botPermissions: PermissionFlagsBits.ModerateMembers,
  async execute(message, args, client) {
    const user = message.mentions.users.first();
    const duration = args[1];
    const reason = args.slice(2).join(' ') || 'لم يتم توفير سبب';

    if (!user || !duration) {
      return message.reply('❌ الاستخدام: `$mute <@user> <المدة> [السبب]`\nصيغة المدة: 10s, 5m, 2h, 1d\nمثال: `$mute @user 10m سبام`');
    }

    const timeMatch = duration.match(/^(\d+)([smhd])$/);
    if (!timeMatch) {
      return message.reply('❌ صيغة المدة غير صحيحة. استخدم: 10s, 5m, 2h, أو 1d');
    }

    const timeValue = parseInt(timeMatch[1]);
    const timeUnit = timeMatch[2];
    const timeInMs = {
      's': timeValue * 1000,
      'm': timeValue * 60 * 1000,
      'h': timeValue * 60 * 60 * 1000,
      'd': timeValue * 24 * 60 * 60 * 1000
    }[timeUnit];

    if (timeInMs > 28 * 24 * 60 * 60 * 1000) {
      return message.reply('❌ مدة الكتم لا يمكن أن تتجاوز 28 يوماً.');
    }

    try {
      const member = message.guild.members.cache.get(user.id);
      
      if (!member) {
        return message.reply('❌ المستخدم غير موجود في هذا السيرفر.');
      }

      if (member.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply('❌ لا يمكنك كتم هذا المستخدم (تسلسل الرتب).');
      }

      if (!member.moderatable) {
        return message.reply('❌ لا يمكنني كتم هذا المستخدم. قد يكون لديه رتبة أعلى مني.');
      }

      await member.timeout(timeInMs, reason);
      message.reply(`✅ تم كتم ${user.tag} لمدة ${duration}.\n**السبب:** ${reason}`);
    } catch (error) {
      console.error('Error muting user:', error);
      message.reply('❌ فشل كتم المستخدم.');
    }
  }
};
