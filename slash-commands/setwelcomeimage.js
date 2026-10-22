const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcomeimage')
    .setDescription('Set the background image and avatar position for welcome messages')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('URL of the background image')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('x')
        .setDescription('X position of avatar circle center (default: 512)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('y')
        .setDescription('Y position of avatar circle center (default: 250)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('radius')
        .setDescription('Radius of avatar circle (default: 100)')
        .setRequired(false)
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

    const imageUrl = interaction.options.getString('url');
    const avatarX = interaction.options.getInteger('x') ?? 512;
    const avatarY = interaction.options.getInteger('y') ?? 250;
    const avatarRadius = interaction.options.getInteger('radius') ?? 100;

    global.welcome[guildId].imageUrl = imageUrl;
    global.welcome[guildId].avatarX = avatarX;
    global.welcome[guildId].avatarY = avatarY;
    global.welcome[guildId].avatarRadius = avatarRadius;
    global.saveWelcome();

    await interaction.reply({
      content: `✅ Welcome image configured!\n✅ تم تكوين صورة الترحيب!\n\n**Image URL:** ${imageUrl}\n**Avatar Position:** (${avatarX}, ${avatarY})\n**Avatar Radius:** ${avatarRadius}px\n\nUse \`/testwelcome\` to preview the result!`,
      ephemeral: true
    });
  }
};
