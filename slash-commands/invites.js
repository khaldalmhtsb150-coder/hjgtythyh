const { SlashCommandBuilder } = require('discord.js');
const { buildInviteProfileEmbed } = require('../utils/inviteProfile');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('عرض سجل دعوات العضو والأعضاء الذين دعاهم')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('العضو المراد عرض سجل دعواته')
        .setRequired(false)),

  async executeSlash(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ هذا الأمر يعمل داخل السيرفر فقط.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user') || interaction.user;

    await interaction.reply({ embeds: [buildInviteProfileEmbed(interaction.guild.id, targetUser)] });
  }
};
