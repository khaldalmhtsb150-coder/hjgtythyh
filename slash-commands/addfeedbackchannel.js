const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addfeedbackchannel')
    .setDescription('Add a channel to the feedback system')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to add to feedback system')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    
    if (!global.feedback[guildId]) {
      global.feedback[guildId] = {
        enabled: false,
        emojis: [],
        channels: []
      };
    }

    if (global.feedback[guildId].channels.includes(channel.id)) {
      return interaction.reply({ 
        content: '❌ This channel is already in the feedback list.\n❌ هذه القناة موجودة بالفعل في قائمة التعليقات.', 
        ephemeral: true 
      });
    }

    global.feedback[guildId].channels.push(channel.id);
    global.saveFeedback();

    await interaction.reply(`✅ Channel ${channel} has been added to feedback!\n✅ تمت إضافة القناة ${channel} إلى نظام التعليقات!\n\nDon't forget to set emojis with \`/setfeedbackemojis\` and enable with \`/togglefeedback on\`\nلا تنسَ تعيين الرموز التعبيرية باستخدام \`/setfeedbackemojis\` والتفعيل باستخدام \`/togglefeedback on\``);
  }
};
