const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setinvitelog',
  description: 'تعيين قناة سجل الدعوات',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel?.isTextBased()) {
      return message.reply('❌ اختر قناة نصية.\nالاستخدام: `$setinvitelog #القناة`');
    }

    const botPermissions = channel.permissionsFor(message.guild.members.me);
    if (!botPermissions?.has(PermissionFlagsBits.SendMessages)) {
      return message.reply('❌ لا أملك صلاحية إرسال الرسائل في هذه القناة.');
    }

    if (!global.inviteConfig[message.guild.id]) {
      global.inviteConfig[message.guild.id] = {};
    }

    global.inviteConfig[message.guild.id].logChannelId = channel.id;
    global.saveInviteConfig();

    const canReadInvites = message.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild);
    const permissionWarning = canReadInvites
      ? ''
      : '\n⚠️ لا أملك صلاحية **إدارة السيرفر**؛ ستظهر أحداث الدخول والخروج، لكن قد يظهر الداعي «غير معروف».';
    return message.reply(`✅ تم تعيين قناة سجل الدخول والخروج والدعوات إلى <#${channel.id}>.\nستظهر فيها رسائل عربية قصيرة عند دخول الأعضاء أو مغادرتهم.${permissionWarning}`);
  }
};
