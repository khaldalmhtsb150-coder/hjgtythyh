const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('winners')
    .setDescription('View the winners of a giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The message ID of the giveaway')
        .setRequired(true)),

  async executeSlash(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    
    const giveaway = global.giveaways.find(g => g.messageId === messageId);
    
    if (!giveaway) {
      return interaction.reply({ 
        content: '❌ No giveaway found with that message ID.', 
        ephemeral: true 
      });
    }

    if (!giveaway.ended) {
      return interaction.reply({ 
        content: '❌ This giveaway has not ended yet.', 
        ephemeral: true 
      });
    }

    if (!giveaway.winners || giveaway.winners.length === 0) {
      return interaction.reply({ 
        content: '❌ No winners for this giveaway.', 
        ephemeral: true 
      });
    }

    const winnerMentions = giveaway.winners.map(w => `<@${w}>`).join('\n');
    
    const embed = new EmbedBuilder()
      .setTitle('🏆 Giveaway Winners')
      .setDescription(`**Prize:** ${giveaway.prize}\n\n**Winners:**\n${winnerMentions}`)
      .setColor('#FFD700')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
