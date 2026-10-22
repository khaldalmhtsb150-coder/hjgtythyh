const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'greetduration',
  description: 'تعيين مدة بقاء رسائل الترحيب (بالثواني)',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const duration = parseInt(args[0]);

    if (isNaN(duration) || duration < 0) {
      return message.reply('❌ الاستخدام: `$greetduration <الثواني>`\nضع 0 لإبقاء الرسائل دائماً.\nمثال: `$greetduration 30`');
    }

    const guildId = message.guild.id;
    
    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {
        enabled: false,
        channelId: null,
        message: 'أهلاً {user} في {server}!',
        duration: 0
      };
    }

    global.greetings[guildId].duration = duration;
    global.saveGreetings();

    if (duration === 0) {
      message.reply('✅ سيتم الإبقاء على رسائل الترحيب دائماً.');
    } else {
      message.reply(`✅ سيتم حذف رسائل الترحيب بعد ${duration} ثانية.`);
    }
  }
};
