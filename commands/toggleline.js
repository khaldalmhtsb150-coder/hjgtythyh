const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'toggleline',
  description: 'Enable or disable the auto-line feature',
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

    if (global.autoLine[guildId].channels.length === 0) {
      return message.reply('❌ Please add at least one channel using `$addlinechannel #channel`\n❌ الرجاء إضافة قناة واحدة على الأقل باستخدام `$addlinechannel #channel`');
    }

    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      global.autoLine[guildId].enabled = true;
      global.saveAutoLine();
      return message.reply('✅ Auto-line feature has been **enabled**!\n✅ تم **تفعيل** ميزة الخط التلقائي!');
    } else if (action === 'off' || action === 'disable') {
      global.autoLine[guildId].enabled = false;
      global.saveAutoLine();
      return message.reply('✅ Auto-line feature has been **disabled**.\n✅ تم **تعطيل** ميزة الخط التلقائي.');
    } else {
      global.autoLine[guildId].enabled = !global.autoLine[guildId].enabled;
      global.saveAutoLine();
      const status = global.autoLine[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return message.reply(`✅ Auto-line feature is now **${status}**`);
    }
  }
};
