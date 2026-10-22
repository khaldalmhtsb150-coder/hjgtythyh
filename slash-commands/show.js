const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('Show a channel to @everyone')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to show (defaults to current channel)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ 
        content: '❌ I need the **Manage Channels** permission to execute this command.', 
        ephemeral: true 
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: true
      });
      
      await interaction.reply({ 
        content: `✅ Channel ${channel} is now visible to @everyone.` 
      });
    } catch (error) {
      console.error('Error showing channel:', error);
      await interaction.reply({ 
        content: '❌ Failed to show the channel.', 
        ephemeral: true 
      });
    }
  }
};
