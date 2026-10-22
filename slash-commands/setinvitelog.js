const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setinvitelog')
    .setDescription('تعيين قناة سجل الدخول والخروج والدعوات')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('القناة النصية التي ستستقبل سجلات الأعضاء')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const channel = interaction.options.getChannel('channel');

    const botPermissions = channel.permissionsFor(interaction.guild.members.me);
    if (!botPermissions?.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({
        content: '❌ لا أملك صلاحية إرسال الرسائل في هذه القناة.',
        ephemeral: true
      });
    }

    if (!global.inviteConfig[interaction.guild.id]) {
      global.inviteConfig[interaction.guild.id] = {};
    }

    global.inviteConfig[interaction.guild.id].logChannelId = channel.id;
    global.saveInviteConfig();

    const canReadInvites = interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild);
    const permissionWarning = canReadInvites
      ? ''
      : '\n⚠️ لا أملك صلاحية **إدارة السيرفر**؛ ستظهر أحداث الدخول والخروج، لكن قد يظهر الداعي «غير معروف».';
    await interaction.reply(`✅ تم تعيين قناة سجل الدخول والخروج والدعوات إلى <#${channel.id}>.\nستظهر فيها رسائل عربية قصيرة عند دخول الأعضاء أو مغادرتهم.${permissionWarning}`);
  }
};
