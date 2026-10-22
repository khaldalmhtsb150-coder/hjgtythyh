const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('greet')
    .setDescription('Enable or disable the greeting system')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Enable or disable greetings')
        .setRequired(true)
        .addChoices(
          { name: 'On', value: 'on' },
          { name: 'Off', value: 'off' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const status = interaction.options.getString('status');
    const guildId = interaction.guild.id;

    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {};
    }

    global.greetings[guildId].enabled = status === 'on';
    global.saveGreetings();

    await interaction.reply({ 
      content: status === 'on' 
        ? '✅ Greeting system has been **enabled**.' 
        : '✅ Greeting system has been **disabled**.'
    });
  }
};
