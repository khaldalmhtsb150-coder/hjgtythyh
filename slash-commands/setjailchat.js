const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setjailchat')
    .setDescription('تعيين قناة السجن - Set the jail chat channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('قناة السجن - Jail channel')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async executeSlash(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;
    
    if (!global.jailConfig[guildId]) {
      global.jailConfig[guildId] = {};
    }

    global.jailConfig[guildId].jailChatId = channel.id;
    global.saveJailConfig();

    await interaction.reply(`✅ تم تعيين قناة السجن إلى ${channel}\n✅ Jail chat channel set to ${channel}\n\nالآن سيتمكن المسجونون فقط من رؤية هذه القناة.\nNow only jailed members will be able to see this channel.`);
  }
};
