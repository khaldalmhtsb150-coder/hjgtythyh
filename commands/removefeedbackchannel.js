const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removefeedbackchannel',
  description: 'Remove a channel from the feedback system',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.feedback[guildId] || !global.feedback[guildId].channels.length) {
      return message.reply('❌ No channels are configured for feedback.\n❌ لا توجد قنوات مكونة للتعليقات.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel. Example: `$removefeedbackchannel #feedback`\n❌ الرجاء الإشارة إلى قناة. مثال: `$removefeedbackchannel #feedback`');
    }

    const index = global.feedback[guildId].channels.indexOf(channel.id);
    if (index === -1) {
      return message.reply('❌ This channel is not in the feedback list.\n❌ هذه القناة ليست في قائمة التعليقات.');
    }

    global.feedback[guildId].channels.splice(index, 1);
    global.saveFeedback();

    message.reply(`✅ Channel ${channel} has been removed from feedback.\n✅ تمت إزالة القناة ${channel} من نظام التعليقات.`);
  }
};
