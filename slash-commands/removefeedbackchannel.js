const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removefeedbackchannel')
    .setDescription('Remove a channel from the feedback system')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to remove from feedback system')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    
    if (!global.feedback[guildId] || !global.feedback[guildId].channels.length) {
      return interaction.reply({ 
        content: '❌ No channels are configured for feedback.\n❌ لا توجد قنوات مكونة للتعليقات.', 
        ephemeral: true 
      });
    }

    const index = global.feedback[guildId].channels.indexOf(channel.id);
    if (index === -1) {
      return interaction.reply({ 
        content: '❌ This channel is not in the feedback list.\n❌ هذه القناة ليست في قائمة التعليقات.', 
        ephemeral: true 
      });
    }

    global.feedback[guildId].channels.splice(index, 1);
    global.saveFeedback();

    await interaction.reply(`✅ Channel ${channel} has been removed from feedback.\n✅ تمت إزالة القناة ${channel} من نظام التعليقات.`);
  }
};
