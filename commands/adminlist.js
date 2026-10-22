const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'adminlist',
  description: 'عرض قائمة مشرفي البوت',
  ownerOnly: true,
  async execute(message, args, client) {
    if (global.admins.length === 0) {
      return message.reply('📭 لم يتم إضافة أي مشرفين بعد.');
    }

    const adminList = global.admins.map((id, index) => `${index + 1}. <@${id}> (${id})`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('👥 مشرفي البوت')
      .setDescription(adminList)
      .setColor('#FFD700')
      .setFooter({ text: `إجمالي المشرفين: ${global.admins.length}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
