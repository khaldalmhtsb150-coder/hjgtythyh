const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setjailstaff')
    .setDescription('تعيين رتبة موظفي السجن - Set the jail staff role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('رتبة موظفي السجن - Jail staff role')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async executeSlash(interaction, client) {
    const role = interaction.options.getRole('role');
    const guildId = interaction.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailStaffRoleId = role.id;
    global.saveJailConfig();

    const jailLogId = global.jailConfig[guildId].jailLogId;
    if (jailLogId) {
      try {
        const logChannel = interaction.guild.channels.cache.get(jailLogId);
        if (logChannel) {
          await logChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
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

    await interaction.reply(`✅ تم تعيين رتبة موظفي السجن إلى ${role}\n✅ Jail staff role set to ${role}\n\nالآن يمكن لهذه الرتبة رؤية سجلات السجن.\nNow this role can see jail logs.`);
  }
};
