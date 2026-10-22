const { EmbedBuilder } = require('discord.js');
const { DEFAULT_PRIMARY_EMBED_COLOR } = require('../utils/primaryEmbedColor');

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

module.exports = {
  name: 'setcolor',
  description: 'تغيير اللون الأساسي لإمبيدات البوت',
  ownerOnly: true,
  async execute(message, args) {
    const input = args[0]?.trim();
    if (!input) {
      return message.reply('❌ الاستخدام: `$setcolor <#RRGGBB|default>`\nمثال: `$setcolor #5865F2`');
    }

    const color = input.toLowerCase() === 'default'
      ? DEFAULT_PRIMARY_EMBED_COLOR
      : `#${input.replace(/^#/, '')}`;

    if (!HEX_COLOR_PATTERN.test(color)) {
      return message.reply('❌ أدخل لون HEX بصيغة `#RRGGBB` أو استخدم `default`.');
    }

    global.botSettings.primaryColor = color.toUpperCase();
    global.saveBotSettings();

    const embed = new EmbedBuilder()
      .setColor(global.botSettings.primaryColor)
      .setTitle('تم تغيير اللون الأساسي')
      .setDescription(`اللون الجديد: \`${global.botSettings.primaryColor}\``);

    return message.reply({ embeds: [embed] });
  }
};
