const { EmbedBuilder } = require('discord.js');
const {
  DEFAULT_PRIMARY_EMBED_COLOR,
  getPrimaryEmbedColor,
  darkenEmbedColor
} = require('./primaryEmbedColor');

const GIVEAWAY_JOIN_EMOJI_ID = '1562524191767658606';
const LEGACY_GIVEAWAY_EMOJI_IDS = [
  '1557336606006976512',
  '1557325564854140939',
  '1436089797654351904'
];

function getGiveawayReaction(message) {
  return [
    GIVEAWAY_JOIN_EMOJI_ID,
    ...LEGACY_GIVEAWAY_EMOJI_IDS,
    '🎉'
  ]
    .map(emoji => message.reactions.cache.get(emoji))
    .find(Boolean);
}

function createGiveawayEmbed({
  guild,
  prize,
  hostId,
  hostName,
  hostAvatarURL,
  endTime,
  winners,
  ended = false
}) {
  const description = [
    `<:emoji_2:1562517978245898434> Hosted By <@${hostId}>`,
    Number.isFinite(endTime)
      ? `<:emoji_1:1562517933417042040> Ends: <t:${Math.floor(endTime / 1000)}:R>`
      : null,
    `<:emoji_5:1562524240425787422> Winners: ${winners}`
  ].filter(Boolean).join('\n');

  const author = { name: prize };
  const guildIcon = guild?.iconURL({ size: 128 });
  if (guildIcon) {
    author.iconURL = guildIcon;
  }

  const primaryColor = getPrimaryEmbedColor();
  const endedColor = primaryColor === DEFAULT_PRIMARY_EMBED_COLOR
    ? '#6037DB'
    : darkenEmbedColor(primaryColor);

  const embed = new EmbedBuilder()
    .setAuthor(author)
    .setDescription(description)
    .setColor(ended ? endedColor : primaryColor)
    .setTimestamp();

  if (hostName) {
    const footer = { text: hostName };
    if (hostAvatarURL) {
      footer.iconURL = hostAvatarURL;
    }
    embed.setFooter(footer);
  }

  return embed;
}

module.exports = {
  GIVEAWAY_JOIN_EMOJI_ID,
  getGiveawayReaction,
  createGiveawayEmbed
};
