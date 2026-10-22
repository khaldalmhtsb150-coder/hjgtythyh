const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
  GIVEAWAY_JOIN_EMOJI_ID,
  getGiveawayReaction,
  createGiveawayEmbed
} = require('../utils/giveawayEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gstart')
    .setDescription('Start a giveaway')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 10s, 5m, 2h, 1d)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
        .setMinValue(1))
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize for the giveaway')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const duration = interaction.options.getString('duration');
    const winnersCount = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');

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

    const endTime = Date.now() + timeInMs;
    const hostName = interaction.user.username;
    const hostAvatarURL = interaction.user.displayAvatarURL({ size: 64 });

    const embed = createGiveawayEmbed({
      guild: interaction.guild,
      prize,
      hostId: interaction.user.id,
      hostName,
      hostAvatarURL,
      endTime,
      winners: winnersCount
    });

    await interaction.reply({ content: '✅ Giveaway created!', ephemeral: true });
    const giveawayMessage = await interaction.channel.send({ embeds: [embed] });
    await giveawayMessage.react(GIVEAWAY_JOIN_EMOJI_ID);

    const giveaway = {
      messageId: giveawayMessage.id,
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
      prize: prize,
      winnersCount: winnersCount,
      endTime: endTime,
      hostId: interaction.user.id,
      hostName,
      hostAvatarURL,
      ended: false
    };

    global.giveaways.push(giveaway);
    global.saveGiveaways();

    setTimeout(async () => {
      try {
        const channel = await client.channels.fetch(giveaway.channelId);
        const msg = await channel.messages.fetch(giveaway.messageId);
        const reaction = getGiveawayReaction(msg);
        
        if (!reaction) {
          return channel.send('❌ No one entered the giveaway.');
        }

        const users = await reaction.users.fetch();
        const entries = users.filter(user => !user.bot);

        if (entries.size === 0) {
          return channel.send('❌ No valid entries for the giveaway.');
        }

        const winners = [];
        const entriesArray = Array.from(entries.values());
        
        for (let i = 0; i < Math.min(winnersCount, entriesArray.length); i++) {
          const randomIndex = Math.floor(Math.random() * entriesArray.length);
          winners.push(entriesArray[randomIndex]);
          entriesArray.splice(randomIndex, 1);
        }

        const winnerMentions = winners.map(w => `<@${w.id}>`).join(', ');
        
        const winEmbed = createGiveawayEmbed({
          guild: msg.guild,
          prize: giveaway.prize,
          hostId: giveaway.hostId,
          hostName: giveaway.hostName,
          hostAvatarURL: giveaway.hostAvatarURL,
          endTime: giveaway.endTime,
          winners: winnerMentions,
          ended: true
        });

        await msg.edit({ embeds: [winEmbed] });
        await msg.reply({
          content: `<:emoji_7:1557336606006976512> Congratulations ! ${winnerMentions} You won **${giveaway.prize}**!`,
          allowedMentions: { repliedUser: false }
        });

        const index = global.giveaways.findIndex(g => g.messageId === giveaway.messageId);
        if (index !== -1) {
          global.giveaways[index].ended = true;
          global.giveaways[index].winners = winners.map(w => w.id);
          global.saveGiveaways();
        }
      } catch (error) {
        console.error('Error ending giveaway:', error);
      }
    }, timeInMs);
  }
};
