const { PermissionFlagsBits } = require('discord.js');
const {
  GIVEAWAY_JOIN_EMOJI_ID,
  getGiveawayReaction,
  createGiveawayEmbed
} = require('../utils/giveawayEmbed');

module.exports = {
  name: 'gstart',
  description: 'بدء جيف اواي',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const duration = args[0];
    const winnersCount = parseInt(args[1]);
    const prize = args.slice(2).join(' ');

    if (!duration || !winnersCount || !prize) {
      return message.reply('❌ الاستخدام: `$gstart <المدة> <عدد الفائزين> <الجائزة>`\nمثال: `$gstart 1h 1 Discord Nitro`');
    }

    const timeMatch = duration.match(/^(\d+)([smhd])$/);
    if (!timeMatch) {
      return message.reply('❌ صيغة المدة غير صحيحة. استخدم: 10s, 5m, 2h, أو 1d');
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
    const hostName = message.author.username;
    const hostAvatarURL = message.author.displayAvatarURL({ size: 64 });

    const embed = createGiveawayEmbed({
      guild: message.guild,
      prize,
      hostId: message.author.id,
      hostName,
      hostAvatarURL,
      endTime,
      winners: winnersCount
    });

    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react(GIVEAWAY_JOIN_EMOJI_ID);

    const giveaway = {
      messageId: giveawayMessage.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      prize: prize,
      winnersCount: winnersCount,
      endTime: endTime,
      hostId: message.author.id,
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
          return channel.send('❌ لا أحد دخل الجيف اواي.');
        }

        const users = await reaction.users.fetch();
        const entries = users.filter(user => !user.bot);

        if (entries.size === 0) {
          return channel.send('❌ لا يوجد مشاركين صالحين للجيف اواي.');
        }

        const winners = [];
        const entriesArray = Array.from(entries.values());
        
        for (let i = 0; i < Math.min(winnersCount, entriesArray.length); i++) {
          const randomIndex = Math.floor(Math.random() * entriesArray.length);
          winners.push(entriesArray.splice(randomIndex, 1)[0]);
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

    message.delete().catch(() => {});
  }
};
