const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async executeSlash(interaction, client) {
    const targetUser = interaction.options.getUser('user');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ 
        content: '❌ I need the **Timeout Members** permission to execute this command.', 
        ephemeral: true 
      });
    }

    try {
      const member = await interaction.guild.members.fetch(targetUser.id);
      await member.timeout(null, `Timeout removed by ${interaction.user.tag}`);
      
      await interaction.reply({ 
        content: `✅ **${targetUser.tag}** has been unmuted.` 
      });
    } catch (error) {
      console.error('Error removing timeout:', error);
      await interaction.reply({ 
        content: '❌ Failed to unmute the user.', 
        ephemeral: true 
      });
    }
  }
};
