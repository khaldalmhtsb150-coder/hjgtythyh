const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async executeSlash(interaction, client) {
    const userId = interaction.options.getString('user_id');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: '❌ I need the **Ban Members** permission to execute this command.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.guild.members.unban(userId);
      await interaction.reply({ 
        content: `✅ User with ID **${userId}** has been unbanned.` 
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      await interaction.reply({ 
        content: '❌ Failed to unban the user. Make sure the ID is correct and the user is banned.', 
        ephemeral: true 
      });
    }
  }
};
