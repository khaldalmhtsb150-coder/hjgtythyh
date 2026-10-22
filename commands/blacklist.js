const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'blacklist',
  description: 'Manage blacklisted users and servers',
  ownerOnly: true,
  async execute(message, args, client) {
    const action = args[0]?.toLowerCase();
    const type = args[1]?.toLowerCase();
    const id = args[2];

    if (action === 'list') {
      const embed = new EmbedBuilder()
        .setTitle('🚫 Blacklist')
        .setColor('#FF0000')
        .setTimestamp();

      if (global.blacklist.users.length > 0) {
        const userList = global.blacklist.users.map((id, index) => `${index + 1}. <@${id}> (${id})`).join('\n');
        embed.addFields({ name: 'Blacklisted Users', value: userList, inline: false });
      } else {
        embed.addFields({ name: 'Blacklisted Users', value: 'None', inline: false });
      }

      if (global.blacklist.servers.length > 0) {
        const serverList = global.blacklist.servers.map((id, index) => {
          const guild = client.guilds.cache.get(id);
          const name = guild ? guild.name : 'Unknown Server';
          return `${index + 1}. ${name} (${id})`;
        }).join('\n');
        embed.addFields({ name: 'Blacklisted Servers', value: serverList, inline: false });
      } else {
        embed.addFields({ name: 'Blacklisted Servers', value: 'None', inline: false });
      }

      return message.reply({ embeds: [embed] });
    }

    if (!action || !type || !id) {
      return message.reply('❌ Usage:\n`$blacklist user <user_id>` - Add/remove user\n`$blacklist server <server_id>` - Add/remove server\n`$blacklist list` - View all blacklisted');
    }

    if (type !== 'user' && type !== 'server') {
      return message.reply('❌ Type must be either `user` or `server`.');
    }

    const listKey = type === 'user' ? 'users' : 'servers';
    const index = global.blacklist[listKey].indexOf(id);

    if (index === -1) {
      global.blacklist[listKey].push(id);
      global.saveBlacklist();
      
      if (type === 'server') {
        const guild = client.guilds.cache.get(id);
        if (guild) {
          try {
            await guild.leave();
            return message.reply(`✅ Server **${guild.name}** has been blacklisted and I've left it.`);
          } catch (error) {
            console.error('Error leaving server:', error);
          }
        }
      }
      
      message.reply(`✅ ${type === 'user' ? 'User' : 'Server'} **${id}** has been blacklisted.`);
    } else {
      global.blacklist[listKey].splice(index, 1);
      global.saveBlacklist();
      message.reply(`✅ ${type === 'user' ? 'User' : 'Server'} **${id}** has been removed from the blacklist.`);
    }
  }
};
