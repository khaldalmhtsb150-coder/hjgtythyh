const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getGiveawayReaction, createGiveawayEmbed } = require('../utils/giveawayEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gend')
    .setDescription('End a giveaway early')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The message ID of the giveaway')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    
    const giveawayIndex = global.giveaways.findIndex(g => g.messageId === messageId && !g.ended);
    
    if (giveawayIndex === -1) {
      return interaction.reply({ 
        content: '❌ No active giveaway found with that message ID.', 
        ephemeral: true 
      });
    }

    const giveaway = global.giveaways[giveawayIndex];

    try {
      const channel = await client.channels.fetch(giveaway.channelId);
      const msg = await channel.messages.fetch(giveaway.messageId);
      const hostUser = await client.users.fetch(giveaway.hostId).catch(() => null);
      const reaction = getGiveawayReaction(msg);
      
      if (!reaction) {
        return interaction.reply({ 
          content: '❌ No one entered the giveaway.', 
          ephemeral: true 
        });
      }

      const users = await reaction.users.fetch();
      const entries = users.filter(user => !user.bot);

      if (entries.size === 0) {
        return interaction.reply({ 
          content: '❌ No valid entries for the giveaway.', 
          ephemeral: true 
        });
      }

      const winners = [];
      const entriesArray = Array.from(entries.values());
      
      for (let i = 0; i < Math.min(giveaway.winnersCount, entriesArray.length); i++) {
        const randomIndex = Math.floor(Math.random() * entriesArray.length);
        winners.push(entriesArray[randomIndex]);
        entriesArray.splice(randomIndex, 1);
      }

      const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');
      
      const winEmbed = createGiveawayEmbed({
        guild: msg.guild,
        prize: giveaway.prize,
        hostId: giveaway.hostId,
        hostName: giveaway.hostName || hostUser?.username,
        hostAvatarURL: giveaway.hostAvatarURL || hostUser?.displayAvatarURL({ size: 64 }),
        endTime: giveaway.endTime,
        winners: winnerMentions,
        ended: true
      });

      await msg.edit({ embeds: [winEmbed] });
      await msg.reply({
        content: `<:emoji_7:1557336606006976512> Congratulations ! ${winnerMentions} You won **${giveaway.prize}**!`,
        allowedMentions: { repliedUser: false }
      });

      global.giveaways[giveawayIndex].ended = true;
      global.giveaways[giveawayIndex].winners = winners.map(w => w.id);
      global.saveGiveaways();

      await interaction.reply({ 
        content: '✅ Giveaway ended successfully!', 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error ending giveaway:', error);
      await interaction.reply({ 
        content: '❌ Failed to end the giveaway.', 
        ephemeral: true 
      });
    }
  }
};
