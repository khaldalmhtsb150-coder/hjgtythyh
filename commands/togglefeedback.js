const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'togglefeedback',
  description: 'Enable or disable the feedback system',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.feedback[guildId]) {
      global.feedback[guildId] = {
        enabled: false,
        emojis: [],
        channels: []
      };
    }

    if (global.feedback[guildId].channels.length === 0) {
      return message.reply('❌ Please add at least one channel using `$addfeedbackchannel #channel`\n❌ الرجاء إضافة قناة واحدة على الأقل باستخدام `$addfeedbackchannel #channel`');
    }

    if (global.feedback[guildId].emojis.length === 0) {
      return message.reply('❌ Please set emojis using `$setfeedbackemojis 👍 👎 ❤️`\n❌ الرجاء تعيين الرموز التعبيرية باستخدام `$setfeedbackemojis 👍 👎 ❤️`');
    }

    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      global.feedback[guildId].enabled = true;
      global.saveFeedback();
      return message.reply('✅ Feedback system has been **enabled**!\n✅ تم **تفعيل** نظام التعليقات!');
    } else if (action === 'off' || action === 'disable') {
      global.feedback[guildId].enabled = false;
      global.saveFeedback();
      return message.reply('✅ Feedback system has been **disabled**.\n✅ تم **تعطيل** نظام التعليقات.');
    } else {
      global.feedback[guildId].enabled = !global.feedback[guildId].enabled;
      global.saveFeedback();
      const status = global.feedback[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return message.reply(`✅ Feedback system is now **${status}**`);
    }
  }
};
