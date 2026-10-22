const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'jaillist',
  aliases: ['jailed', 'المسجونين'],
  description: 'عرض قائمة المسجونين - Show list of jailed members',
  permissions: PermissionFlagsBits.ModerateMembers,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    
    if (!global.jail[guildId] || Object.keys(global.jail[guildId]).length === 0) {
      return message.reply('❌ لا يوجد أعضاء مسجونين حالياً.\n❌ No members currently jailed.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🔒 قائمة المسجونين - Jailed Members List')
      .setColor('#FF0000')
      .setTimestamp();

    let description = '';
    for (const [userId, jailData] of Object.entries(global.jail[guildId])) {
      const member = await message.guild.members.fetch(userId).catch(() => null);
      const memberName = member ? member.user.tag : `User ID: ${userId}`;
      const jailedBy = await client.users.fetch(jailData.jailedBy).catch(() => null);
      const jailedByName = jailedBy ? jailedBy.tag : 'Unknown';
      
      const timeLeft = jailData.expiresAt 
        ? `⏱️ ${Math.ceil((jailData.expiresAt - Date.now()) / 60000)} دقيقة متبقية / minutes left`
        : '⏱️ دائم / Permanent';

      description += `\n**${memberName}**\n`;
      description += `📝 السبب | Reason: ${jailData.reason}\n`;
      description += `👮 بواسطة | By: ${jailedByName}\n`;
      description += `${timeLeft}\n`;
      description += `─────────────\n`;
    }

    embed.setDescription(description);
    await message.reply({ embeds: [embed] });
  }
};
