const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setwelcomemessage',
  description: 'Set the welcome message text',
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message, args) {
    const guildId = message.guild.id;
    
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

    const welcomeMessage = args.join(' ');
    if (!welcomeMessage) {
      return message.reply('❌ Please provide a welcome message.\n\n**Available variables:**\n- `{user}` - Mention the new member\n- `{username}` - Username of the new member\n- `{server}` - Server name\n- `{membercount}` - Total member count\n- `{inviter}` - Mention the inviter\n\n**Example:**\n```\n$setwelcomemessage 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐅𝐀𝐌𝐈𝐋𝐘\n〢𝐌𝐄𝐌𝐁𝐄𝐑 : {user}\n〢𝐂𝐇𝐀𝐓 : {server}\n〢𝐑𝐔𝐋𝐄𝐒 : #rules\n〢𝐍𝐔𝐌𝐁𝐄𝐑 : {membercount}\n〢𝐈𝐍𝐕𝐈𝐓𝐄𝐑 : {inviter}\n```');
    }

    global.welcome[guildId].message = welcomeMessage;
    global.saveWelcome();

    message.reply(`✅ Welcome message set!\n✅ تم تعيين رسالة الترحيب!\n\n**Preview:**\n${welcomeMessage.replace(/{user}/g, message.author.toString()).replace(/{username}/g, message.author.username).replace(/{server}/g, message.guild.name).replace(/{membercount}/g, message.guild.memberCount.toString()).replace(/{inviter}/g, 'Unknown')}`);
  }
};
