const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('عفو')
    .setDescription('إطلاق سراح عضو من السجن - Release a member from jail')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('العضو المراد إطلاق سراحه - Member to release')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('السبب - Reason')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    
    if (!global.jail[guildId]) {
      return interaction.reply({ content: '❌ لا يوجد أعضاء مسجونين حالياً.\n❌ No members currently jailed.', ephemeral: true });
    }

    const user = interaction.options.getUser('member');
    const member = await interaction.guild.members.fetch(user.id);
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب - No reason provided';

    const jailData = global.jail[guildId][member.id];
    if (!jailData) {
      return interaction.reply({ content: '❌ هذا العضو غير مسجون!\n❌ This member is not jailed!', ephemeral: true });
    }

    try {
      await member.roles.set(jailData.savedRoles);
    } catch (error) {
      return interaction.reply({ content: '❌ فشل في إطلاق سراح العضو! تحقق من الصلاحيات.\n❌ Failed to release member! Check permissions.', ephemeral: true });
    }

    delete global.jail[guildId][member.id];
    global.saveJail();

    const embed = new EmbedBuilder()
      .setTitle('🔓 إطلاق سراح - Member Released')
      .setColor('#00FF00')
      .addFields(
        { name: '👤 العضو | Member', value: `${member}`, inline: true },
        { name: '👮 بواسطة | By', value: `${interaction.user}`, inline: true },
        { name: '📝 السبب | Reason', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const logChannelId = global.jailConfig[guildId]?.jailLogId;
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    const jailChannelId = global.jailConfig[guildId]?.jailChatId;
    if (jailChannelId) {
      const jailChannel = interaction.guild.channels.cache.get(jailChannelId);
      if (jailChannel) {
        await jailChannel.send(`🔓 ${member} تم الإفراج عنك!\n📝 السبب: ${reason}\n\n🔓 ${member} You have been released!\n📝 Reason: ${reason}`);
      }
    }
  }
};
