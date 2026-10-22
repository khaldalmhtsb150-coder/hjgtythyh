const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'addreply',
  description: 'Add a custom auto-reply trigger',
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ You need **Manage Server** permission to use this command.\n❌ تحتاج إلى صلاحية **إدارة السيرفر** لاستخدام هذا الأمر.');
    }

    const guildId = message.guild.id;
    
    if (args.length < 2) {
      return message.reply('❌ Usage: `$addreply <trigger> | <response>`\nExample: `$addreply hello | Hello! Welcome to our server!`\n\n❌ الاستخدام: `$addreply <الكلمة المفتاحية> | <الرد>`\nمثال: `$addreply مرحبا | أهلاً وسهلاً بك في سيرفرنا!`');
    }

    const fullText = args.join(' ');
    const parts = fullText.split('|').map(p => p.trim());
    
    if (parts.length !== 2) {
      return message.reply('❌ Please use the format: `$addreply <trigger> | <response>`\n❌ الرجاء استخدام الصيغة: `$addreply <الكلمة المفتاحية> | <الرد>`');
    }

    const [trigger, response] = parts;
    
    if (!trigger || !response) {
      return message.reply('❌ Both trigger and response must not be empty.\n❌ يجب ألا تكون الكلمة المفتاحية والرد فارغين.');
    }

    if (!global.customReplies[guildId]) {
      global.customReplies[guildId] = {
        enabled: true,
        replies: []
      };
    }

    const existingIndex = global.customReplies[guildId].replies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase());
    
    if (existingIndex !== -1) {
      global.customReplies[guildId].replies[existingIndex].response = response;
      global.saveCustomReplies();
      return message.reply(`✅ Updated existing reply!\n**Trigger:** ${trigger}\n**Response:** ${response}\n\n✅ تم تحديث الرد الموجود!`);
    }

    global.customReplies[guildId].replies.push({ trigger, response });
    global.saveCustomReplies();

    message.reply(`✅ Custom reply added successfully!\n**Trigger:** ${trigger}\n**Response:** ${response}\n\n✅ تمت إضافة الرد التلقائي بنجاح!\n\nUse \`$togglereply on\` to enable if disabled.\nاستخدم \`$togglereply on\` للتفعيل إذا كان معطلاً.`);
  }
};
