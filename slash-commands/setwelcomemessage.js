const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcomemessage')
    .setDescription('Set the welcome message text')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Welcome message (use {user}, {username}, {server}, {membercount}, {inviter})')
        .setRequired(true)
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

    const welcomeMessage = interaction.options.getString('message');

    global.welcome[guildId].message = welcomeMessage;
    global.saveWelcome();

    const preview = welcomeMessage
      .replace(/{user}/g, interaction.user.toString())
      .replace(/{username}/g, interaction.user.username)
      .replace(/{server}/g, interaction.guild.name)
      .replace(/{membercount}/g, interaction.guild.memberCount.toString())
      .replace(/{inviter}/g, 'Unknown');

    await interaction.reply({
      content: `✅ Welcome message set!\n✅ تم تعيين رسالة الترحيب!\n\n**Preview:**\n${preview}`,
      ephemeral: true
    });
  }
};
