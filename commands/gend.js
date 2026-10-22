const { PermissionFlagsBits } = require('discord.js');
const { getGiveawayReaction, createGiveawayEmbed } = require('../utils/giveawayEmbed');

module.exports = {
  name: 'gend',
  description: 'إنهاء الجيف اواي مبكراً',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const messageId = args[0];

    if (!messageId) {
      return message.reply('❌ الاستخدام: `$gend <message_id>`');
    }

    const giveaway = global.giveaways.find(g => g.messageId === messageId && !g.ended);
    
    if (!giveaway) {
      return message.reply('❌ لم يتم العثور على جيف اواي نشط بهذا الـ ID.');
    }

    try {
      const channel = await client.channels.fetch(giveaway.channelId);
      const msg = await channel.messages.fetch(giveaway.messageId);
      const hostUser = await client.users.fetch(giveaway.hostId).catch(() => null);
      const reaction = getGiveawayReaction(msg);
      
      if (!reaction) {
        giveaway.ended = true;
        global.saveGiveaways();
        return message.reply('❌ لا أحد دخل الجيف اواي.');
      }

      const users = await reaction.users.fetch();
      const entries = users.filter(user => !user.bot);

      if (entries.size === 0) {
        giveaway.ended = true;
        global.saveGiveaways();
        return message.reply('❌ لا يوجد مشاركين صالحين للجيف اواي.');
      }

      const winners = [];
      const entriesArray = Array.from(entries.values());
      
      for (let i = 0; i < Math.min(giveaway.winnersCount, entriesArray.length); i++) {
        const randomIndex = Math.floor(Math.random() * entriesArray.length);
        winners.push(entriesArray.splice(randomIndex, 1)[0]);
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

      giveaway.ended = true;
      giveaway.winners = winners.map(w => w.id);
      global.saveGiveaways();

      message.reply('✅ تم إنهاء الجيف اواي بنجاح!');
    } catch (error) {
      console.error('Error ending giveaway:', error);
      message.reply('❌ خطأ في إنهاء الجيف اواي. تأكد من صحة الـ ID.');
    }
  }
};
