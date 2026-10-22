const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setgreet')
    .setDescription('Set the greeting message for new members')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send greetings in')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The greeting message (use {user}, {username}, {server})')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const guildId = interaction.guild.id;

    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {};
    }

    global.greetings[guildId].channelId = channel.id;
    global.greetings[guildId].message = message;
    global.saveGreetings();

    await interaction.reply({ 
      content: `✅ Greeting message set for ${channel}!\n\n**Preview:**\n${message.replace('{user}', `<@${interaction.user.id}>`).replace('{username}', interaction.user.username).replace('{server}', interaction.guild.name)}`
    });
  }
};
