const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setline')
    .setDescription('Set the image/GIF URL for auto-line feature')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('The image or GIF URL')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const imageUrl = interaction.options.getString('url');
    
    if (!imageUrl.match(/^https?:\/\/.+/i)) {
      return interaction.reply({ 
        content: '❌ Please provide a valid URL starting with http:// or https://\n❌ الرجاء تقديم رابط صالح يبدأ بـ http:// أو https://', 
        ephemeral: true 
      });
    }

    if (!global.autoLine[guildId]) {
      global.autoLine[guildId] = {
        enabled: false,
        imageUrl: null,
        channels: []
      };
    }

    global.autoLine[guildId].imageUrl = imageUrl;
    global.saveAutoLine();

    await interaction.reply(`✅ Auto-line image/GIF has been set successfully!\n✅ تم تعيين صورة/GIF الخط التلقائي بنجاح!\n\n**URL:** ${imageUrl}\n\nUse \`/addlinechannel\` to add channels where this should be sent.\nاستخدم \`/addlinechannel\` لإضافة القنوات التي يجب إرسال هذا فيها.`);
  }
};
