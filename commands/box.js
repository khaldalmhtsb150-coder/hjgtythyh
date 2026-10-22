const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { GIVEAWAY_JOIN_EMOJI_ID, createGiveawayEmbed } = require('../utils/giveawayEmbed');

module.exports = {
  name: 'box',
  description: 'بدء جيف اواي فوري - أول من يتفاعل يفوز',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const prize = args.join(' ');

    if (!prize) {
      return message.reply('❌ الاستخدام: `$box <الجائزة>`\nمثال: `$box Discord Nitro`');
    }

    const hostName = message.author.username;
    const hostAvatarURL = message.author.displayAvatarURL({ size: 64 });
    const endTime = Date.now() + 60000;
    const embed = createGiveawayEmbed({
      guild: message.guild,
      prize,
      hostId: message.author.id,
      hostName,
      hostAvatarURL,
      endTime,
      winners: 1
    });

    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react(GIVEAWAY_JOIN_EMOJI_ID);

    const filter = (reaction, user) => {
      return reaction.emoji.id === GIVEAWAY_JOIN_EMOJI_ID && !user.bot;
    };

    const collector = giveawayMessage.createReactionCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      const winEmbed = createGiveawayEmbed({
        guild: message.guild,
        prize,
        hostId: message.author.id,
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
          .setTitle('<:emoji_7:1436089797654351904> انتهى الجيف اواي <:emoji_7:1436089797654351904>')
          .setDescription(`**الجائزة:** ${prize}\n**الفائز:** لا أحد دخل!`)
          .setColor('#FF0000')
          .setTimestamp();

        await giveawayMessage.edit({ embeds: [noWinnerEmbed] });
      }
    });

    message.delete().catch(() => {});
  }
};
