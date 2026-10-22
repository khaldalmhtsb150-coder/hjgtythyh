const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getPrimaryEmbedColor } = require('../utils/primaryEmbedColor');

module.exports = {
  name: 'servers',
  description: 'عرض قائمة السيرفرات التي بها البوت',
  ownerOnly: true,
  async execute(message, args, client) {
    const guilds = Array.from(client.guilds.cache.values());

    if (guilds.length === 0) {
      return message.reply('❌ لا يوجد في أي سيرفرات.');
    }

    const serversPerPage = 10;
    const totalPages = Math.ceil(guilds.length / serversPerPage);
    let currentPage = 0;

    const generateEmbed = async (page) => {
      const start = page * serversPerPage;
      const end = start + serversPerPage;
      const currentServers = guilds.slice(start, end);

      const serverListPromises = currentServers.map(async (guild, index) => {
        let inviteLink = 'No invite available';
        try {
          const channel = guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('CreateInstantInvite'));
          if (channel) {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, unique: false });
            inviteLink = invite.url;
          }
        } catch (error) {
          inviteLink = 'No permissions';
        }
        return `**${start + index + 1}.** ${guild.name}\n└ ID: \`${guild.id}\` | Members: ${guild.memberCount}\n└ [Join Server](${inviteLink})`;
      });

      const serverList = (await Promise.all(serverListPromises)).join('\n\n');

      return new EmbedBuilder()
        .setTitle('🌐 قائمة السيرفرات - Server List')
        .setDescription(serverList)
        .setColor(getPrimaryEmbedColor())
        .setFooter({ text: `Page ${page + 1}/${totalPages} | Total Servers: ${guilds.length}` })
        .setTimestamp();
    };

    const generateButtons = (page) => {
      return new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏮️ First')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️ Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('Last ⏭️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === totalPages - 1)
        );
    };

    const reply = await message.reply({
      embeds: [await generateEmbed(currentPage)],
      components: totalPages > 1 ? [generateButtons(currentPage)] : []
    });

    if (totalPages > 1) {
      const collector = reply.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 300000
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'first') {
          currentPage = 0;
        } else if (interaction.customId === 'previous') {
          currentPage = Math.max(0, currentPage - 1);
        } else if (interaction.customId === 'next') {
          currentPage = Math.min(totalPages - 1, currentPage + 1);
        } else if (interaction.customId === 'last') {
          currentPage = totalPages - 1;
        }

        await interaction.update({
          embeds: [await generateEmbed(currentPage)],
          components: [generateButtons(currentPage)]
        });
      });

      collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('first')
              .setLabel('⏮️ First')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('last')
              .setLabel('Last ⏭️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          );
        
        reply.edit({ components: [disabledRow] }).catch(() => {});
      });
    }
  }
};
