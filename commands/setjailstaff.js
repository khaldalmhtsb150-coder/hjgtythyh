const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setjailstaff',
  description: 'تعيين رتبة موظفي السجن - Set the jail staff role',
  permissions: PermissionFlagsBits.Administrator,
  async execute(message, args, client) {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

    if (!role) {
      return message.reply('❌ الاستخدام: `$setjailstaff @الرتبة`\n❌ Usage: `$setjailstaff @role`');
    }

    const guildId = message.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailStaffRoleId = role.id;
    global.saveJailConfig();

    const jailLogId = global.jailConfig[guildId].jailLogId;
    if (jailLogId) {
      try {
        const logChannel = message.guild.channels.cache.get(jailLogId);
        if (logChannel) {
          await logChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
            ViewChannel: false
          });
          await logChannel.permissionOverwrites.edit(role, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          });
        }
      } catch (error) {
        console.error('Error setting jail log permissions:', error);
      }
    }

    message.reply(`✅ تم تعيين رتبة موظفي السجن إلى ${role}\n✅ Jail staff role set to ${role}\n\nالآن يمكن لهذه الرتبة رؤية سجلات السجن.\nNow this role can see jail logs.`);
  }
};
