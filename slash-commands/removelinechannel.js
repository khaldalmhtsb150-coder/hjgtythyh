const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removelinechannel')
    .setDescription('Remove a channel from the auto-line feature')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to remove from auto-line')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    
    if (!global.autoLine[guildId] || !global.autoLine[guildId].channels.length) {
      return interaction.reply({ 
        content: '❌ No channels are configured for auto-line.\n❌ لا توجد قنوات مكونة للخط التلقائي.', 
        ephemeral: true 
      });
    }

    const index = global.autoLine[guildId].channels.indexOf(channel.id);
    if (index === -1) {
      return interaction.reply({ 
        content: '❌ This channel is not in the auto-line list.\n❌ هذه القناة ليست في قائمة الخط التلقائي.', 
        ephemeral: true 
      });
    }

    global.autoLine[guildId].channels.splice(index, 1);
    global.saveAutoLine();

    await interaction.reply(`✅ Channel ${channel} has been removed from auto-line.\n✅ تمت إزالة القناة ${channel} من الخط التلقائي.`);
  }
};
