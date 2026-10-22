const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'عفو',
  aliases: ['pardon', 'unjail', 'release'],
  description: 'إطلاق سراح عضو من السجن - Release a member from jail',
  permissions: PermissionFlagsBits.ModerateMembers,
  botPermissions: PermissionFlagsBits.ManageRoles,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    
    if (!global.jail[guildId]) {
      return message.reply('❌ لا يوجد أعضاء مسجونين حالياً.\n❌ No members currently jailed.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ الاستخدام: `$عفو @العضو [السبب]`\nمثال: `$عفو @User تم العفو عنه`\n\n❌ Usage: `$عفو @member [reason]`\nExample: `$عفو @User pardoned`');
    }

    const jailData = global.jail[guildId][member.id];
    if (!jailData) {
      return message.reply('❌ هذا العضو غير مسجون!\n❌ This member is not jailed!');
    }

    const reason = args.slice(1).join(' ') || 'لا يوجد سبب - No reason provided';

    try {
      await member.roles.set(jailData.savedRoles);
    } catch (error) {
      return message.reply('❌ فشل في إطلاق سراح العضو! تحقق من الصلاحيات.\n❌ Failed to release member! Check permissions.');
    }

    delete global.jail[guildId][member.id];
    global.saveJail();

    const embed = new EmbedBuilder()
      .setTitle('🔓 إطلاق سراح - Member Released')
      .setColor('#00FF00')
      .addFields(
        { name: '👤 العضو | Member', value: `${member}`, inline: true },
        { name: '👮 بواسطة | By', value: `${message.author}`, inline: true },
        { name: '📝 السبب | Reason', value: reason, inline: false }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const logChannelId = global.jailConfig[guildId]?.jailLogId;
    if (logChannelId) {
      const logChannel = message.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    const jailChannelId = global.jailConfig[guildId]?.jailChatId;
    if (jailChannelId) {
      const jailChannel = message.guild.channels.cache.get(jailChannelId);
      if (jailChannel) {
        await jailChannel.send(`🔓 ${member} تم الإفراج عنك!\n📝 السبب: ${reason}\n\n🔓 ${member} You have been released!\n📝 Reason: ${reason}`);
      }
    }
  }
};
