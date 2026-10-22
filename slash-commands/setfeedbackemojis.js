const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setfeedbackemojis')
    .setDescription('Set emojis to add as reactions to feedback messages')
    .addStringOption(option =>
      option.setName('emojis')
        .setDescription('Emojis separated by spaces (e.g., 👍 👎 ❤️)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const emojiString = interaction.options.getString('emojis');
    
    if (!global.feedback[guildId]) {
      global.feedback[guildId] = {
        enabled: false,
        emojis: [],
        channels: []
      };
    }

    const emojis = emojiString.split(/\s+/).filter(arg => arg.trim());
    
    if (emojis.length === 0) {
      return interaction.reply({ 
        content: '❌ Please provide at least one valid emoji.\n❌ الرجاء تقديم رمز تعبيري واحد صالح على الأقل.', 
        ephemeral: true 
      });
    }

    global.feedback[guildId].emojis = emojis;
    global.saveFeedback();

    const emojiList = emojis.join(' ');
    await interaction.reply(`✅ Feedback emojis have been set!\n✅ تم تعيين الرموز التعبيرية للتعليقات!\n\n**Emojis | الرموز:** ${emojiList}`);
  }
};
