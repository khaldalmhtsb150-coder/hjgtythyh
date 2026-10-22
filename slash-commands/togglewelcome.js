const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('togglewelcome')
    .setDescription('Enable or disable the welcome system')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Enable or disable')
        .setRequired(true)
        .addChoices(
          { name: 'On', value: 'on' },
          { name: 'Off', value: 'off' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    
    if (!global.welcome[guildId]) {
      global.welcome[guildId] = {
        enabled: false,
        channelId: null,
        imageUrl: null,
        avatarX: 512,
        avatarY: 250,
        avatarRadius: 100,
        message: null
      };
    }

    const action = interaction.options.getString('action');
    const enable = action === 'on';
    
    if (enable && !global.welcome[guildId].channelId) {
      return await interaction.reply({
        content: '❌ Please set a welcome channel first using `/setwelcomechannel`\n❌ الرجاء تعيين قناة الترحيب أولاً باستخدام `/setwelcomechannel`',
        ephemeral: true
      });
    }

    global.welcome[guildId].enabled = enable;
    global.saveWelcome();

    if (enable) {
      await interaction.reply({
        content: '✅ Welcome system enabled!\n✅ تم تفعيل نظام الترحيب!\n\nNew members will now receive welcome messages.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '⚠️ Welcome system disabled.\n⚠️ تم تعطيل نظام الترحيب.',
        ephemeral: true
      });
    }
  }
};
