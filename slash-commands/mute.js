const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user (prevent them from sending messages)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 10s, 5m, 2h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async executeSlash(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ 
        content: '❌ I need the **Timeout Members** permission to execute this command.', 
        ephemeral: true 
      });
    }

    const timeMatch = duration.match(/^(\d+)([smhd])$/);
    if (!timeMatch) {
      return interaction.reply({ 
        content: '❌ Invalid duration format. Use: 10s, 5m, 2h, or 1d', 
        ephemeral: true 
      });
    }

    const timeValue = parseInt(timeMatch[1]);
    const timeUnit = timeMatch[2];
    const timeInMs = {
      's': timeValue * 1000,
      'm': timeValue * 60 * 1000,
      'h': timeValue * 60 * 60 * 1000,
      'd': timeValue * 24 * 60 * 60 * 1000
    }[timeUnit];

    if (timeInMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ 
        content: '❌ Timeout duration cannot exceed 28 days.', 
        ephemeral: true 
      });
    }

    try {
      const member = await interaction.guild.members.fetch(targetUser.id);
      await member.timeout(timeInMs, `${reason} | Timed out by ${interaction.user.tag}`);
      
      await interaction.reply({ 
        content: `✅ **${targetUser.tag}** has been timed out for **${duration}**.\n**Reason:** ${reason}` 
      });
    } catch (error) {
      console.error('Error timing out user:', error);
      await interaction.reply({ 
        content: '❌ Failed to timeout the user. Make sure I have proper permissions and that my role is higher than the target user.', 
        ephemeral: true 
      });
    }
  }
};
