const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hide')
    .setDescription('Hide a channel from @everyone')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to hide (defaults to current channel)')
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
        ViewChannel: false
      });
      
      await interaction.reply({ 
        content: `✅ Channel ${channel} has been hidden from @everyone.` 
      });
    } catch (error) {
      console.error('Error hiding channel:', error);
      await interaction.reply({ 
        content: '❌ Failed to hide the channel.', 
        ephemeral: true 
      });
    }
  }
};
