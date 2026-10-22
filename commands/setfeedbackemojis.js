const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setfeedbackemojis',
  description: 'Set emojis to add as reactions to feedback messages',
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

    if (args.length === 0) {
      return message.reply('❌ Please provide emojis separated by spaces.\n❌ الرجاء تقديم الرموز التعبيرية مفصولة بمسافات.\n\n**Example | مثال:** `$setfeedbackemojis 👍 👎 ❤️`');
    }

    const emojis = args.filter(arg => arg.trim());
    
    if (emojis.length === 0) {
      return message.reply('❌ Please provide at least one valid emoji.\n❌ الرجاء تقديم رمز تعبيري واحد صالح على الأقل.');
    }

    global.feedback[guildId].emojis = emojis;
    global.saveFeedback();

    const emojiList = emojis.join(' ');
    message.reply(`✅ Feedback emojis have been set!\n✅ تم تعيين الرموز التعبيرية للتعليقات!\n\n**Emojis | الرموز:** ${emojiList}`);
  }
};
