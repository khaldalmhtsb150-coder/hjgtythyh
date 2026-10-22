const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addlinechannel')
    .setDescription('Add a channel to the auto-line feature')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to add to auto-line')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    
    if (!global.autoLine[guildId]) {
      global.autoLine[guildId] = {
        enabled: false,
        imageUrl: null,
        channels: []
      };
    }

    if (!global.autoLine[guildId].imageUrl) {
      return interaction.reply({ 
        content: '❌ Please set an image/GIF URL first using `/setline <url>`\n❌ الرجاء تعيين رابط صورة/GIF أولاً باستخدام `/setline <url>`', 
        ephemeral: true 
      });
    }

    if (global.autoLine[guildId].channels.includes(channel.id)) {
      return interaction.reply({ 
        content: '❌ This channel is already in the auto-line list.\n❌ هذه القناة موجودة بالفعل في قائمة الخط التلقائي.', 
        ephemeral: true 
      });
    }

    global.autoLine[guildId].channels.push(channel.id);
    global.saveAutoLine();

    await interaction.reply(`✅ Channel ${channel} has been added to auto-line!\n✅ تمت إضافة القناة ${channel} إلى الخط التلقائي!\n\nUse \`/toggleline on\` to enable the feature.\nاستخدم \`/toggleline on\` لتفعيل الميزة.`);
  }
};
