const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'removelinechannel',
  description: 'Remove a channel from the auto-line feature',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.autoLine[guildId] || !global.autoLine[guildId].channels.length) {
      return message.reply('❌ No channels are configured for auto-line.\n❌ لا توجد قنوات مكونة للخط التلقائي.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel. Example: `$removelinechannel #general`\n❌ الرجاء الإشارة إلى قناة. مثال: `$removelinechannel #general`');
    }

    const index = global.autoLine[guildId].channels.indexOf(channel.id);
    if (index === -1) {
      return message.reply('❌ This channel is not in the auto-line list.\n❌ هذه القناة ليست في قائمة الخط التلقائي.');
    }

    global.autoLine[guildId].channels.splice(index, 1);
    global.saveAutoLine();

    message.reply(`✅ Channel ${channel} has been removed from auto-line.\n✅ تمت إزالة القناة ${channel} من الخط التلقائي.`);
  }
};
