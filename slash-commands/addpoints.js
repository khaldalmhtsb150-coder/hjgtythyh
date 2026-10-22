const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpoints')
    .setDescription('Add points to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add points to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of points to add')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const guildId = interaction.guild.id;
    const userId = targetUser.id;

    if (!global.invites[guildId]) {
      global.invites[guildId] = {};
    }

    if (!global.invites[guildId][userId]) {
      global.invites[guildId][userId] = { points: 0, invites: [] };
    }

    global.invites[guildId][userId].points += amount;
    global.saveInvites();

    await interaction.reply(`✅ Added **${amount}** points to ${targetUser}.\n⭐ New balance: ${global.invites[guildId][userId].points} points`);
  }
};
