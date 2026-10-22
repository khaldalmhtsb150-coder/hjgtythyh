const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removereply',
  description: 'Remove a custom auto-reply trigger',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ You need **Manage Server** permission to use this command.\n❌ تحتاج إلى صلاحية **إدارة السيرفر** لاستخدام هذا الأمر.');
    }

    const guildId = message.guild.id;
    
    if (!global.customReplies[guildId] || !global.customReplies[guildId].replies.length) {
      return message.reply('❌ No custom replies configured for this server.\n❌ لا توجد ردود تلقائية مكونة لهذا السيرفر.');
    }

    if (args.length === 0) {
      return message.reply('❌ Please provide the trigger to remove.\nExample: `$removereply hello`\n\n❌ الرجاء تقديم الكلمة المفتاحية للحذف.\nمثال: `$removereply مرحبا`');
    }

    const trigger = args.join(' ');
    const index = global.customReplies[guildId].replies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase());

    if (index === -1) {
      return message.reply(`❌ Trigger "${trigger}" not found.\n❌ الكلمة المفتاحية "${trigger}" غير موجودة.\n\nUse \`$listreplies\` to see all triggers.\nاستخدم \`$listreplies\` لعرض جميع الكلمات المفتاحية.`);
    }

    const removed = global.customReplies[guildId].replies[index];
    global.customReplies[guildId].replies.splice(index, 1);
    global.saveCustomReplies();

    message.reply(`✅ Custom reply removed!\n**Trigger:** ${removed.trigger}\n**Response:** ${removed.response}\n\n✅ تم حذف الرد التلقائي!`);
  }
};
