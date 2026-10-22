const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'addpoints',
  description: 'إضافة نقاط لمستخدم',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser) {
      return message.reply('❌ قم بمنشن مستخدم.\nالاستخدام: `$addpoints @user <العدد>`');
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply('❌ الرجاء إدخال رقم صحيح موجب.\nالاستخدام: `$addpoints @user <العدد>`');
    }

    const guildId = message.guild.id;
    const userId = targetUser.id;

    if (!global.invites[guildId]) {
      global.invites[guildId] = {};
    }

    if (!global.invites[guildId][userId]) {
      global.invites[guildId][userId] = { points: 0, invites: [] };
    }

    global.invites[guildId][userId].points += amount;
    global.saveInvites();

    message.reply(`✅ تمت إضافة **${amount}** نقطة لـ ${targetUser}.\n⭐ الرصيد الجديد: ${global.invites[guildId][userId].points} نقطة`);
  }
};
