const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('markagiv')
    .setDescription('Enable or disable the marka giv role feature')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Enable or disable the marka giv role feature')
        .setRequired(false)
        .addChoices(
          { name: 'Enable', value: 'on' },
          { name: 'Disable', value: 'off' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const action = interaction.options.getString('action');
    
    if (!global.markaGivConfig[guildId]) {
      global.markaGivConfig[guildId] = {
        enabled: false
      };
    }
    
    if (action === 'on') {
      global.markaGivConfig[guildId].enabled = true;
      global.saveMarkaGivConfig();
      return interaction.reply('✅ **Marka Giv** role feature has been **enabled**!\n✅ تم **تفعيل** ميزة رتبة **Marka Giv**!\n\nNow users with **Administrator**, **Streeter**, or **marka giv** role can use the bot.\nالآن المستخدمون الذين لديهم صلاحية **مسؤول** أو رتبة **Streeter** أو **marka giv** يمكنهم استخدام البوت.');
    } else if (action === 'off') {
      global.markaGivConfig[guildId].enabled = false;
      global.saveMarkaGivConfig();
      return interaction.reply('✅ **Marka Giv** role feature has been **disabled**.\n✅ تم **تعطيل** ميزة رتبة **Marka Giv**.\n\nNow only users with **Administrator** or **Streeter** role can use the bot.\nالآن فقط المستخدمون الذين لديهم صلاحية **مسؤول** أو رتبة **Streeter** يمكنهم استخدام البوت.');
    } else {
      global.markaGivConfig[guildId].enabled = !global.markaGivConfig[guildId].enabled;
      global.saveMarkaGivConfig();
      const status = global.markaGivConfig[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return interaction.reply(`✅ **Marka Giv** role feature is now **${status}**`);
    }
  }
};
