const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listrewards')
    .setDescription('List all wheel rewards'),

  async executeSlash(interaction, client) {
    const rewards = global.wheelRewards[interaction.guild.id];

    if (!rewards || rewards.length === 0) {
      return interaction.reply({ 
        content: '📭 No wheel rewards configured yet.\nUse `/addreward` to add rewards.', 
        ephemeral: true 
      });
    }

    const list = rewards.map((reward, index) => `${index + 1}. ${reward}`).join('\n');
    
    await interaction.reply(`🎁 **Wheel Rewards**\n\n${list}\n\nTotal: ${rewards.length} rewards`);
  }
};
