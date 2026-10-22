const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete multiple messages from the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async executeSlash(interaction, client) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ 
        content: '❌ I need the **Manage Messages** permission to execute this command.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      const messages = await interaction.channel.bulkDelete(amount, true);
      
      await interaction.editReply({ 
        content: `✅ Successfully deleted **${messages.size}** message(s).` 
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      await interaction.editReply({ 
        content: '❌ Failed to delete messages. Note: Messages older than 14 days cannot be bulk deleted.' 
      });
    }
  }
};
