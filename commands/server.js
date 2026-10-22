const { EmbedBuilder, ChannelType } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];
const CONTENT_FILTER_LEVELS = ['Disabled', 'Members without roles', 'All members'];
const BOOST_LEVELS = ['No level', 'Level 1', 'Level 2', 'Level 3'];

function fitField(value, maxLength = 1000) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

module.exports = {
  name: 'server',
  description: 'عرض معلومات السيرفر الحالي',
  async execute(message) {
    const guild = message.guild;
    if (!guild) {
      return message.reply('❌ استخدم هذا الأمر داخل سيرفر.');
    }

    const channels = [...guild.channels.cache.values()];
    const countChannels = (...types) => channels.filter(channel => types.includes(channel.type)).length;
    const roles = [...guild.roles.cache.values()]
      .filter(role => role.id !== guild.id)
      .sort((a, b) => b.position - a.position);
    const topRoles = roles.slice(0, 15)
      .map(role => `• ${role.name.replaceAll('`', 'ˋ')}`)
      .join('\n');
    const remainingRoles = roles.length - 15;
    const roleList = topRoles || 'No custom roles';
    const roleValue = fitField(
      `${roleList}${remainingRoles > 0 ? `\n...and ${remainingRoles} more` : ''}`
    );
    const features = guild.features.length
      ? guild.features
        .map(feature => feature.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()))
        .join(', ')
      : 'None';
    const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
    const iconURL = guild.iconURL({ size: 512 });
    const bannerURL = guild.bannerURL({ size: 1024 });
    const description = guild.description
      ? `معلومات السيرفر\n\n${fitField(guild.description, 3800)}`
      : 'معلومات السيرفر';

    const embed = new EmbedBuilder()
      .setColor(getPrimaryEmbedColor())
      .setTitle(guild.name)
      .setDescription(description)
      .addFields(
        { name: 'Server ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        {
          name: 'Created',
          value: `<t:${createdTimestamp}:F>\n<t:${createdTimestamp}:R>`,
          inline: true
        },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        {
          name: 'Boosts',
          value: `${BOOST_LEVELS[guild.premiumTier] ?? 'Unknown'} · ${guild.premiumSubscriptionCount ?? 0}`,
          inline: true
        },
        { name: 'Custom Roles', value: `${roles.length}`, inline: true },
        {
          name: 'Channels',
          value: [
            `Text: ${countChannels(ChannelType.GuildText, ChannelType.GuildAnnouncement)}`,
            `Voice: ${countChannels(ChannelType.GuildVoice, ChannelType.GuildStageVoice)}`,
            `Categories: ${countChannels(ChannelType.GuildCategory)}`,
            `Forums: ${countChannels(ChannelType.GuildForum)}`
          ].join('\n'),
          inline: true
        },
        {
          name: 'Server Settings',
          value: [
            `Verification: ${VERIFICATION_LEVELS[guild.verificationLevel] ?? 'Unknown'}`,
            `Content filter: ${CONTENT_FILTER_LEVELS[guild.explicitContentFilter] ?? 'Unknown'}`,
            `2FA requirement: ${guild.mfaLevel === 1 ? 'Enabled' : 'Disabled'}`,
            `Locale: ${guild.preferredLocale || 'Unknown'}`,
            `Vanity URL: ${guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : 'Not set'}`
          ].join('\n'),
          inline: true
        },
        {
          name: 'Important Channels',
          value: [
            `System: ${guild.systemChannelId ? `<#${guild.systemChannelId}>` : 'Not set'}`,
            `Rules: ${guild.rulesChannelId ? `<#${guild.rulesChannelId}>` : 'Not set'}`,
            `Updates: ${guild.publicUpdatesChannelId ? `<#${guild.publicUpdatesChannelId}>` : 'Not set'}`,
            `AFK: ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : 'Not set'}`,
            `AFK timeout: ${guild.afkTimeout / 60} minutes`
          ].join('\n'),
          inline: true
        },
        {
          name: `Roles (${roles.length}; highest 15)`,
          value: roleValue,
          inline: false
        },
        {
          name: 'Server Features',
          value: fitField(features),
          inline: false
        },
        {
          name: 'Emojis & Stickers',
          value: `Emojis: ${guild.emojis.cache.size}\nStickers: ${guild.stickers.cache.size}`,
          inline: true
        }
      )
      .setTimestamp();

    if (iconURL) {
      embed.setThumbnail(iconURL);
    }
    if (bannerURL) {
      embed.setImage(bannerURL);
    }

    return message.reply({ embeds: [embed] });
  }
};
