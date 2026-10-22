const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'togglereply',
  description: 'Enable or disable custom auto-reply system',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ You need **Manage Server** permission to use this command.\n❌ تحتاج إلى صلاحية **إدارة السيرفر** لاستخدام هذا الأمر.');
    }

    const guildId = message.guild.id;
    
    if (!global.customReplies[guildId]) {
      global.customReplies[guildId] = {
        enabled: false,
        replies: []
      };
    }

    if (global.customReplies[guildId].replies.length === 0) {
      return message.reply('❌ Please add at least one custom reply using `$addreply <trigger> | <response>`\n❌ الرجاء إضافة رد تلقائي واحد على الأقل باستخدام `$addreply <الكلمة المفتاحية> | <الرد>`');
    }

    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      global.customReplies[guildId].enabled = true;
      global.saveCustomReplies();
      return message.reply('✅ Custom auto-reply system has been **enabled**!\n✅ تم **تفعيل** نظام الردود التلقائية!');
    } else if (action === 'off' || action === 'disable') {
      global.customReplies[guildId].enabled = false;
      global.saveCustomReplies();
      return message.reply('✅ Custom auto-reply system has been **disabled**.\n✅ تم **تعطيل** نظام الردود التلقائية.');
    } else {
      global.customReplies[guildId].enabled = !global.customReplies[guildId].enabled;
      global.saveCustomReplies();
      const status = global.customReplies[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return message.reply(`✅ Custom auto-reply system is now **${status}**`);
    }
  }
};
