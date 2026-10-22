const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'markagiv',
  description: 'Enable or disable the marka giv role feature',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args) {
    const guildId = message.guild.id;
    
    if (!global.markaGivConfig[guildId]) {
      global.markaGivConfig[guildId] = {
        enabled: false
      };
    }

    const action = args[0]?.toLowerCase();
    
    if (action === 'on' || action === 'enable') {
      global.markaGivConfig[guildId].enabled = true;
      global.saveMarkaGivConfig();
      return message.reply('✅ **Marka Giv** role feature has been **enabled**!\n✅ تم **تفعيل** ميزة رتبة **Marka Giv**!\n\nNow users with **Administrator**, **Streeter**, or **marka giv** role can use the bot.\nالآن المستخدمون الذين لديهم صلاحية **مسؤول** أو رتبة **Streeter** أو **marka giv** يمكنهم استخدام البوت.');
    } else if (action === 'off' || action === 'disable') {
      global.markaGivConfig[guildId].enabled = false;
      global.saveMarkaGivConfig();
      return message.reply('✅ **Marka Giv** role feature has been **disabled**.\n✅ تم **تعطيل** ميزة رتبة **Marka Giv**.\n\nNow only users with **Administrator** or **Streeter** role can use the bot.\nالآن فقط المستخدمون الذين لديهم صلاحية **مسؤول** أو رتبة **Streeter** يمكنهم استخدام البوت.');
    } else {
      global.markaGivConfig[guildId].enabled = !global.markaGivConfig[guildId].enabled;
      global.saveMarkaGivConfig();
      const status = global.markaGivConfig[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return message.reply(`✅ **Marka Giv** role feature is now **${status}**`);
    }
  }
};
