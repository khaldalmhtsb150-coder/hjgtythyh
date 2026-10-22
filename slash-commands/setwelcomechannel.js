const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcomechannel')
    .setDescription('Set the channel for welcome messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send welcome messages')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    
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

    global.welcome[guildId].channelId = channel.id;
    global.saveWelcome();

    await interaction.reply({
      content: `✅ Welcome channel set to ${channel}!\n✅ تم تعيين قناة الترحيب إلى ${channel}!\n\nDon't forget to:\n1. Set a background image: \`/setwelcomeimage\`\n2. Set a welcome message: \`/setwelcomemessage\`\n3. Enable the system: \`/togglewelcome\``,
      ephemeral: true
    });
  }
};
