const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'addfeedbackchannel',
  description: 'Add a channel to the feedback system',
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

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel. Example: `$addfeedbackchannel #feedback`\n❌ الرجاء الإشارة إلى قناة. مثال: `$addfeedbackchannel #feedback`');
    }

    if (global.feedback[guildId].channels.includes(channel.id)) {
      return message.reply('❌ This channel is already in the feedback list.\n❌ هذه القناة موجودة بالفعل في قائمة التعليقات.');
    }

    global.feedback[guildId].channels.push(channel.id);
    global.saveFeedback();

    message.reply(`✅ Channel ${channel} has been added to feedback!\n✅ تمت إضافة القناة ${channel} إلى نظام التعليقات!\n\nDon't forget to set emojis with \`$setfeedbackemojis\` and enable with \`$togglefeedback on\`\nلا تنسَ تعيين الرموز التعبيرية باستخدام \`$setfeedbackemojis\` والتفعيل باستخدام \`$togglefeedback on\``);
  }
};
