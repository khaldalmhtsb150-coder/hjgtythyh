const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testgreet')
    .setDescription('Test the greeting message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    const greetConfig = global.greetings[guildId];

    if (!greetConfig || !greetConfig.message) {
      return interaction.reply({ 
        content: '❌ No greeting message has been set. Use `/setgreet` first.', 
        ephemeral: true 
      });
    }

    const message = greetConfig.message
      .replace('{user}', `<@${interaction.user.id}>`)
      .replace('{username}', interaction.user.username)
      .replace('{server}', interaction.guild.name);

    await interaction.reply({ 
      content: '📬 **Test Greeting:**\n' + message 
    });
  }
};
