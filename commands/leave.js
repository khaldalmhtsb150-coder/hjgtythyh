module.exports = {
  name: 'leave',
  description: 'مغادرة سيرفر',
  ownerOnly: true,
  async execute(message, args, client) {
    const serverId = args[0];

    if (!serverId) {
      return message.reply('❌ الاستخدام: `$leave <server_id>`');
    }

    try {
      const guild = client.guilds.cache.get(serverId);
      
      if (!guild) {
        return message.reply('❌ لم يتم العثور على السيرفر. استخدم `$servers` لرؤية جميع السيرفرات.');
      }

      const guildName = guild.name;
      await guild.leave();
      message.reply(`✅ تمت مغادرة السيرفر: **${guildName}**`);
    } catch (error) {
      console.error('Error leaving server:', error);
      message.reply('❌ فشلت مغادرة السيرفر.');
    }
  }
};
