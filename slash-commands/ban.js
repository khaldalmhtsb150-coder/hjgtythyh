const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async executeSlash(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: '❌ I need the **Ban Members** permission to execute this command.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.guild.members.ban(user, { reason: `${reason} | Banned by ${interaction.user.tag}` });
      await interaction.reply({ 
        content: `✅ **${user.tag}** has been banned.\n**Reason:** ${reason}` 
      });
    } catch (error) {
      console.error('Error banning user:', error);
      await interaction.reply({ 
        content: '❌ Failed to ban the user. Make sure I have the proper permissions and that the user is in this server.', 
        ephemeral: true 
      });
    }
  }
};
