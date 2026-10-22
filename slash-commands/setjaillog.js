const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setjaillog')
    .setDescription('تعيين قناة سجل السجن - Set the jail log channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('قناة سجل السجن - Jail log channel')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async executeSlash(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailLogId = channel.id;
    global.saveJailConfig();

    await interaction.reply(`✅ تم تعيين قناة سجل السجن إلى ${channel}\n✅ Jail log channel set to ${channel}\n\nسيتم إرسال سجلات السجن والإفراج إلى هذه القناة.\nJail and release logs will be sent to this channel.`);
  }
};
