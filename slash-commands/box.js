const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GIVEAWAY_JOIN_EMOJI_ID, createGiveawayEmbed } = require('../utils/giveawayEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('box')
    .setDescription('Start an instant giveaway - first to react wins')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('Prize for the giveaway')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const prize = interaction.options.getString('prize');
    const hostName = interaction.user.username;
    const hostAvatarURL = interaction.user.displayAvatarURL({ size: 64 });
    const endTime = Date.now() + 60000;

    const embed = createGiveawayEmbed({
      guild: interaction.guild,
      prize,
      hostId: interaction.user.id,
      hostName,
      hostAvatarURL,
      endTime,
      winners: 1
    });

    await interaction.reply({ content: '✅ Instant giveaway created!', ephemeral: true });
    const giveawayMessage = await interaction.channel.send({ embeds: [embed] });
    await giveawayMessage.react(GIVEAWAY_JOIN_EMOJI_ID);

    const filter = (reaction, user) => {
      return reaction.emoji.id === GIVEAWAY_JOIN_EMOJI_ID && !user.bot;
    };

    const collector = giveawayMessage.createReactionCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      const winEmbed = createGiveawayEmbed({
        guild: interaction.guild,
        prize,
        hostId: interaction.user.id,
        hostName,
        hostAvatarURL,
        endTime,
        winners: `<@${user.id}>`,
        ended: true
      });

      await giveawayMessage.edit({ embeds: [winEmbed] });
      await giveawayMessage.reply({
        content: `<:emoji_7:1557336606006976512> Congratulations ! <@${user.id}> You won **${prize}**!`,
        allowedMentions: { repliedUser: false }
      });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const noWinnerEmbed = new EmbedBuilder()
          .setTitle('<:emoji_7:1436089797654351904> GIVEAWAY ENDED <:emoji_7:1436089797654351904>')
          .setDescription(`**Prize:** ${prize}\n**Winner:** No one entered!`)
          .setColor('#FF0000')
          .setTimestamp();

        await giveawayMessage.edit({ embeds: [noWinnerEmbed] });
      }
    });
  }
};
