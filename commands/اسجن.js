const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'اسجن',
  aliases: ['jail'],
  description: 'سجن عضو - Jail a member',
  permissions: PermissionFlagsBits.ModerateMembers,
  botPermissions: PermissionFlagsBits.ManageRoles,
  async execute(message, args, client) {
    const guildId = message.guild.id;
    
    if (!global.jailConfig[guildId] || !global.jailConfig[guildId].jailChatId) {
      return message.reply('❌ لم يتم إعداد نظام السجن بعد. استخدم `$setjailchat` أولاً.\n❌ Jail system not configured. Use `$setjailchat` first.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ الاستخدام: `$اسجن @العضو [المدة] [السبب]`\nمثال: `$اسجن @User 1h spam`\nالمدة: 1m, 1h, 1d (اختياري)\n\n❌ Usage: `$اسجن @member [duration] [reason]`\nExample: `$اسجن @User 1h spam`\nDuration: 1m, 1h, 1d (optional)');
    }

    if (member.id === message.author.id) {
      return message.reply('❌ لا يمكنك سجن نفسك!\n❌ You cannot jail yourself!');
    }

    if (member.id === client.user.id) {
      return message.reply('❌ لا يمكنك سجني!\n❌ You cannot jail me!');
    }

    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ لا يمكنك سجن مشرف!\n❌ You cannot jail an administrator!');
    }

    if (message.member.roles.highest.position <= member.roles.highest.position) {
      return message.reply('❌ لا يمكنك سجن شخص برتبة أعلى منك أو مساوية لك!\n❌ You cannot jail someone with equal or higher role!');
    }

    let duration = null;
    let reason = 'لا يوجد سبب - No reason provided';
    
    if (args[1]) {
      const durationMatch = args[1].match(/^(\d+)([mhd])$/);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2];
        const multipliers = { m: 60000, h: 3600000, d: 86400000 };
        duration = value * multipliers[unit];
        reason = args.slice(2).join(' ') || reason;
      } else {
        reason = args.slice(1).join(' ');
      }
    }

    let jailedRole = message.guild.roles.cache.find(r => r.name === 'Jailed');
    if (!jailedRole) {
      try {
        jailedRole = await message.guild.roles.create({
          name: 'Jailed',
          color: '#000000',
          permissions: []
        });
      } catch (error) {
        return message.reply('❌ فشل في إنشاء رتبة السجن!\n❌ Failed to create Jailed role!');
      }
    }

    const jailChannel = message.guild.channels.cache.get(global.jailConfig[guildId].jailChatId);
    if (jailChannel) {
      try {
        await jailChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
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
      .filter(role => role.id !== message.guild.id && role.id !== jailedRole.id)
      .map(role => role.id);

    try {
      await member.roles.set([jailedRole]);
    } catch (error) {
      return message.reply('❌ فشل في سجن العضو! تحقق من الصلاحيات.\n❌ Failed to jail member! Check permissions.');
    }

    if (!global.jail[guildId]) {
      global.jail[guildId] = {};
    }

    global.jail[guildId][member.id] = {
      jailedBy: message.author.id,
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
            const targetMember = await message.guild.members.fetch(member.id);
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

    const durationText = duration ? `\n⏱️ المدة | Duration: ${args[1]}` : '\n⏱️ المدة | Duration: دائم حتى العفو - Permanent until pardoned';

    const embed = new EmbedBuilder()
      .setTitle('🔒 سجن عضو - Member Jailed')
      .setColor('#FF0000')
      .addFields(
        { name: '👤 العضو | Member', value: `${member}`, inline: true },
        { name: '👮 بواسطة | By', value: `${message.author}`, inline: true },
        { name: '📝 السبب | Reason', value: reason, inline: false }
      )
      .setDescription(durationText)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const logChannelId = global.jailConfig[guildId].jailLogId;
    if (logChannelId) {
      const logChannel = message.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    }

    if (jailChannel) {
      await jailChannel.send(`🔒 ${member} تم سجنك\n📝 السبب: ${reason}${durationText}\n\n🔒 ${member} You have been jailed\n📝 Reason: ${reason}${durationText}`);
    }
  }
};
