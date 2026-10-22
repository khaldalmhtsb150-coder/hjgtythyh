const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'show',
  description: 'Show a channel to @everyone',
  permissions: PermissionFlagsBits.ManageChannels,
  botPermissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args, client) {
    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: true,
        MentionEveryone: true
      });

      message.reply(`${channel} تم اظهار الروم`);
    } catch (error) {
      console.error('Error showing channel:', error);
      message.reply('❌ Failed to show the channel. Make sure I have the proper permissions.');
    }
  }
};
