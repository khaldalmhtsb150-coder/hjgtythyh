const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toggleline')
    .setDescription('Enable or disable the auto-line feature')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Enable or disable the auto-line feature')
        .setRequired(false)
        .addChoices(
          { name: 'Enable', value: 'on' },
          { name: 'Disable', value: 'off' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const action = interaction.options.getString('action');
    
    if (!global.autoLine[guildId]) {
      global.autoLine[guildId] = {
        enabled: false,
        imageUrl: null,
        channels: []
      };
    }

    if (!global.autoLine[guildId].imageUrl) {
      return interaction.reply({ 
        content: '❌ Please set an image/GIF URL first using `/setline`\n❌ الرجاء تعيين رابط صورة/GIF أولاً باستخدام `/setline`', 
        ephemeral: true 
      });
    }

    if (global.autoLine[guildId].channels.length === 0) {
      return interaction.reply({ 
        content: '❌ Please add at least one channel using `/addlinechannel`\n❌ الرجاء إضافة قناة واحدة على الأقل باستخدام `/addlinechannel`', 
        ephemeral: true 
      });
    }
    
    if (action === 'on') {
      global.autoLine[guildId].enabled = true;
      global.saveAutoLine();
      return interaction.reply('✅ Auto-line feature has been **enabled**!\n✅ تم **تفعيل** ميزة الخط التلقائي!');
    } else if (action === 'off') {
      global.autoLine[guildId].enabled = false;
      global.saveAutoLine();
      return interaction.reply('✅ Auto-line feature has been **disabled**.\n✅ تم **تعطيل** ميزة الخط التلقائي.');
    } else {
      global.autoLine[guildId].enabled = !global.autoLine[guildId].enabled;
      global.saveAutoLine();
      const status = global.autoLine[guildId].enabled ? 'enabled | مفعل' : 'disabled | معطل';
      return interaction.reply(`✅ Auto-line feature is now **${status}**`);
    }
  }
};
