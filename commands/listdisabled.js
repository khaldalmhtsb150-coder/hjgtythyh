const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'listdisabled',
  description: 'List all disabled commands for a server',
  ownerOnly: true,
  async execute(message, args, client) {
    if (args.length < 1) {
      const embed = new EmbedBuilder()
        .setTitle('📋 Disabled Commands - All Servers')
        .setColor('#FF6B6B')
        .setTimestamp();

      if (Object.keys(global.disabledCommands).length === 0) {
        embed.setDescription('No commands are currently disabled in any server.');
        return message.reply({ embeds: [embed] });
      }

      let description = '';
      for (const [serverId, commands] of Object.entries(global.disabledCommands)) {
        const guild = client.guilds.cache.get(serverId);
        const guildName = guild ? guild.name : `Unknown Server (${serverId})`;
        description += `**${guildName}**\n${commands.map(cmd => `\`${cmd}\``).join(', ')}\n\n`;
      }

      embed.setDescription(description || 'No commands are currently disabled.');
      return message.reply({ embeds: [embed] });
    }

    const serverId = args[0];
    const guild = client.guilds.cache.get(serverId);
    
    if (!guild) {
      return message.reply('❌ Server not found. Make sure the bot is in that server.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Disabled Commands - ${guild.name}`)
      .setColor('#FF6B6B')
      .setTimestamp();

    if (!global.disabledCommands[serverId] || global.disabledCommands[serverId].length === 0) {
      embed.setDescription('No commands are currently disabled in this server.');
    } else {
      const commandList = global.disabledCommands[serverId].map(cmd => `\`${cmd}\``).join(', ');
      embed.setDescription(`**Disabled Commands:**\n${commandList}`);
    }

    message.reply({ embeds: [embed] });
  }
};
