module.exports = {
  name: 'uncom',
  description: 'Disable a command in a specific server',
  ownerOnly: true,
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply('❌ Usage: `$uncom <server_id> <command_name>`');
    }

    const serverId = args[0];
    const commandName = args[1].toLowerCase();

    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
      return message.reply('❌ Server not found. Make sure the bot is in that server.');
    }

    const command = client.commands.get(commandName) || client.slashCommands.get(commandName);
    if (!command) {
      return message.reply(`❌ Command \`${commandName}\` not found.`);
    }

    if (!global.disabledCommands[serverId]) {
      global.disabledCommands[serverId] = [];
    }

    if (global.disabledCommands[serverId].includes(commandName)) {
      return message.reply(`⚠️ Command \`${commandName}\` is already disabled in **${guild.name}**.`);
    }

    global.disabledCommands[serverId].push(commandName);
    global.saveDisabledCommands();

    message.reply(`✅ Command \`${commandName}\` has been disabled in **${guild.name}** (${serverId}).`);
  }
};
