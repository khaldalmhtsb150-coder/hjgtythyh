const { ActivityType } = require('discord.js');

module.exports = {
  name: 'setstatus',
  description: 'Change the bot\'s status',
  ownerOnly: true,
  async execute(message, args, client) {
    const statusType = args[0]?.toLowerCase();

    if (!statusType) {
      return message.reply('❌ Usage: `$setstatus <online|streaming|dnd>`\n\nExamples:\n`$setstatus online`\n`$setstatus streaming`\n`$setstatus dnd` (Do Not Disturb)');
    }

    try {
      if (statusType === 'online') {
        await client.user.setStatus('online');
        await client.user.setActivity('Marka Bot', { type: ActivityType.Playing });
        message.reply('✅ Status changed to: **Online**');
      } else if (statusType === 'streaming') {
        await client.user.setStatus('online');
        await client.user.setActivity('Marka Bot', { 
          type: ActivityType.Streaming,
          url: 'https://www.twitch.tv/markagamer'
        });
        message.reply('✅ Status changed to: **Streaming**');
      } else if (statusType === 'dnd') {
        await client.user.setStatus('dnd');
        await client.user.setActivity('Marka Bot', { type: ActivityType.Playing });
        message.reply('✅ Status changed to: **Do Not Disturb**');
      } else {
        return message.reply('❌ Invalid status type. Use: `online`, `streaming`, or `dnd`');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      message.reply('❌ Failed to change status.');
    }
  }
};
