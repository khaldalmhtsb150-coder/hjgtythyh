const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('اسجن')
    .setDescription('سجن عضو - Jail a member')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('العضو المراد سجنه - Member to jail')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('المدة (1m, 1h, 1d) - اختياري - Duration (optional)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('السبب - Reason')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async executeSlash(interaction, client) {
    const guildId = interaction.guild.id;
    
    if (!global.jailConfig[guildId] || !global.jailConfig[guildId].jailChatId) {
      return interaction.reply({ content: '❌ لم يتم إعداد نظام السجن بعد. استخدم `/setjailchat` أولاً.\n❌ Jail system not configured. Use `/setjailchat` first.', ephemeral: true });
    }

    const user = interaction.options.getUser('member');
    const member = await interaction.guild.members.fetch(user.id);
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'لا يوجد سبب - No reason provided';

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ لا يمكنك سجن نفسك!\n❌ You cannot jail yourself!', ephemeral: true });
    }

    if (member.id === client.user.id) {
      return interaction.reply({ content: '❌ لا يمكنك سجني!\n❌ You cannot jail me!', ephemeral: true });
    }

    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ لا يمكنك سجن مشرف!\n❌ You cannot jail an administrator!', ephemeral: true });
    }

    if (interaction.member.roles.highest.position <= member.roles.highest.position) {
      return interaction.reply({ content: '❌ لا يمكنك سجن شخص برتبة أعلى منك أو مساوية لك!\n❌ You cannot jail someone with equal or higher role!', ephemeral: true });
    }

    let duration = null;
    if (durationInput) {
      const durationMatch = durationInput.match(/^(\d+)([mhd])$/);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2];
        const multipliers = { m: 60000, h: 3600000, d: 86400000 };
        duration = value * multipliers[unit];
      } else {
        return interaction.reply({ content: '❌ صيغة المدة غير صحيحة! استخدم: 1m, 1h, 1d\n❌ Invalid duration format! Use: 1m, 1h, 1d', ephemeral: true });
      }
    }

    let jailedRole = interaction.guild.roles.cache.find(r => r.name === 'Jailed');
    if (!jailedRole) {
      try {
        jailedRole = await interaction.guild.roles.create({
          name: 'Jailed',
          color: '#000000',
          permissions: []
        });
      } catch (error) {
        return interaction.reply({ content: '❌ فشل في إنشاء رتبة السجن!\n❌ Failed to create Jailed role!', ephemeral: true });
      }
    }

    const jailChannel = interaction.guild.channels.cache.get(global.jailConfig[guildId].jailChatId);
    if (jailChannel) {
      try {
        await jailChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          ViewChannel: false
        });
        await jailChannel.permissionOverwrites.edit(jailedRole, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
      } catch (error) {
        console.error('Error setting jail channel permissions:', error);
      }
    }

    const savedRoles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id && role.id !== jailedRole.id)
      .map(role => role.id);

    try {
      await member.roles.set([jailedRole]);
    } catch (error) {
      return interaction.reply({ content: '❌ فشل في سجن العضو! تحقق من الصلاحيات.\n❌ Failed to jail member! Check permissions.', ephemeral: true });
    }

    if (!global.jail[guildId]) {
      global.jail[guildId] = {};
    }

    global.jail[guildId][member.id] = {
      jailedBy: interaction.user.id,
      jailedAt: Date.now(),
      duration: duration,
      expiresAt: duration ? Date.now() + duration : null,
      reason: reason,
      savedRoles: savedRoles
    };
    global.saveJail();

    if (duration) {
      setTimeout(async () => {
        if (global.jail[guildId] && global.jail[guildId][member.id]) {
          try {
            const targetMember = await interaction.guild.members.fetch(member.id);
            const jailData = global.jail[guildId][member.id];
            
            await targetMember.roles.set(jailData.savedRoles);
            delete global.jail[guildId][member.id];
            global.saveJail();

            if (jailChannel) {
              await jailChannel.send(`🔓 ${targetMember} تم الإفراج عنه تلقائياً (انتهت المدة)\n🔓 ${targetMember} has been automatically released (time expired)`);
            }
          } catch (error) {
            console.error('Error auto-releasing from jail:', error);
          }
        }
      }, duration);
    }

    const durationText = duration ? `\n⏱️ المدة | Duration: ${durationInput}` : '\n⏱️ المدة | Duration: دائم حتى العفو - Permanent until pardoned';

    const embed = new EmbedBuilder()
      .setTitle('🔒 سجن عضو - Member Jailed')
      .setColor('#FF0000')
      .addFields(
        { name: '👤 العضو | Member', value: `${member}`, inline: true },
        { name: '👮 بواسطة | By', value: `${interaction.user}`, inline: true },
        { name: '📝 السبب | Reason', value: reason, inline: false }
      )
      .setDescription(durationText)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const logChannelId = global.jailConfig[guildId].jailLogId;
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    if (jailChannel) {
      await jailChannel.send(`🔒 ${member} تم سجنك\n📝 السبب: ${reason}${durationText}\n\n🔒 ${member} You have been jailed\n📝 Reason: ${reason}${durationText}`);
    }
  }
};
