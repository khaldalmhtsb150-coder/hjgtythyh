const { buildInviteProfileEmbed } = require('../utils/inviteProfile');

module.exports = {
  name: 'invites',
  description: 'عرض سجل دعوات العضو والأعضاء الذين دعاهم',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('❌ هذا الأمر يعمل داخل السيرفر فقط.');
    }

    const guildId = message.guild.id;
    const targetUser = message.mentions.users.first() || message.author;

    return message.reply({ embeds: [buildInviteProfileEmbed(guildId, targetUser)] });
  }
};
