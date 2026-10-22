const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addreward')
    .setDescription('Add a wheel reward')
    .addStringOption(option =>
      option.setName('reward')
        .setDescription('The reward description')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const reward = interaction.options.getString('reward');

    if (!global.wheelRewards[interaction.guild.id]) {
      global.wheelRewards[interaction.guild.id] = [];
    }

    global.wheelRewards[interaction.guild.id].push(reward);
    global.saveWheelRewards();

    await interaction.reply(`✅ Added reward: **${reward}**\nTotal rewards: ${global.wheelRewards[interaction.guild.id].length}`);
  }
};
