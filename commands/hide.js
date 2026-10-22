const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'hide',
  description: 'Hide a channel from @everyone',
  permissions: PermissionFlagsBits.ManageChannels,
  botPermissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: false,
        MentionEveryone: false
      });

      message.reply(`${channel} تم إخفاء الروم`);
    } catch (error) {
      console.error('Error hiding channel:', error);
      message.reply('❌ Failed to hide the channel. Make sure I have the proper permissions.');
    }
  }
};
