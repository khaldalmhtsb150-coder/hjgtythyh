const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removereward')
    .setDescription('Remove a wheel reward by index')
    .addIntegerOption(option =>
      option.setName('index')
        .setDescription('The index of the reward to remove (use /listrewards to see indexes)')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const index = interaction.options.getInteger('index') - 1;

    if (!global.wheelRewards[interaction.guild.id] || global.wheelRewards[interaction.guild.id].length === 0) {
      return interaction.reply({ 
        content: '❌ No rewards configured. Use `/addreward` to add rewards.', 
        ephemeral: true 
      });
    }

    if (index < 0 || index >= global.wheelRewards[interaction.guild.id].length) {
      return interaction.reply({ 
        content: `❌ Invalid index. Use \`/listrewards\` to see all rewards.`, 
        ephemeral: true 
      });
    }

    const removed = global.wheelRewards[interaction.guild.id].splice(index, 1)[0];
    global.saveWheelRewards();

    await interaction.reply(`✅ Removed reward: **${removed}**`);
  }
};
