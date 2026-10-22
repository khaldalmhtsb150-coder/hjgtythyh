const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'winners',
  description: 'عرض الفائزين في الجيف اواي',
  async execute(message, args, client) {
    const messageId = args[0];

    if (!messageId) {
      return message.reply('❌ الاستخدام: `$winners <message_id>`');
    }

    const giveaway = global.giveaways.find(g => g.messageId === messageId);
    
    if (!giveaway) {
      return message.reply('❌ لم يتم العثور على جيف اواي بهذا الـ ID.');
    }

    if (!giveaway.ended) {
      return message.reply('❌ هذا الجيف اواي لا يزال نشطاً.');
    }

    if (!giveaway.winners || giveaway.winners.length === 0) {
      return message.reply('❌ لا يوجد فائزين مسجلين لهذا الجيف اواي.');
    }

    const winnerMentions = giveaway.winners.map(id => `<@${id}>`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 الفائزين في الجيف اواي')
      .setDescription(`**الجائزة:** ${giveaway.prize}\n\n**الفائزين:**\n${winnerMentions}`)
      .setColor('#FFD700')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
