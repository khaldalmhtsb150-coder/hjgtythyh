const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'addlinechannel',
  description: 'Add a channel to the auto-line feature',
  permissions: PermissionFlagsBits.ManageChannels,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.autoLine[guildId]) {
      global.autoLine[guildId] = {
        enabled: false,
        imageUrl: null,
        channels: []
      };
    }

    if (!global.autoLine[guildId].imageUrl) {
      return message.reply('❌ Please set an image/GIF URL first using `$setline <url>`\n❌ الرجاء تعيين رابط صورة/GIF أولاً باستخدام `$setline <url>`');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Please mention a channel. Example: `$addlinechannel #general`\n❌ الرجاء الإشارة إلى قناة. مثال: `$addlinechannel #general`');
    }

    if (global.autoLine[guildId].channels.includes(channel.id)) {
      return message.reply('❌ This channel is already in the auto-line list.\n❌ هذه القناة موجودة بالفعل في قائمة الخط التلقائي.');
    }

    global.autoLine[guildId].channels.push(channel.id);
    global.saveAutoLine();

    message.reply(`✅ Channel ${channel} has been added to auto-line!\n✅ تمت إضافة القناة ${channel} إلى الخط التلقائي!\n\nUse \`$toggleline on\` to enable the feature.\nاستخدم \`$toggleline on\` لتفعيل الميزة.`);
  }
};
