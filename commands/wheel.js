const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'wheel',
  description: 'تفعيل أو تعطيل نظام العجلة',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args, client) {
    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off'].includes(action)) {
      return message.reply('❌ الاستخدام: `$wheel <on|off>`');
    }

    const guildId = message.guild.id;
    
    if (!global.wheelConfig[guildId]) {
      global.wheelConfig[guildId] = {
        enabled: false
      };
    }

    global.wheelConfig[guildId].enabled = action === 'on';
    global.saveWheelConfig();

    if (action === 'on') {
      message.reply('✅ تم تفعيل نظام العجلة! الآن جميع الأعضاء يمكنهم استخدام `$wheelticket` و `$invites`');
    } else {
      message.reply('✅ تم تعطيل نظام العجلة!');
    }
  }
};
