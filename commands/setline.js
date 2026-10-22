const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setline',
  description: 'Set the image/GIF URL for auto-line feature',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (args.length === 0) {
      return message.reply('❌ Please provide an image or GIF URL.\n❌ الرجاء تقديم رابط صورة أو GIF.');
    }

    const imageUrl = args[0];
    
    if (!imageUrl.match(/^https?:\/\/.+/i)) {
      return message.reply('❌ Please provide a valid URL starting with http:// or https://\n❌ الرجاء تقديم رابط صالح يبدأ بـ http:// أو https://');
    }

    if (!global.autoLine[guildId]) {
      global.autoLine[guildId] = {
        enabled: false,
        imageUrl: null,
        channels: []
      };
    }

    global.autoLine[guildId].imageUrl = imageUrl;
    global.saveAutoLine();

    message.reply(`✅ Auto-line image/GIF has been set successfully!\n✅ تم تعيين صورة/GIF الخط التلقائي بنجاح!\n\n**URL:** ${imageUrl}\n\nUse \`$addlinechannel #channel\` to add channels where this should be sent.\nاستخدم \`$addlinechannel #channel\` لإضافة القنوات التي يجب إرسال هذا فيها.`);
  }
};
