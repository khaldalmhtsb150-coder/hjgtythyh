module.exports = {
  name: 'recom',
  description: 'Re-enable a disabled command in a specific server',
  ownerOnly: true,
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply('❌ Usage: `$recom <server_id> <command_name>`');
    }

    const serverId = args[0];
    const commandName = args[1].toLowerCase();

    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
      return message.reply('❌ Server not found. Make sure the bot is in that server.');
    }

    if (!global.disabledCommands[serverId] || !global.disabledCommands[serverId].includes(commandName)) {
      return message.reply(`⚠️ Command \`${commandName}\` is not disabled in **${guild.name}**.`);
    }

    global.disabledCommands[serverId] = global.disabledCommands[serverId].filter(cmd => cmd !== commandName);
    
    if (global.disabledCommands[serverId].length === 0) {
      delete global.disabledCommands[serverId];
    }
    
    global.saveDisabledCommands();

    message.reply(`✅ Command \`${commandName}\` has been re-enabled in **${guild.name}** (${serverId}).`);
  }
};
