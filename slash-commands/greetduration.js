const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('greetduration')
    .setDescription('Set how long greeting messages stay before auto-deletion')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Duration in seconds (0 = never delete)')
        .setRequired(true)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');
    const guildId = interaction.guild.id;

    if (!global.greetings[guildId]) {
      global.greetings[guildId] = {};
    }

    global.greetings[guildId].duration = seconds;
    global.saveGreetings();

    await interaction.reply({ 
      content: seconds === 0 
        ? '✅ Greeting messages will **not** be auto-deleted.' 
        : `✅ Greeting messages will be deleted after **${seconds} seconds**.`
    });
  }
};
