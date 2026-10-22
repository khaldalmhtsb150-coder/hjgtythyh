const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('togglefeedback')
    .setDescription('Enable or disable the feedback system')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Enable or disable the feedback system')
        .setRequired(false)
        .addChoices(
          { name: 'Enable', value: 'on' },
          { name: 'Disable', value: 'off' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const action = interaction.options.getString('action');
    
    if (!global.feedback[guildId]) {
      global.feedback[guildId] = {
        enabled: false,
        emojis: [],
        channels: []
      };
    }

    if (global.feedback[guildId].channels.length === 0) {
      return interaction.reply({ 
        content: '❌ Please add at least one channel using `/addfeedbackchannel`\n❌ الرجاء إضافة قناة واحدة على الأقل باستخدام `/addfeedbackchannel`', 
        ephemeral: true 
      });
    }

    if (global.feedback[guildId].emojis.length === 0) {
      return interaction.reply({ 
        content: '❌ Please set emojis using `/setfeedbackemojis 👍 👎 ❤️`\n❌ الرجاء تعيين الرموز التعبيرية باستخدام `/setfeedbackemojis 👍 👎 ❤️`', 
        ephemeral: true 
      });
    }
    
    if (action === 'on') {
      global.feedback[guildId].enabled = true;
      global.saveFeedback();
      return interaction.reply('✅ Feedback system has been **enabled**!\n✅ تم **تفعيل** نظام التعليقات!');
    } else if (action === 'off') {
      global.feedback[guildId].enabled = false;
      global.saveFeedback();
      return interaction.reply('✅ Feedback system has been **disabled**.\n✅ تم **تعطيل** نظام التعليقات.');
    } else {
      global.feedback[guildId].enabled = !global.feedback[guildId].enabled;
      global.saveFeedback();
      const status = global.feedback[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return interaction.reply(`✅ Feedback system is now **${status}**`);
    }
  }
};
